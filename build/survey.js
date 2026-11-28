// The Global Survey Report page (Phase 12, 28 Nov 2026; design in docs/survey-report/, from L'chelle's two
// mock-ups). Loads the published "Survey response" documents and the one "Global Survey Report page"
// document from Sanity, counts everything, and draws the page (/projects/survey-report/) the way course.js
// and impact.js do for theirs.
//
// THE NUMBERS ARE NEVER TYPED. Each survey response is one anonymous document (country and the answers,
// nothing personal: Sanity's dataset is public). This file counts them: the totals, the continents, the
// shares, the donuts, the bars and the dots on the map. A new response is a new document and the next build
// has new numbers. The sentences that name the biggest groups are also written here from the counts, so
// they can never say something the numbers do not ("Most initiatives are tourism businesses" is only
// written when more than half of them are). The editors' own wording (notes, introduction, button) is in
// Sanity.
//
// Fixed here, not in Sanity: the h1 "Global Survey Report", the five section headings and their small
// labels, the unit words ("answers", "groups", "on the way"), and the lines that carry the counted
// sentences. Every piece of text from Sanity goes through escapeHtml.

const path = require('path')
const {pathToFileURL} = require('url')
const positionsFile = require('./map-positions.json')

const PAGE_FILE = 'projects/survey-report/index.html'
const PAGE_PATH = '/projects/survey-report/'

const PAGE_QUERY =
  '*[_id == "surveyReportPage"][0]{intro, statusLine, surveyUrl, buttonLabel, responsesNote, groupingNote, offersNote, ' +
  'sustainabilityIntro, sustainabilityNote, partnersText, ctaHeading, ctaText}'
const RESPONSES_QUERY = '*[_type == "surveyResponse"]{_id, country, type, offers, sustainability}'

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const paragraphs = (value) => String(value ?? '').split(/\n\s*\n/).map(clean).filter(Boolean)
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const plural = (n, one, many) => (n === 1 ? one : many || `${one}s`)

