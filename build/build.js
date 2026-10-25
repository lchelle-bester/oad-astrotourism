// Build script: fetches content from Sanity, fills the placeholders in the
// templates in site/ and writes the finished site to dist/.

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const SITE_DIR = path.join(ROOT, 'site')
const DIST_DIR = path.join(ROOT, 'dist')

// Sanity project ID and dataset name are not secret (see CLAUDE.md).
const PROJECT_ID = 'gwz91d96'
const DATASET = 'production'
const API_VERSION = '2025-02-19'

// Runs a GROQ query against Sanity's public query API and returns the result.
async function sanityQuery(groq) {
  const url =
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
    `?query=${encodeURIComponent(groq)}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Sanity returned ${response.status} ${response.statusText}`)
  }
  const body = await response.json()
  return body.result
}

// Makes text safe to put inside HTML, so that characters like < and & are shown
// as text and never treated as code. Everything from Sanity goes through this.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Replaces each {{name.field}} in the template with the matching value from
// data, escaped. An unknown placeholder stops the build, so typos are caught.
function renderTemplate(template, data) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), data)
    if (value === undefined || value === null) {
      throw new Error(`Template placeholder ${match} has no value in the Sanity data.`)
    }
    return escapeHtml(value)
  })
}

// Replaces each {{> name}} with the contents of site/partials/name.html, so shared
// pieces such as the header are written once and appear on every page.
function insertPartials(template) {
  return template.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (match, name) => {
    const file = path.join(SITE_DIR, 'partials', `${name}.html`)
    if (!fs.existsSync(file)) {
      throw new Error(`Partial ${match} not found: expected site/partials/${name}.html`)
    }
    return fs.readFileSync(file, 'utf8').trimEnd()
  })
}

async function main() {
  const hero = await sanityQuery(
    '*[_id == "hero"][0]{headlineWord, headlineRest, subheading, affiliation}',
  )
  if (!hero) {
    throw new Error('No published hero document found in Sanity. Publish it in the Studio.')
  }
  const data = {hero}

  // Start from a clean dist/ and copy everything from site/ into it,
  // apart from the partials, which only exist to be inserted into pages.
  fs.rmSync(DIST_DIR, {recursive: true, force: true})
  fs.cpSync(SITE_DIR, DIST_DIR, {
    recursive: true,
    filter: (source) => !source.startsWith(path.join(SITE_DIR, 'partials')),
  })

  // Every page at the top of site/ (index.html, 404.html, ...): insert the
  // partials, then fill the placeholders, overwriting the copies in dist/.
  const pages = fs.readdirSync(DIST_DIR).filter((name) => name.endsWith('.html'))
  for (const name of pages) {
    const page = path.join(DIST_DIR, name)
    const html = insertPartials(fs.readFileSync(page, 'utf8'))
    fs.writeFileSync(page, renderTemplate(html, data))
  }

  console.log(`Built ${pages.join(', ')} with hero:`, hero.headlineWord, hero.headlineRest)
}

// Only run the build when this file is started directly (node build/build.js),
// so the functions above can also be loaded and tested on their own.
if (require.main === module) {
  main().catch((error) => {
    console.error('Build failed:', error.message)
    process.exit(1)
  })
}

module.exports = {escapeHtml, renderTemplate, insertPartials}
