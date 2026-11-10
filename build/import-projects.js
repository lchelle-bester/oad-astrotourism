// One-time importer for the project directory (Phase 8, step c, 10 Nov 2026).
// Reads OAD's public projects table (https://astro4dev.org/projects-search/), keeps
// the projects tagged astrotourism, cleans them up and writes two files:
//   docs/projects/imported-projects.json   to read and check, exactly what would be imported
//   .cache/imported-projects.ndjson        the same documents in the form Sanity's import takes
// It does NOT send anything to Sanity. After checking the JSON, import with:
//   cd studio
//   npx sanity datasets import ../.cache/imported-projects.ndjson production --missing
// "--missing" skips any project that already exists, so running the import again can
// never overwrite what Ram and Joy have edited in the Studio (Sanity is the master
// copy, decided 10 Nov 2026). Only the public table is read: no contact details.
//
// Usage:  node build/import-projects.js            reads the live page
//         node build/import-projects.js page.html  reads a saved copy instead

const fs = require('fs')
const path = require('path')
const {pathToFileURL} = require('url')

const ROOT = path.join(__dirname, '..')
const SOURCE = 'https://astro4dev.org/projects-search/'
const REVIEW_FILE = path.join(ROOT, 'docs', 'projects', 'imported-projects.json')
const NDJSON_FILE = path.join(ROOT, '.cache', 'imported-projects.ndjson')

// Places the table does not give. Each is written here, with where it came from, so
// the importer never invents one. Keyed by the project's original web address.
const PLACES = {
  // The summary starts "Karpenisi the capital of Evrytania" and L'chelle's mock-up shows this place.
  'https://astro4dev.org/starlight-bridges-community-astrotourism-through-the-artemis-space-observatory/':
    'Karpenisi, Evrytania',
}

const NAMED_ENTITIES = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '}
function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
    if (code[0] === '#') {
      const number = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return String.fromCodePoint(number)
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? whole
  })
}

// OAD's page holds some quote marks that were saved in the wrong encoding: “ is
// stored as "â" plus two invisible control characters (checked 10 Nov 2026). Those
// are the three bytes of the real character read one by one, so reading them back
// as UTF-8 restores it. A lone control character is an old Windows-1252 quote or
// dash (0x92 is ’, as in "children’s"), so it becomes that; any other is noise and
// is dropped. Every repair is counted and reported, so nothing changes silently.
let repairs = 0
const WINDOWS_1252 = {'\u0085': '…', '\u0091': '‘', '\u0092': '’', '\u0093': '“', '\u0094': '”', '\u0095': '•', '\u0096': '–', '\u0097': '—'}
function repair(text) {
  const fixed = text
    .replace(/[Â-ô][\u0080-¿]{1,3}/g, (sequence) => {
      const restored = Buffer.from(sequence, 'latin1').toString('utf8')
      return restored.includes('�') ? sequence : restored
    })
    .replace(/[\u0080-\u009f]/g, (control) => WINDOWS_1252[control] ?? '')
  if (fixed !== text) repairs++
  return fixed
}

// One line of text: tags removed, entities decoded, runs of spaces made single
function plain(html) {
  return repair(decode(html.replace(/<[^>]+>/g, ' ')))
    .replace(/[ \s]+/g, ' ')
    .trim()
}