// "a", "a and b", "a, b and c"
const joinList = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`)

// The map is cut a little at the top (the Arctic has no dots): from 72 degrees north down to the bottom of the
// drawing. build/make-world-map.js draws the whole world, so a position is converted to the cut frame here.
const MAP_NORTH_CUT = 72
const mercator = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const frame = positionsFile.frame
const cutTop = (mercator(frame.north) - mercator(MAP_NORTH_CUT)) / (mercator(frame.north) - mercator(frame.south)) // 0 to 1
const MAP_ASPECT = positionsFile.width / (positionsFile.height * (1 - cutTop)) // width over height of the cut map

// ---- Counting ------------------------------------------------------------------------------------

// The items with the highest counts: everything tied for first, and, if that is fewer than `want`, the next
// tier too, as long as the whole tier fits. Never cuts a tie in half, so a sentence never picks one of two
// equal groups at random.
function leaders(sorted, want) {
  const tiers = []
  for (const item of sorted) {
    const last = tiers[tiers.length - 1]
    if (last && last[0].count === item.count) last.push(item)
    else tiers.push([item])
  }
  const out = []
  for (const tier of tiers) {
    if (out.length + tier.length > want && out.length) break
    out.push(...tier)
    if (out.length >= want) break
  }
  return {items: out, tiers}
}

// Counts the responses. `o` holds the shared option lists (surveyOptions.mjs, countries.mjs).
function compute(responses, o) {
  const n = responses.length
  const pct = (count) => Math.round((100 * count) / n)
  const countryName = (code) => o.regions.find((r) => r.code === code)?.name ?? o.countries.find((c) => c.code === code)?.name ?? code
  const tally = (list) => list.reduce((m, k) => m.set(k, (m.get(k) || 0) + 1), new Map())
  // Highest first, ties in the fixed order of the list the options came from
  const rank = (items) => items.map((x, i) => ({...x, order: i})).sort((a, b) => b.count - a.count || a.order - b.order)

  const byCountryMap = tally(responses.map((r) => r.country))
  const byCountry = [...byCountryMap]
    .map(([code, count]) => ({code, name: countryName(code), count, continent: o.continentOf(code), isRegion: o.regions.some((r) => r.code === code)}))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  const regionCount = byCountry.filter((c) => c.isRegion).length
  const countryCount = byCountry.length - regionCount

  const continentTally = tally(responses.map((r) => o.continentOf(r.country)))
  const continents = rank(o.continents.map((c, i) => ({value: c.value, title: c.title, swatch: i + 1, count: continentTally.get(c.value) || 0}))).map((c) => ({...c, pct: pct(c.count)}))

  const typeTally = tally(responses.map((r) => r.type))
  const types = rank(o.initiativeTypes.map((t, i) => ({value: t.value, title: t.title, plural: t.plural, swatch: i + 1, count: typeTally.get(t.value) || 0}))).map((t) => ({...t, pct: pct(t.count)}))

  const offerTally = tally(responses.flatMap((r) => r.offers))
  const offers = rank(o.initiativeOffers.map((x) => ({value: x.value, title: x.title, short: x.short, count: offerTally.get(x.value) || 0}))).map((x) => ({...x, pct: pct(x.count)}))

  const sustainTally = tally(responses.map((r) => r.sustainability))
  const sustain = o.sustainabilityAnswers.map((a, i) => ({value: a.value, title: a.title, onTheWay: a.onTheWay, swatch: i + 1, count: sustainTally.get(a.value) || 0})).map((a) => ({...a, pct: pct(a.count)}))
  const onTheWay = sustain.filter((a) => a.onTheWay).reduce((sum, a) => sum + a.count, 0)

  return {n, countryCount, regionCount, continents, types, offers, sustain, byCountry, onTheWay, onTheWayPct: pct(onTheWay)}
}

// ---- The sentences that name the biggest groups, written from the counts --------------------------------

function leadContinents(s) {
  const active = s.continents.filter((c) => c.count > 0)
  const {items} = leaders(active, 2)
  // four or more continents level at the top: none stands out, and naming one would be arbitrary
  if (items.length > 3) return `The answers are spread evenly across ${active.length} continents.`
  const names = items
  const share = names.reduce((sum, c) => sum + c.count, 0) / s.n
  const opening = `${share > 0.5 ? 'Most' : 'The most'} answers so far come from ${joinList(names.map((c) => c.title))}`
  // the countries that sent the most, only the real countries (a region such as Latin America is not one)
  const real = s.byCountry.filter((c) => !c.isRegion)
  if (!real.length) return `${opening}.`
  const top = leaders(real, 1).tiers
  const first = top[0]
  const second = top[1]
  let tail = ''
  if (first.length >= 2) tail = first.length <= 3 ? `, with ${joinList(first.map((c) => c.name))} sending the most` : ''
  else {
    tail = `, with ${first[0].name} sending the most`
    if (second && second.length <= 2) tail += `, followed by ${joinList(second.map((c) => c.name))}`
  }
  return `${opening}${tail}.`
}

function leadTypes(s) {
  const active = s.types.filter((t) => t.count > 0)
  const tiers = leaders(active, 1).tiers
  const first = tiers[0]
  const second = tiers[1]
  let opening
  if (first.length === 1) opening = first[0].count / s.n > 0.5 ? `Most initiatives are ${first[0].plural}` : `The biggest group is ${first[0].plural}`
  else opening = first.length <= 3 ? `The biggest groups are ${joinList(first.map((t) => t.plural))}` : 'The answers are spread evenly across the groups'
  const tail = second && second.length <= 2 && first.length <= 2 ? `, followed by ${joinList(second.map((t) => t.plural))}` : ''
  return `${opening}${tail}.`
}

function leadOffers(s) {
  const active = s.offers.filter((x) => x.count > 0)
  // the top two (or everything tied at the top, up to three), then the next one on its own if there is one
  const {items, tiers} = leaders(active, 2)
  if (items.length > 3) return 'The offers are spread evenly, so no single one stands out.'
  const be = items.length === 1 ? 'is' : 'are'
  const next = tiers.find((tier) => tier[0].count < items[items.length - 1].count)
  const tail = next && next.length === 1 ? `, followed by ${next[0].short}` : ''
  return `${cap(joinList(items.map((x) => x.short)))} ${be} the most common${tail}.`
}

function leadSustain(s) {
  const share = s.onTheWay / s.n
  if (share > 0.5) return 'Most already are, or hope to be soon.'
  if (share === 0.5) return 'Half already are, or hope to be soon.'
  return 'Fewer than half already are, or hope to be soon.'
}

// ---- Loading and checking ----------------------------------------------------------------------------

// Reads the page and the responses and counts them. Returns null if the page has not been published, or
// there are no responses yet (the page is then left out and the build says so). Stops the build with a clear
// message if the page is published but cannot be drawn, so a bad entry never reaches the site silently.
async function loadSurvey({sanityQuery, safeUrl, root}) {
  const row = await sanityQuery(PAGE_QUERY)
  if (!row) return null
  const options = await import(pathToFileURL(path.join(root, 'studio', 'schemaTypes', 'surveyOptions.mjs')).href)
  const {countries} = await import(pathToFileURL(path.join(root, 'studio', 'schemaTypes', 'countries.mjs')).href)
  const fail = (message) => {
    throw new Error(`Global Survey Report page: ${message}`)
  }
  const need = (value, what) => {
    if (!clean(value)) fail(`${what} is empty. Fill it in in the Studio.`)
    return clean(value)
  }
  const surveyUrl = safeUrl(row.surveyUrl, ['https:'])
  if (!surveyUrl) fail('the survey form address is not a web address starting with https://.')

  const page = {
    intro: need(row.intro, 'the introduction'),
    statusLine: need(row.statusLine, 'the line above the survey button'),
    surveyUrl,
    buttonLabel: need(row.buttonLabel, 'the button words'),
    responsesNote: paragraphs(need(row.responsesNote, 'the note under where the answers come from')),
    groupingNote: paragraphs(need(row.groupingNote, 'the "How we grouped the answers" text')),
    offersNote: paragraphs(need(row.offersNote, 'the note under what they offer')),
    sustainabilityIntro: paragraphs(need(row.sustainabilityIntro, 'the first paragraph of the pay-their-own-way section')),
    sustainabilityNote: clean(row.sustainabilityNote),
    partnersText: paragraphs(need(row.partnersText, 'the "Who they work with" paragraph')),
    ctaHeading: need(row.ctaHeading, 'the heading of the last section'),
    ctaText: need(row.ctaText, 'the sentence of the last section'),
  }

  const rows = (await sanityQuery(RESPONSES_QUERY)) || []
  const knownCountry = new Set([...countries.map((c) => c.code), ...options.regions.map((r) => r.code)])
  const knownType = new Set(options.initiativeTypes.map((t) => t.value))
  const knownOffer = new Set(options.initiativeOffers.map((x) => x.value))
  const knownSustain = new Set(options.sustainabilityAnswers.map((a) => a.value))
  const responses = []
  for (const r of rows) {
    const where = `survey response ${r._id}`
    if (!knownCountry.has(r.country)) fail(`${where} has a country that is not in the list ("${clean(r.country)}"). Open it in the Studio and choose one.`)
    if (!knownType.has(r.type)) fail(`${where} has no valid type of initiative. Open it in the Studio and choose one.`)
    const offers = Array.isArray(r.offers) ? r.offers : []
    for (const v of offers) if (!knownOffer.has(v)) fail(`${where} has an offer that is not in the list ("${clean(v)}").`)
    if (new Set(offers).size !== offers.length) fail(`${where} lists the same offer twice.`)
    const sustainability = r.sustainability || 'not-said'
    if (!knownSustain.has(sustainability)) fail(`${where} has an answer to "can they pay their own way" that is not in the list ("${clean(sustainability)}").`)
    // A country with no continent among the six (Antarctica and its territories) cannot be charted: left out with a warning
    if (!options.continents.some((c) => c.value === options.continentOf(r.country))) {
      console.warn(`WARNING, Global Survey Report page: ${where} is from a place with no continent among the six (${r.country}), so it is not counted.`)
      continue
    }
    responses.push({country: r.country, type: r.type, offers, sustainability})
  }
  if (!responses.length) return {page, stats: null}
  return {page, stats: compute(responses, {...options, countries})}
}

// ---- Drawing -----------------------------------------------------------------------------------------

// A ring made of one circle per slice: a dash as long as the slice (less a small gap), moved round to where the
// slice starts. Drawn from the top, clockwise. Decorative (aria-hidden): the legend beside it carries the numbers.
// Each slice has a <title>, so hovering it with a mouse shows what it is, for example "Asia: 33 answers (40%)"
// (L'chelle, 28 Nov 2026). The list beside the ring says the same for keyboards and screen readers.
function donut(items, centre, h, unit) {
  const R = 91
  const C = 2 * Math.PI * R
  const GAP = 3 // the dark space between two slices, in drawing units
  const used = items.filter((x) => x.count > 0)
  const total = used.reduce((sum, x) => sum + x.count, 0)
  let at = 0
  const circles = used
    .map((x) => {
      const len = (x.count / total) * C
      const dash = used.length === 1 ? C : Math.max(len - GAP, 0.5)
      const circle = `<circle class="survey-donut__slice" data-s="${x.swatch}" cx="110" cy="110" r="${R}" stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}" stroke-dashoffset="${(-at).toFixed(2)}"><title>${h.escapeHtml(`${x.title}: ${x.count} ${x.count === 1 ? unit.replace(/s$/, '') : unit} (${x.pct}%)`)}</title></circle>`
      at += len
      return circle
    })
    .join('')
  return `<div class="survey-donut">
          <svg class="survey-donut__ring" viewBox="0 0 220 220" aria-hidden="true" focusable="false"><g transform="rotate(-90 110 110)">${circles}</g></svg>
          <p class="survey-donut__centre"><span class="survey-donut__big">${h.escapeHtml(centre.big)}</span><span class="survey-donut__small">${h.escapeHtml(centre.small)}</span></p>
        </div>`
}

