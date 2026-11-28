// The reading and matching half of the survey import (Phase 12, 28 Nov 2026), kept apart from
// the part that talks to Sanity so it can be tested on its own. Used by import-survey-responses.js.
//
// PRIVACY: the survey's responses file has people's names, emails and phone numbers. This code looks only
// at the columns it recognises as the location and the three answers (type of initiative, what it offers,
// can it pay its own way), at a timestamp column (to make a stable key) and, in memory only, at the
// contact email and project name columns (to find rows that look like the same initiative sent twice).
// Nothing from those two columns is ever printed, stored or sent: the duplicate report names rows by
// number, country, type and date. Every other column is ignored.

import {createHash} from 'node:crypto'
import {countries} from '../schemaTypes/countries.mjs'
import {REGION_LATIN_AMERICA, continentOf} from '../schemaTypes/surveyOptions.mjs'

// ---- CSV (RFC 4180: quotes, commas and line breaks inside quotes, a byte order mark, \r\n)
export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ } else inQuotes = false
      } else cell += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell); cell = ''
      rows.push(row); row = []
    } else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

export const plain = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

// ---- Which column is which. An exact header (after plain()) wins; otherwise a pattern. Override one with an
// environment variable (COL_COUNTRY, COL_TYPE, COL_OFFERS, COL_SUSTAIN, COL_TIME, COL_EMAIL, COL_PROJECT)
// holding the exact header. `needed` columns stop the script when missing.
export const columnSpecs = {
  country: {exact: ['location', 'country'], re: /\blocation\b|\bcountry\b/, needed: true},
  type: {exact: ['what category does your project best fit into'], re: /best fit|what category|category does/, needed: true},
  offers: {exact: ['key features'], re: /key features/, needed: true},
  sustain: {exact: [], re: /financially self.?sustain|self.?sustain/, needed: true},
  time: {exact: ['timestamp'], re: /^timestamp$|^time stamp$/, needed: false},
  // used in memory only, to spot the same initiative sent twice
  email: {exact: [], re: /e ?mail/, needed: false},
  project: {exact: ['project name', 'initiative name', 'name of project', 'name of initiative'], re: /project name|initiative name|name of (the |your )?(project|initiative|organi[sz]ation)/, needed: false},
}

export function findColumns(headers, env = {}) {
  const found = {}
  const problems = []
  const plainHeaders = headers.map(plain)
  for (const [key, spec] of Object.entries(columnSpecs)) {
    const override = env[`COL_${key.toUpperCase()}`]
    let index = -1
    if (override) index = headers.findIndex((h) => h.trim() === override.trim())
    else {
      index = plainHeaders.findIndex((h) => spec.exact.includes(h))
      if (index < 0) {
        const hits = plainHeaders.map((h, i) => (spec.re.test(h) ? i : -1)).filter((i) => i >= 0)
        index = hits[0] ?? -1
        if (hits.length > 1 && spec.needed) problems.push(`${key}: ${hits.length} columns look like it, the first is used (set COL_${key.toUpperCase()} to choose)`)
      }
    }
    if (index >= 0) found[key] = index
    else if (spec.needed) problems.push(`${key}: no column found`)
  }
  return {found, problems}
}