// The summary: <br> becomes a line break; a blank line separates paragraphs. Single
// line breaks inside a paragraph (a bullet list, for example) are kept.
function summaryText(html) {
  const lines = repair(decode(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')))
    .replace(/ /g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
  const paragraphs = []
  let current = []
  for (const line of lines) {
    if (line) current.push(line)
    else if (current.length) {
      paragraphs.push(current.join('\n'))
      current = []
    }
  }
  if (current.length) paragraphs.push(current.join('\n'))
  return paragraphs.join('\n\n')
}

// The same rule as the Studio's web address Generate button
// (studio/schemaTypes/components/GenerateOnlySlugInput.jsx), so imported addresses look
// like the ones editors make later.
function toSlug(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/, '')
}

// Signs of text that was saved in the wrong encoding (for example "â€™" for a quote)
const DAMAGED = /[ÂÃâ][\u0080-¿€™œ“”]|√Ç|�/

async function main() {
  const countries = (await import(pathToFileURL(path.join(ROOT, 'studio/schemaTypes/countries.mjs')))).countries
  const {projectColours} = await import(pathToFileURL(path.join(ROOT, 'studio/schemaTypes/projectColours.mjs')))
  const {sdgs} = await import(pathToFileURL(path.join(ROOT, 'studio/schemaTypes/sdgs.mjs')))

  const codeFor = new Map(countries.map((c) => [c.name.toLowerCase(), c.code]))
  // Names the table uses that differ from our list
  codeFor.set('turkey', 'TR')

  let html
  if (process.argv[2]) {
    html = fs.readFileSync(process.argv[2], 'utf8')
    console.log(`Reading the saved page ${process.argv[2]}`)
  } else {
    const response = await fetch(SOURCE)
    if (!response.ok) throw new Error(`Could not read ${SOURCE}: ${response.status}`)
    html = await response.text()
    console.log(`Read ${SOURCE}`)
  }

  const problems = [] // stop the import: the file is still written, but check these first
  const notes = [] // worth a look
  const projects = []

  for (const row of html.matchAll(/<tr class="row-\d+">(.*?)<\/tr>/gs)) {
    const cells = {}
    for (const cell of row[1].matchAll(/<td class="column-(\d)">(.*?)<\/td>/gs)) cells[cell[1]] = cell[2]
    if (!cells[1]) continue

    const tags = plain(cells[5] || '').split(',').map((t) => t.trim()).filter(Boolean)
    if (!tags.map((t) => t.toLowerCase()).includes('astrotourism')) continue

    const title = plain(cells[1])
    const label = title.slice(0, 50)

    // The link to OAD's own page, without any tracking (?_ga=... and the like)
    const href = (cells[1].match(/href="([^"]+)"/) || [])[1]
    let originalUrl = null
    if (href) {
      const url = new URL(decode(href))
      url.search = ''
      url.hash = ''
      originalUrl = url.toString()
      if (originalUrl !== decode(href)) notes.push(`${label}: tracking removed from the link`)
    } else notes.push(`${label}: no link to the original page`)

    // Location: country names separated by commas; "South Africa – with a focus on
    // the Northern Cape, ..." gives a country and a place
    let location = plain(cells[3] || '')
    let place = (originalUrl && PLACES[originalUrl]) || undefined
    const focus = location.match(/^(.*?)\s+[–—-]\s+(?:with a focus on\s+)?(.*)$/i)
    if (focus) {
      location = focus[1]
      place = focus[2].replace(/^the\s+/i, '').replace(/,\s+and\s+/i, ' and ')
      notes.push(`${label}: place "${place}" taken from the location cell`)
    }
    if (place && PLACES[originalUrl]) notes.push(`${label}: place "${place}" is from the PLACES table in this script`)
    const codes = []
    for (const name of location.split(',').map((n) => n.trim()).filter(Boolean)) {
      const code = codeFor.get(name.toLowerCase())
      if (code) codes.push(code)
      else problems.push(`${label}: country "${name}" is not in studio/schemaTypes/countries.mjs`)
    }
    if (!codes.length) problems.push(`${label}: no country`)

    const year = parseInt(plain(cells[4] || ''), 10)
    if (!(year >= 2000 && year <= 2100)) problems.push(`${label}: year "${plain(cells[4] || '')}" is not usable`)

    const sdgNumbers = []
    for (const part of plain(cells[6] || '').split(',').map((s) => s.trim()).filter(Boolean)) {
      const number = parseInt(part, 10)
      if (sdgs.some((s) => s.number === number)) sdgNumbers.push(number)
      else problems.push(`${label}: SDG "${part}" is not one of the 17`)
    }

    const repairsBefore = repairs
    sdgNumbers.sort((a, b) => a - b)

    const summary = summaryText(cells[2] || '')
    if (repairs > repairsBefore) notes.push(`${label}: damaged characters in the summary were repaired (the page itself has them)`)
    if (!summary) problems.push(`${label}: no summary`)
    if (summary.length > 3500) notes.push(`${label}: summary is ${summary.length} characters (the Studio warns over 3,500)`)
    for (const [what, text] of [['title', title], ['summary', summary]]) {
      if (DAMAGED.test(text)) problems.push(`${label}: damaged characters in the ${what}`)
    }

    const slug = toSlug(title)
    projects.push({
      _id: `project-${slug}`,
      _type: 'project',
      title,
      slug: {_type: 'slug', current: slug},
      kind: 'funded',
      year,
      countries: codes,
      ...(place ? {place} : {}),
      summary,
      ...(sdgNumbers.length ? {sdgs: sdgNumbers} : {}),
      tags,
      ...(originalUrl ? {originalUrl} : {}),
    })
  }

  // Newest year first, then A to Z, as in the Studio list. The card colours go round
  // the six brand colours in this order (L'chelle can change any in the Studio); none
  // of these projects has a photo yet.
  projects.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'en'))
  projects.forEach((project, i) => {
    project.cardColour = projectColours[i % projectColours.length].value
  })

  const slugs = projects.map((p) => p.slug.current)
  for (const slug of new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))) problems.push(`two projects share the web address ${slug}`)
  if (projects.length !== 20) notes.push(`found ${projects.length} astrotourism projects (20 were expected on 10 Nov 2026)`)

  fs.mkdirSync(path.dirname(REVIEW_FILE), {recursive: true})
  fs.mkdirSync(path.dirname(NDJSON_FILE), {recursive: true})
  fs.writeFileSync(REVIEW_FILE, JSON.stringify(projects, null, 2) + '\n')
  fs.writeFileSync(NDJSON_FILE, projects.map((p) => JSON.stringify(p)).join('\n') + '\n')

  console.log(`\n${projects.length} projects written to docs/projects/imported-projects.json`)
  console.log(`(and to .cache/imported-projects.ndjson, which is what the import reads)`)
  const countryCounts = new Map()
  for (const p of projects) for (const c of p.countries) countryCounts.set(c, (countryCounts.get(c) || 0) + 1)
  console.log(`${countryCounts.size} different countries, ${projects.filter((p) => p.sdgs).length} projects with an SDG`)
  if (notes.length) console.log('\nNotes:\n  ' + notes.join('\n  '))
  if (problems.length) {
    console.log('\nPROBLEMS (fix these before importing):\n  ' + problems.join('\n  '))
    process.exitCode = 1
  } else console.log('\nNo problems found.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