// The list beside a donut: a swatch, the name, the count and the share. The unit is said to screen readers.
function legendList(items, unit, h) {
  return `<ul class="survey-legend-list" role="list">${items
    .filter((x) => x.count > 0)
    .map(
      (x) => `
          <li class="survey-legend-list__row"><span class="survey-swatch" data-s="${x.swatch}" aria-hidden="true"></span><span class="survey-legend-list__name">${h.escapeHtml(x.title)}</span><span class="survey-legend-list__count">${x.count}<span class="visually-hidden"> ${unit},</span></span><span class="survey-legend-list__pct">${x.pct}%</span></li>`,
    )
    .join('')}
        </ul>`
}

const proseBlock = (list, className = '') => list.map((p) => `<p${className ? ` class="${className}"` : ''}>${p}</p>`).join('\n          ')

function renderHero(s, page, h) {
  const stat = (num, label) => `<li class="survey-stat"><span class="survey-stat__num">${num}</span> <span class="survey-stat__label">${label}</span></li>`
  const activeContinents = s.continents.filter((c) => c.count > 0)

  // Dots: bigger first, so the small ones are drawn on top and never hidden under a big one. Area grows with the
  // count (diameter with its square root), 14px for one answer up to 62px for the most, at the full desktop size.
  const max = Math.max(...s.byCountry.map((c) => c.count))
  const dots = [...s.byCountry]
    .filter((c) => !c.isRegion)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .flatMap((c) => {
      const at = positionsFile.positions[c.code]
      if (!at) {
        console.warn(`WARNING, Global Survey Report page map: no dot for ${c.name} (${c.code}): it has no map position (add one in build/make-world-map.js and run it). It is still in the list and the counts.`)
        return []
      }
      const y = ((at.y - cutTop * 100) / (100 - cutTop * 100)) * 100
      if (at.x < 0 || at.x > 100 || y < 0 || y > 100) {
        console.warn(`WARNING, Global Survey Report page map: no dot for ${c.name} (${c.code}): it is outside the frame the map is cut to.`)
        return []
      }
      const swatch = s.continents.find((k) => k.value === c.continent).swatch
      const d = Math.round(14 + 48 * Math.sqrt(c.count / max))
      const title = `${c.name}: ${c.count} ${plural(c.count, 'answer')}`
      return [`<span class="survey-map__dot" data-s="${swatch}" style="left: ${at.x}%; top: ${y.toFixed(2)}%; --d: ${d}" title="${h.escapeHtml(title)}"></span>`]
    })
    .join('\n          ')

  const legend = activeContinents.map((c) => `<li class="survey-key"><span class="survey-swatch survey-swatch--dot" data-s="${c.swatch}" aria-hidden="true"></span>${h.escapeHtml(c.title)}</li>`).join('\n        ')

  return `
    <header class="survey-hero">
      <div class="survey-hero__head">
        <h1 class="survey-hero__title" id="survey-title">Global Survey Report</h1>
        <p class="survey-hero__intro">${h.escapeHtml(page.intro)}</p>
      </div>
      <ul class="survey-stats" role="list">
        ${stat(s.n, `${plural(s.n, 'initiative')} answered`)}
        ${stat(s.countryCount, plural(s.countryCount, 'country', 'countries'))}
        ${stat(activeContinents.length, plural(activeContinents.length, 'continent'))}
      </ul>
      <figure class="survey-map" style="--aspect: ${MAP_ASPECT.toFixed(4)}">
        <div class="survey-map__frame" role="img" aria-label="A world map with a dot in each country that answered. The dot is bigger where more initiatives answered, and coloured by continent. The countries and their numbers are listed below.">
          <div class="survey-map__land" aria-hidden="true"></div>
          ${dots}
        </div>
        <figcaption class="visually-hidden">Where the answers came from</figcaption>
      </figure>
      <ul class="survey-keys" role="list" aria-label="Map colours">
        ${legend}
      </ul>
      <div class="survey-hero__action">
        <p class="survey-hero__status">${h.escapeHtml(page.statusLine)}</p>
        ${renderButton(page, h)}
      </div>
    </header>`
}