// ---- Countries: the everyday name, a few spellings people use, and the Latin America region
const synonyms = {
  usa: 'US', us: 'US', 'u s a': 'US', 'united states of america': 'US', america: 'US', 'the united states': 'US',
  uk: 'GB', 'u k': 'GB', 'united kingdom': 'GB', england: 'GB', scotland: 'GB', wales: 'GB', 'great britain': 'GB', 'northern ireland': 'GB',
  uae: 'AE', 'united arab emirates': 'AE', russia: 'RU', 'russian federation': 'RU', turkey: 'TR', turkiye: 'TR',
  'south korea': 'KR', korea: 'KR', 'republic of korea': 'KR', 'north korea': 'KP', iran: 'IR', 'islamic republic of iran': 'IR',
  vietnam: 'VN', 'viet nam': 'VN', laos: 'LA', syria: 'SY', 'czech republic': 'CZ', czechia: 'CZ', 'ivory coast': 'CI', 'cote d ivoire': 'CI',
  tanzania: 'TZ', 'united republic of tanzania': 'TZ', bolivia: 'BO', venezuela: 'VE', brunei: 'BN', moldova: 'MD', palestine: 'PS', 'state of palestine': 'PS',
  'the netherlands': 'NL', holland: 'NL', 'hong kong': 'HK', taiwan: 'TW', macedonia: 'MK', 'north macedonia': 'MK', swaziland: 'SZ', eswatini: 'SZ',
  'cabo verde': 'CV', 'cape verde': 'CV', 'dr congo': 'CD', drc: 'CD', 'democratic republic of the congo': 'CD', 'democratic republic of congo': 'CD',
  phillipines: 'PH', philipines: 'PH', phillippines: 'PH', 'the philippines': 'PH',
  'latin america': REGION_LATIN_AMERICA, 'latin america region': REGION_LATIN_AMERICA, latam: REGION_LATIN_AMERICA, 'south america': REGION_LATIN_AMERICA,
}
const byName = new Map(countries.map((c) => [plain(c.name), c.code]))

export function countryCode(value) {
  const key = plain(value)
  if (!key) return null
  return synonyms[key] ?? byName.get(key) ?? null
}

// Places people wrote instead of a country (a state, a region, a village). Only used when no country name
// is found in the text; each is a whole-word match. Extend as the dry run reports places it did not know.
const placeHints = {
  IN: ['ladakh', 'leh', 'hanle', 'kashmir', 'jammu', 'kerala', 'tamil nadu', 'karnataka', 'maharashtra', 'rajasthan', 'gujarat', 'uttarakhand', 'himachal pradesh', 'himachal', 'sikkim', 'assam', 'odisha', 'west bengal', 'delhi', 'mumbai', 'pune', 'chennai', 'hyderabad', 'bengaluru', 'bangalore', 'madhya pradesh', 'uttar pradesh', 'andhra pradesh', 'telangana', 'arunachal pradesh', 'meghalaya'],
  ZA: ['karoo', 'sutherland', 'western cape', 'eastern cape', 'northern cape', 'kwazulu natal', 'kwazulu', 'limpopo', 'mpumalanga', 'gauteng', 'free state', 'north west province', 'cape town', 'johannesburg', 'pretoria', 'durban'],
  RS: ['vidojevica'],
  PE: ['marangani', 'cusco', 'cuzco', 'arequipa', 'puno', 'lima'],
  IR: ['garmabdar', 'tehran', 'isfahan', 'shiraz', 'tabriz'],
  BR: ['chapada dos veadeiros', 'sao paulo', 'minas gerais', 'rio de janeiro', 'bahia'],
  AU: ['south australia', 'new south wales', 'queensland', 'tasmania', 'western australia', 'northern territory', 'sydney', 'melbourne', 'perth', 'adelaide', 'brisbane'],
  US: ['mt', 'montana', 'arizona', 'texas', 'california', 'new mexico', 'utah', 'nevada', 'colorado', 'hawaii', 'florida', 'new york', 'wyoming', 'idaho', 'oregon', 'washington state'],
  CA: ['ontario', 'quebec', 'alberta', 'british columbia', 'nova scotia', 'manitoba', 'saskatchewan', 'new brunswick'],
  NZ: ['tekapo', 'aoraki', 'mackenzie'],
  CL: ['atacama', 'san pedro de atacama', 'elqui', 'coquimbo'],
  MX: ['baja california', 'oaxaca', 'chiapas', 'yucatan', 'jalisco'],
  ID: ['bali', 'java', 'sumatra', 'sulawesi', 'borneo', 'lombok', 'yogyakarta', 'jakarta'],
  NG: ['kano', 'lagos', 'abuja'],
}
const hintIndex = Object.entries(placeHints).flatMap(([code, list]) => list.map((term) => [` ${term} `, code]))

