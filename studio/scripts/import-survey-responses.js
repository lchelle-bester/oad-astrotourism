// One-off import of the survey responses you already have (Phase 12, 28 Nov 2026), so the Global Survey
// Report page starts from real, validated data. Each row of the file becomes one anonymous "Survey
// response" document: country, type of initiative, what it offers and whether it can pay its own way.
//
// PRIVACY: the responses file has contact details. This script only looks at the columns it recognises as
// the location and the three answers, at a timestamp (to make a stable key) and, in memory only, at the
// contact email and project name (to spot the same initiative sent twice). Those two are never printed or
// sent anywhere; every other column is ignored. Sanity's dataset is public, so nothing but the country and
// the three answers is ever written.
//
// Save the responses as a CSV file first (in Google Sheets: File, Download, Comma-separated values; in Excel:
// Save As, CSV UTF-8). Then, from the studio folder, in PowerShell:
//
//   1. See which columns it finds (prints the column titles only, no answers):
//        $env:SURVEY_CSV="C:\path\to\responses.csv"; $env:HEADERS=1; npx sanity exec scripts/import-survey-responses.js --with-user-token
//   2. Dry run: reads the file and prints the counts the page would show (nothing is changed):
//        $env:SURVEY_CSV="C:\path\to\responses.csv"; Remove-Item Env:HEADERS; npx sanity exec scripts/import-survey-responses.js --with-user-token
//   3. Do it:
//        $env:WRITE=1; npx sanity exec scripts/import-survey-responses.js --with-user-token
//
// It uses your own Sanity login (--with-user-token), so no token is ever put in a file. It never
// overwrites: a response that is already in Sanity (same key) is left alone, so running it twice is safe.
// If a column is not found, or the wrong one is used, set its exact title: COL_COUNTRY (the Location
// column), COL_TYPE, COL_OFFERS, COL_SUSTAIN, COL_TIME, COL_EMAIL or COL_PROJECT (for example
// $env:COL_COUNTRY="Where is it?"). To leave out rows that are the same initiative sent twice, list their
// sheet row numbers (the header is row 1) after looking at the duplicate report:  $env:SKIP_ROWS="12,40"
// (and Remove-Item Env:SKIP_ROWS to clear it).
import fs from 'node:fs'
import {getCliClient} from 'sanity/cli'
import {parseCsv, readResponses, summarise} from './survey-import-lib.mjs'
import {initiativeTypes, initiativeOffers, sustainabilityAnswers, continents, regions} from '../schemaTypes/surveyOptions.mjs'
import {countries} from '../schemaTypes/countries.mjs'

const write = process.env.WRITE === '1'
const file = process.env.SURVEY_CSV || process.argv.find((a) => /\.csv$/i.test(a))
if (!file || !fs.existsSync(file)) {
  console.log('Tell me which file: set SURVEY_CSV to the path of the CSV file, for example  $env:SURVEY_CSV="C:\\Users\\you\\Downloads\\responses.csv"')
  process.exit(1)
}

const rows = parseCsv(fs.readFileSync(file, 'utf8'))
console.log(`Read ${rows.length - 1} rows and ${rows[0]?.length ?? 0} columns from ${file.split(/[\\/]/).pop()}.`)

if (process.env.HEADERS === '1') {
  console.log('\nColumn titles (numbered):')
  rows[0].forEach((h, i) => console.log(`  ${String(i + 1).padStart(2)}. ${h.length > 110 ? h.slice(0, 110) + '...' : h}`))
  console.log('\nNothing else is read. Run again without HEADERS to see what it would import.')
  process.exit(0)
}

const result = readResponses(rows, process.env)
const names = {
  country: 'Location', type: 'Type of initiative', offers: 'What it offers', sustain: 'Can it pay its own way', time: 'Timestamp (for a stable key)',
  email: 'Contact email (only to spot duplicates, never shown)', project: 'Project name (only to spot duplicates, never shown)',
}
console.log('\nColumns used (the only ones read):')
for (const [key, label] of Object.entries(names)) {
  const i = result.found[key]
  console.log(`  ${label}: ${i === undefined ? '(none)' : `column ${i + 1}, "${result.headers[i].length > 80 ? result.headers[i].slice(0, 80) + '...' : result.headers[i]}"`}`)
}
if (result.problems.length) {
  console.log('\nProblems:')
  result.problems.forEach((p) => console.log('  - ' + p))
}
if (result.fatal) {
  console.log('\nStopped: a needed column was not found. Run again with HEADERS=1 to see the column titles, then set COL_COUNTRY / COL_TYPE / COL_OFFERS / COL_SUSTAIN to the exact title.')
  process.exit(1)
}