function renderButton(page, h) {
  return `<a class="survey-button" href="${h.escapeHtml(page.surveyUrl)}">${h.escapeHtml(page.buttonLabel)}<span class="survey-button__arrow" aria-hidden="true">&nearr;</span><span class="visually-hidden"> (opens another site)</span></a>`
}

function renderResponses(s, page, h) {
  const regionPart = s.regionCount ? ` and ${s.regionCount} ${plural(s.regionCount, 'region')}` : ''
  const rows = s.byCountry
    .map((c) => {
      const swatch = s.continents.find((k) => k.value === c.continent).swatch
      return `
          <li class="survey-countries__row"><span class="survey-swatch survey-swatch--dot" data-s="${swatch}" aria-hidden="true"></span><span class="survey-countries__name">${h.escapeHtml(c.name)}</span><span class="survey-countries__count">${c.count}<span class="visually-hidden"> ${plural(c.count, 'answer')}</span></span></li>`
    })
    .join('')
  return `
    <section class="survey-section" aria-labelledby="survey-responses-heading">
      <div class="survey-section__text">
        <p class="survey-eyebrow">Responses</p>
        <h2 class="survey-heading" id="survey-responses-heading">Where the answers come from</h2>
        <p>${h.escapeHtml(leadContinents(s))}</p>
        ${proseBlock(page.responsesNote.map((p) => h.escapeHtml(p)))}
      </div>
      <div class="survey-chart">
        ${donut(s.continents, {big: String(s.n), small: plural(s.n, 'answer')}, h, 'answers')}
        ${legendList(s.continents, 'answers', h)}
      </div>
      <details class="survey-fold survey-fold--wide">
        <summary class="survey-fold__summary"><span class="survey-fold__title">See answers from all ${s.countryCount} ${plural(s.countryCount, 'country', 'countries')}${regionPart}</span><span class="survey-fold__chevron" aria-hidden="true"></span></summary>
        <ul class="survey-countries" role="list">${rows}
        </ul>
      </details>
    </section>`
}