// Turns the free-text "Location" cell into a country code. Tries the whole text, then each part split at
// commas, full stops, slashes, brackets and spaced dashes (last part first, because the country is usually
// last), then the last one to four words of each part ("Kano Nigeria"), then the place hints.
export function locationToCountry(value) {
  const text = String(value ?? '').trim()
  if (!text) return {code: null, how: 'empty'}
  const whole = countryCode(text)
  if (whole) return {code: whole, how: 'name'}
  const parts = text.split(/[,;.\/()\n]|\s[-\u2013\u2014]\s/).map((p) => p.trim()).filter(Boolean).reverse()
  for (const part of parts) {
    const code = countryCode(part)
    if (code) return {code, how: 'part'}
  }
  for (const part of parts) {
    const words = plain(part).split(' ').filter(Boolean)
    for (let n = Math.min(4, words.length); n >= 1; n--) {
      const code = countryCode(words.slice(-n).join(' '))
      if (code) return {code, how: 'last words'}
    }
  }
  for (const part of parts) {
    const hay = ` ${plain(part)} `
    for (const [term, code] of hintIndex) if (hay.includes(term)) return {code, how: 'place hint'}
  }
  return {code: null, how: 'unknown'}
}

// ---- Answers: matched on the form's own wording, as specific phrases, so a respondent's free text (for
// example "Training courses" typed into an "other" box) is not mistaken for an option. Anything that matches
// nothing is counted and reported, never guessed.
const typeRules = [
  ['tourism-business', /tourism business/],
  ['national-strategy', /national astrotourism strategy|national strategy/],
  ['observatory', /observatory facilit|^observatory$/],
  ['passion-project', /passion project/],
  ['planetarium', /planetarium/],
  ['something-else', /none of the above|something else/],
]
const offerRules = [
  ['stargazing-tours', /stargazing tours?/],
  ['astronomy-talks', /astronom\w* (lectures?|talks?)|lectures? or talks?/],
  ['festivals-events', /astronomy festivals?|festivals? or events?/],
  ['light-pollution', /light pollution/],
  ['cultural-astronomy', /cultural astronomy/],
  ['camping-glamping', /camping or glamping|camping|glamping/],
  ['celestial-events', /celestial events?|meteor showers?/],
  ['observatory-visits', /observatory fac|observatory visits?/],
  ['astro-ecotourism', /astro ?eco ?tourism/],
  ['astrotourism-training', /astrotourism training/],
]

export function mapType(cell) {
  const text = plain(cell)
  if (!text) return {value: null, unmatched: false}
  const hits = typeRules.filter(([, re]) => re.test(text)).map(([v]) => v)
  // one choice is expected; if two groups' words appear, "none of the above" is not one of them
  const real = hits.filter((v) => v !== 'something-else')
  if (real.length === 1) return {value: real[0], unmatched: false}
  if (!real.length && hits.includes('something-else')) return {value: 'something-else', unmatched: false}
  return {value: null, unmatched: true}
}

export function mapOffers(cell) {
  const text = plain(cell)
  if (!text) return {values: [], unmatched: false}
  const values = offerRules.filter(([, re]) => re.test(text)).map(([v]) => v)
  return {values, unmatched: !values.length}
}

export function mapSustain(cell) {
  const text = plain(cell)
  if (!text) return {value: 'not-said', unmatched: false}
  const flags = {
    yes: /^yes\b/.test(text),
    hoping: /\bhope\b|\bhoping\b|self sustaining in the future|not yet/.test(text),
    no: /rely on|external funding|outside funding/.test(text),
  }
  const on = Object.keys(flags).filter((k) => flags[k])
  if (on.length === 1) return {value: on[0], unmatched: false}
  if (!on.length && text === 'no') return {value: 'no', unmatched: false}
  // a cell holding two answers (or none we know) is reported and counted as "did not say"
  return {value: 'not-said', unmatched: true}
}

const sha = (s) => createHash('sha1').update(s).digest('hex')

// Rows that look like the same initiative sent twice: the same contact email and country, or the same project
// name and country. Found in memory only; the report names rows by number, never by who or what they are.
// Different initiatives can share a contact, so nothing is removed automatically: the person decides, with
// SKIP_ROWS (sheet row numbers, header = row 1).
function findDuplicateGroups(candidates) {
  const groups = []
  const seen = new Set()
  for (const [field, why] of [['email', 'same contact email and country'], ['project', 'same project name and country']]) {
    const by = new Map()
    for (const c of candidates) {
      const v = field === 'email' ? String(c.email || '').toLowerCase().trim() : plain(c.project)
      if (!v || v.length < 3) continue
      const k = `${v}|${c.country}`
      by.set(k, [...(by.get(k) || []), c])
    }
    for (const list of by.values()) {
      if (list.length < 2) continue
      const id = list.map((c) => c.rowNumber).join(',')
      if (seen.has(id)) continue
      seen.add(id)
      groups.push({why, rows: list.map(({rowNumber, country, type, stamp}) => ({rowNumber, country, type, date: stamp})) })
    }
  }
  return groups
}