const {responses, skipped, unmatched, duplicates, hints} = result
const s = summarise(responses)
const label = (list, value) => list.find((x) => x.value === value)?.title ?? value
const countryNameOf = (code) => regions.find((r) => r.code === code)?.name ?? countries.find((c) => c.code === code)?.name ?? code
const pct = (n, total) => `${Math.round((100 * n) / total)}%`

console.log(`\n${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}`)
console.log(`\nWould import ${s.answers} responses from ${s.countries} countries on ${s.continents.size} continents.`)
console.log('\nBy continent:')
for (const c of continents) if (s.continents.get(c.value)) console.log(`  ${c.title.padEnd(14)} ${String(s.continents.get(c.value)).padStart(3)}  ${pct(s.continents.get(c.value), s.answers)}`)
console.log('\nTop countries:')
;[...s.byCountry].sort((a, b) => b[1] - a[1] || countryNameOf(a[0]).localeCompare(countryNameOf(b[0]))).slice(0, 8).forEach(([code, n]) => console.log(`  ${countryNameOf(code).padEnd(24)} ${n}`))
console.log(`\nType of initiative (one choice each, ${s.answers} responses):`)
for (const t of initiativeTypes) console.log(`  ${t.title.padEnd(32)} ${String(s.types.get(t.value) || 0).padStart(3)}`)
console.log('\nWhat they offer (share of responses):')
for (const o of initiativeOffers) console.log(`  ${o.title.slice(0, 40).padEnd(42)} ${String(s.offers.get(o.value) || 0).padStart(3)}  ${pct(s.offers.get(o.value) || 0, s.answers)}`)
console.log('\nCan they pay their own way:')
for (const a of sustainabilityAnswers) console.log(`  ${a.title.padEnd(32)} ${String(s.sustain.get(a.value) || 0).padStart(3)}`)

console.log('\nNot imported:')
console.log(`  rows with no location: ${skipped.emptyCountry}`)
console.log(`  rows left out by SKIP_ROWS: ${skipped.excluded}`)
console.log(`  rows with a type of initiative that matched nothing: ${skipped.noType}`)
if (skipped.unknownCountry.size) {
  console.log('  rows whose location did not give a country (tell me the place, or fix the cell and export again):')
  for (const [name] of skipped.unknownCountry) console.log(`    ${name}`)
} else console.log('  rows whose location did not give a country: 0')
console.log(`\nCountry found from a place name (a state or town, not a country): ${hints.byHint} rows`)
console.log(`Answers I could not match (those rows are still imported where they could be): type ${unmatched.type}, offers ${unmatched.offers}, can-it-pay ${unmatched.sustain}`)

if (duplicates.length) {
  console.log(`\nPossible duplicates (${duplicates.length} groups). Nothing is removed for you: different initiatives can share a contact.`)
  console.log('Look at these rows in the sheet (row numbers, header = row 1) and put the row number of each copy to drop in SKIP_ROWS.')
  for (const g of duplicates) {
    console.log(`  ${g.why}:`)
    for (const r of g.rows) console.log(`    row ${r.rowNumber}  ${r.country}  ${r.type}  ${r.date}`)
  }
} else console.log('\nPossible duplicates: none found.')
console.log('\nCompare with the mock-up: 83 initiatives, 37 countries, 6 continents (Asia 33, South America 20, Africa 12, North America 10, Europe 7, Oceania 1).')

const client = getCliClient({apiVersion: '2024-01-01'})
const existing = await client.fetch('count(*[_type == "surveyResponse"])')
console.log(`\nSurvey responses already in Sanity: ${existing}`)
if (!write) {
  console.log('Nothing was changed. If the counts look right, run again with WRITE=1.')
  process.exit(0)
}

let created = 0
let already = 0
let batch = client.transaction()
let inBatch = 0
for (const r of responses) {
  const doc = {_id: `surveyResponse-${r.importKey}`, _type: 'surveyResponse', country: r.country, type: r.type, offers: r.offers, sustainability: r.sustainability, importKey: r.importKey}
  batch = batch.createIfNotExists(doc)
  inBatch += 1
  if (inBatch === 50) {
    await batch.commit()
    batch = client.transaction()
    inBatch = 0
  }
}
if (inBatch) await batch.commit()
const after = await client.fetch('count(*[_type == "surveyResponse"])')
created = after - existing
already = responses.length - created
console.log(`\nDone: ${created} responses created, ${already} were already there. Survey responses now in Sanity: ${after}.`)
console.log('Next: open Pages, Global Survey Report page in the Studio, fill it in (or run its fill script), publish, then run node build/build.js.')