function renderTypes(s, page, h) {
  const groups = s.types.filter((t) => t.count > 0).length
  return `
    <section class="survey-section" aria-labelledby="survey-types-heading">
      <div class="survey-section__text">
        <p class="survey-eyebrow">Type of initiative</p>
        <h2 class="survey-heading" id="survey-types-heading">Who runs them</h2>
        <p>${h.escapeHtml(leadTypes(s))}</p>
        <details class="survey-fold">
          <summary class="survey-fold__summary"><span class="survey-fold__title">How we grouped the answers</span><span class="survey-fold__chevron" aria-hidden="true"></span></summary>
          <div class="survey-fold__body">
          ${proseBlock(page.groupingNote.map((p) => h.escapeHtml(p)))}
          </div>
        </details>
      </div>
      <div class="survey-chart">
        ${donut(s.types, {big: String(groups), small: plural(groups, 'group')}, h, 'initiatives')}
        ${legendList(s.types, 'initiatives', h)}
      </div>
    </section>`
}

function renderOffers(s, page, h) {
  const bars = s.offers
    .map(
      (x) => `
          <li class="survey-bar"><span class="survey-bar__label">${h.escapeHtml(x.title)}</span><span class="survey-bar__track" aria-hidden="true"><span class="survey-bar__fill" style="width: ${x.pct}%"></span></span><span class="survey-bar__value">${x.pct}%</span></li>`,
    )
    .join('')
  return `
    <section class="survey-section" aria-labelledby="survey-offers-heading">
      <div class="survey-section__text">
        <p class="survey-eyebrow">Experiences</p>
        <h2 class="survey-heading" id="survey-offers-heading">What they offer</h2>
        <p>${h.escapeHtml(leadOffers(s))}</p>
        ${proseBlock(page.offersNote.map((p) => h.escapeHtml(p)))}
      </div>
      <div class="survey-chart survey-chart--bars">
        <ul class="survey-bars" role="list">${bars}
        </ul>
        <p class="survey-axis" aria-hidden="true"><span>0</span><span>50</span><span>100</span></p>
      </div>
    </section>`
}

