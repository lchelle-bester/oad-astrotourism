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
    .replace(/\{/g, '&#123;') // so text from Sanity can never look like a {{placeholder}}
}

function lookup(data, key, match) {
  const value = key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), data)
  if (value === undefined || value === null) {
    throw new Error(`Template placeholder ${match} has no value in the Sanity data.`)
  }
  return value
}

// Replaces each {{name.field}} in the template with the matching value from
// data, escaped. An unknown placeholder stops the build, so typos are caught.
// {{{name.field}}} (three braces) inserts HTML that this script has built itself
// from escaped parts, such as the pillar cards. Never use it for Sanity text directly.
function renderTemplate(template, data) {
  return template
    .replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (match, key) => String(lookup(data, key, match)))
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => escapeHtml(lookup(data, key, match)))
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

// THE SIX PILLARS
// The ring's six segment shapes (fixed design, from docs/pillars/pillars-ring.svg).
const RING_POINTS = [...fs.readFileSync(path.join(__dirname, 'pillars-ring.svg'), 'utf8')
  .matchAll(/<polygon id="segment-(\d)"[^>]* points="([^"]+)"/g)]
  .sort((a, b) => a[1] - b[1])
  .map((m) => m[2])

const pillarId = (i) => `pillar-${i + 1}`

// The segments of the ring: one real button per pillar, holding its own shape
// (only the painted shape reacts to the pointer) and its name. Hidden until
// main.js turns the list of cards into the ring.
function renderPillarTabs(pillars) {
  return pillars.map((pillar, i) => `
          <button class="pillar-tab" id="${pillarId(i)}-tab" type="button" role="tab" aria-selected="false" aria-controls="${pillarId(i)}" tabindex="-1">
            <svg class="pillar-tab__shape" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><polygon points="${RING_POINTS[i]}"/></svg>
            <span class="pillar-tab__label">${escapeHtml(pillar.name.trim())}</span>
          </button>`).join('')
}

// PILLAR PHOTOS (decided 27 Oct 2026: downloaded at build time, served from this
// site, so visitors' browsers never contact Sanity). Each photo is fetched from
// Sanity's image service in two widths and two formats, then written into
// dist/assets/images/pillars/. The file name includes part of the image's id, so
// a replaced photo gets a new name and browsers never show a stale copy.
const PHOTO_WIDTHS = [600, 1100]
const PHOTO_DIR = 'assets/images/pillars'