// Turns the file into responses and a report of what could not be matched. `env.SKIP_ROWS` is a list of sheet
// row numbers to leave out (for example "12,40"). Nothing from any other column is kept.
export function readResponses(rows, env = {}) {
  const headers = rows[0] || []
  const {found, problems} = findColumns(headers, env)
  if (problems.some((p) => /no column found/.test(p))) return {headers, found, problems, responses: [], skipped: {}, unmatched: {}, duplicates: [], fatal: true}
  const skipRows = new Set(String(env.SKIP_ROWS || '').split(/[,\s]+/).map(Number).filter(Boolean))
  const responses = []
  const candidates = []
  const skipped = {emptyCountry: 0, unknownCountry: new Map(), noType: 0, excluded: 0}
  const unmatched = {type: 0, offers: 0, sustain: 0}
  const hints = {byHint: 0}
  const usedKeys = new Set()
  let index = 0
  for (const row of rows.slice(1)) {
    index += 1
    const rowNumber = index + 1
    if (skipRows.has(rowNumber)) { skipped.excluded += 1; continue }
    const locationRaw = (row[found.country] ?? '').trim()
    if (!locationRaw) { skipped.emptyCountry += 1; continue }
    const where = locationToCountry(locationRaw)
    if (!where.code) {
      // the place is not printed in full: only a short start, so a stray personal detail does not spread
      const shown = locationRaw.length > 40 ? locationRaw.slice(0, 40) + '...' : locationRaw
      skipped.unknownCountry.set(`row ${rowNumber}: ${shown}`, 1)
      continue
    }
    if (where.how === 'place hint') hints.byHint += 1
    const type = mapType(row[found.type])
    if (type.unmatched) unmatched.type += 1
    if (!type.value) { skipped.noType += 1; continue }
    const offers = mapOffers(row[found.offers])
    if (offers.unmatched) unmatched.offers += 1
    const sustain = mapSustain(row[found.sustain])
    if (sustain.unmatched) unmatched.sustain += 1
    const stamp = found.time !== undefined ? (row[found.time] ?? '').trim() : ''
    // A stable key: the time the response was submitted (not personal on its own), or the row number. If two
    // rows have the same time, the second also uses its row number so neither is lost.
    let keySource = stamp ? `time:${stamp}` : `row:${rowNumber}`
    if (usedKeys.has(keySource)) keySource += `|row:${rowNumber}`
    usedKeys.add(keySource)
    const importKey = sha(keySource).slice(0, 16)
    const country = where.code
    responses.push({importKey, rowNumber, country, continent: continentOf(country), type: type.value, offers: offers.values, sustainability: sustain.value})
    candidates.push({rowNumber, country, type: type.value, stamp, email: found.email !== undefined ? row[found.email] : '', project: found.project !== undefined ? row[found.project] : ''})
  }
  const duplicates = findDuplicateGroups(candidates)
  return {headers, found, problems, responses, skipped, unmatched, duplicates, hints, fatal: false}
}

// The same counting the page does (build/survey.js), for the report the script prints
export function summarise(responses) {
  const count = (list) => list.reduce((m, k) => m.set(k, (m.get(k) || 0) + 1), new Map())
  const countries = count(responses.map((r) => r.country))
  return {
    answers: responses.length,
    countries: [...countries.keys()].filter((c) => c !== REGION_LATIN_AMERICA).length,
    continents: count(responses.map((r) => r.continent)),
    types: count(responses.map((r) => r.type)),
    offers: count(responses.flatMap((r) => r.offers)),
    sustain: count(responses.map((r) => r.sustainability)),
    byCountry: countries,
  }
}