function renderSustain(s, page, h) {
  const note = page.sustainabilityNote ? ` ${h.escapeHtml(page.sustainabilityNote)}` : ''
  return `
    <section class="survey-section" aria-labelledby="survey-sustain-heading">
      <div class="survey-section__text">
        <p class="survey-eyebrow">Sustainability</p>
        <h2 class="survey-heading" id="survey-sustain-heading">Can they pay their own way?</h2>
        ${proseBlock(page.sustainabilityIntro.map((p) => h.escapeHtml(p)))}
        <p>${h.escapeHtml(leadSustain(s))}${note}</p>
      </div>
      <div class="survey-chart">
        ${donut(s.sustain, {big: `${s.onTheWayPct}%`, small: 'on the way'}, h, 'initiatives')}
        ${legendList(s.sustain, 'initiatives', h)}
      </div>
    </section>`
}

function renderPartners(page, h) {
  return `
    <section class="survey-section survey-section--plain" aria-labelledby="survey-partners-heading">
      <div class="survey-section__text">
        <h2 class="survey-heading survey-heading--small" id="survey-partners-heading">Who they work with</h2>
      </div>
      <div class="survey-partners">
        ${proseBlock(page.partnersText.map((p) => h.escapeHtml(p)))}
      </div>
    </section>`
}

function renderCta(page, h) {
  return `
    <section class="survey-cta" aria-labelledby="survey-cta-heading">
      <div class="survey-cta__inner">
        <div class="survey-cta__text">
          <h2 class="survey-cta__heading" id="survey-cta-heading">${h.escapeHtml(page.ctaHeading)}</h2>
          <p class="survey-cta__sentence">${h.escapeHtml(page.ctaText)}</p>
        </div>
        ${renderButton(page, h)}
      </div>
    </section>`
}

function renderSurveyPage({page, stats}, h) {
  return {
    file: PAGE_FILE,
    page: {
      title: 'Global Survey Report | Astrotourism',
      description: page.intro,
      canonical: `${h.siteUrl}${PAGE_PATH}`,
      hero: renderHero(stats, page, h),
      body: renderResponses(stats, page, h) + renderTypes(stats, page, h) + renderOffers(stats, page, h) + renderSustain(stats, page, h) + renderPartners(page, h),
      cta: renderCta(page, h),
    },
  }
}

module.exports = {loadSurvey, renderSurveyPage, compute, leadContinents, leadTypes, leadOffers, leadSustain, leaders}