async function fetchPillarPhotos(pillars) {
  const files = [] // {name, data}, written into dist/ after it is created
  const photos = []
  for (const [i, pillar] of pillars.entries()) {
    const photo = pillar.photo
    if (!photo || !photo.url) {
      photos.push(null)
      continue
    }
    if (!photo.alt || !photo.credit) {
      throw new Error(`Pillar "${pillar.name}": the photo needs alt text and a credit in the Studio.`)
    }
    const id = photo.assetId.split('-')[1].slice(0, 10)
    // Respect a crop set in the Studio: rect=left,top,width,height in pixels
    let rect = ''
    if (photo.crop && photo.width && photo.height) {
      const {left = 0, top = 0, right = 0, bottom = 0} = photo.crop
      const x = Math.round(left * photo.width)
      const y = Math.round(top * photo.height)
      const w = Math.round((1 - left - right) * photo.width)
      const h = Math.round((1 - top - bottom) * photo.height)
      rect = `&rect=${x},${y},${w},${h}`
    }
    const sources = {}
    for (const format of ['webp', 'jpg']) {
      sources[format] = []
      for (const width of PHOTO_WIDTHS) {
        const name = `${pillarId(i)}-${id}-${width}.${format}`
        const url = `${photo.url}?w=${width}&fit=max&fm=${format}&q=${format === 'webp' ? 72 : 78}${rect}`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Could not download the photo for "${pillar.name}" (${response.status}).`)
        files.push({name, data: Buffer.from(await response.arrayBuffer())})
        sources[format].push(`/${PHOTO_DIR}/${name} ${width}w`)
      }
    }
    // The focus point chosen in the Studio (hotspot), as a CSS position, so the
    // important part stays in view however the photo area is shaped
    const hx = Math.round((photo.hotspot?.x ?? 0.5) * 100)
    const hy = Math.round((photo.hotspot?.y ?? 0.5) * 100)
    photos.push({...photo, sources, position: `${hx}% ${hy}%`, fallback: sources.jpg.at(-1).split(' ')[0]})
  }
  return {files, photos}
}

function renderPhoto(photo) {
  if (!photo) {
    // No photo yet: the placeholder, a soft gradient with a mountain line
    return `
          <div class="pillar-card__photo" aria-hidden="true">
            <svg viewBox="0 0 600 240" preserveAspectRatio="none" focusable="false"><path d="M0,190 C90,150 160,175 250,150 C340,125 420,170 500,140 C550,122 580,135 600,128 L600,240 L0,240 Z"/></svg>
          </div>`
  }
  const sizes = '(min-width: 57.5em) 36vw, 100vw'
  return `
          <figure class="pillar-card__photo pillar-card__photo--real">
            <picture>
              <source type="image/webp" srcset="${photo.sources.webp.join(', ')}" sizes="${sizes}">
              <img src="${photo.fallback}" srcset="${photo.sources.jpg.join(', ')}" sizes="${sizes}" alt="${escapeHtml(photo.alt.trim())}" loading="lazy" decoding="async" style="object-position: ${photo.position}">
            </picture>
            <figcaption class="pillar-card__credit">${escapeHtml(photo.credit.trim())}</figcaption>
          </figure>`
}

// The cards: the plain list everyone gets without JavaScript, which becomes the
// panel beside the ring. A pillar without a photo shows the placeholder.
function renderPillarCards(pillars, photos = []) {
  return pillars.map((pillar, i) => {
    const links = (pillar.links || []).map((link) => {
      const href = link.page || link.url
      if (!/^(\/|https?:\/\/)/.test(href || '')) {
        throw new Error(`Pillar "${pillar.name}": link "${link.label}" needs a page or a web address.`)
      }
      return `
              <li><a href="${escapeHtml(href)}">${escapeHtml(link.label.trim())} <span aria-hidden="true">&rarr;</span></a></li>`
    }).join('')
    return `
        <article class="pillar-card" id="${pillarId(i)}" aria-labelledby="${pillarId(i)}-name">${renderPhoto(photos[i])}
          <div class="pillar-card__body">
            <h3 class="pillar-card__name" id="${pillarId(i)}-name">${escapeHtml(pillar.name.trim())}</h3>
            <p class="pillar-card__text">${escapeHtml(pillar.description.trim())}</p>
            <p class="pillar-card__find">Find it on this site</p>
            <ul class="pillar-card__links">${links}
            </ul>
          </div>
        </article>`
  }).join('')
}

// PROOF (the impact figures)
// A figure as it is shown, for example "€111,000+": the number gets its thousands
// comma here, so editors type 111000 in the Studio.
function formatFigure(figure) {
  const number = new Intl.NumberFormat('en-GB').format(figure.value)
  return `${(figure.prefix || '').trim()}${number}${(figure.suffix || '').trim()}`
}

// The three results. Each item reads as one sentence, number first, then the tag
// and place (the CSS shows the tag above the sentence). The dot between tag and
// place is hidden from screen readers, which hear a comma instead.
function renderImpactResults(results) {
  return results.map((result) => `
          <li class="proof__result">
            <p class="proof__result-text"><span class="proof__result-number">${escapeHtml(formatFigure(result))}</span> <span class="proof__result-label">${escapeHtml(result.label.trim())}</span></p>
            <p class="proof__result-tag">${escapeHtml(result.tag.trim())}<span aria-hidden="true"> · </span><span class="visually-hidden">, </span>${escapeHtml(result.place.trim())}</p>
          </li>`).join('')
}

async function main() {
  const hero = await sanityQuery(
    '*[_id == "hero"][0]{headlineWord, headlineRest, subheading, affiliation}',
  )
  if (!hero) {
    throw new Error('No published hero document found in Sanity. Publish it in the Studio.')
  }

  // The case is designed for exactly three statistics (Sanity also enforces this).
  // The source link and checked-on date are records for editors, not shown on the page.
  const caseSection = await sanityQuery(
    '*[_id == "caseSection"][0]{heading, stats[]{value, label, sourceText}}',
  )
  if (!caseSection || !Array.isArray(caseSection.stats) || caseSection.stats.length !== 3) {
    throw new Error('"The case" needs exactly three published statistics. Check it in the Studio.')
  }

  // The six pillars, in order round the circle (Sanity enforces exactly six)
  const pillarsSection = await sanityQuery(
    '*[_id == "pillarsSection"][0]{eyebrow, heading, helper, helperPhone, pillars[]{name, description, links[]{label, page, url}, ' +
      '"photo": photo{alt, credit, hotspot, crop, "url": asset->url, "assetId": asset->_id, ' +
      '"width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}}}',
  )
  if (!pillarsSection || !Array.isArray(pillarsSection.pillars) || pillarsSection.pillars.length !== 6) {
    throw new Error('"What we do" needs exactly six published pillars. Check it in the Studio.')
  }
  pillarsSection.tabs = renderPillarTabs(pillarsSection.pillars)
  const pillarPhotos = await fetchPillarPhotos(pillarsSection.pillars)
  pillarsSection.cards = renderPillarCards(pillarsSection.pillars, pillarPhotos.photos)

  // Proof: one headline figure and exactly three results (Sanity enforces this).
  // The source fields are records for editors, so they are not fetched.
  const impactSection = await sanityQuery(
    '*[_id == "impactSection"][0]{eyebrow, heading, headline{prefix, value, suffix, label}, ' +
      'results[]{prefix, value, suffix, label, tag, place}, button{label, page, url}}',
  )
  if (!impactSection || !impactSection.headline || !Array.isArray(impactSection.results) || impactSection.results.length !== 3) {
    throw new Error('"Impact (proof)" needs a headline figure and exactly three published results. Check it in the Studio.')
  }
  impactSection.headlineNumber = formatFigure(impactSection.headline)
  impactSection.results = renderImpactResults(impactSection.results)
  const buttonHref = impactSection.button?.page || impactSection.button?.url
  if (!/^(\/|https?:\/\/)/.test(buttonHref || '')) {
    throw new Error('"Impact (proof)": the button needs a page or a web address.')
  }
  impactSection.buttonHref = buttonHref

  const data = {hero, caseSection, pillarsSection, impactSection}

  // Start from a clean dist/ and copy everything from site/ into it,
  // apart from the partials, which only exist to be inserted into pages.
  fs.rmSync(DIST_DIR, {recursive: true, force: true})
  fs.cpSync(SITE_DIR, DIST_DIR, {
    recursive: true,
    filter: (source) => !source.startsWith(path.join(SITE_DIR, 'partials')),
  })

  // The pillar photos downloaded from Sanity
  fs.mkdirSync(path.join(DIST_DIR, PHOTO_DIR), {recursive: true})
  for (const file of pillarPhotos.files) {
    fs.writeFileSync(path.join(DIST_DIR, PHOTO_DIR, file.name), file.data)
  }

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
