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

// fetch, tried up to three times. The connection to Sanity sometimes drops in
// the middle of a build ("fetch failed"); a second try almost always works.
async function fetchWithRetry(url, tries = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url)
    } catch (error) {
      if (attempt >= tries) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
}

// Runs a GROQ query against Sanity's public query API and returns the result.
async function sanityQuery(groq) {
  const url =
    `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
    `?query=${encodeURIComponent(groq)}`

  const response = await fetchWithRetry(url)
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
        const response = await fetchWithRetry(url)
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

// NEWS AND UPDATES (docs/news/news-design.md)
// The three newest published posts. Their photos are downloaded at build time,
// like the pillar photos, in two shapes: wide (15 by 8) for the desktop cards and
// the first phone card, and square for the two small rows on phones. Both are cut
// around the hotspot the editor set in the Studio.

// The category codes stored in Sanity and their labels. Keep in step with
// postCategories in studio/schemaTypes/post.js.
const POST_CATEGORIES = {news: 'News', events: 'Events', 'oad-projects': 'OAD projects'}
const NEWS_DIR = 'assets/images/news'
const NEWS_SHAPES = {
  wide: {ratio: 15 / 8, widths: [480, 820, 1240]},
  square: {ratio: 1, widths: [192, 288]},
}
// Must match the news breakpoint in styles.css: below it, posts 2 and 3 use the square photo
const NEWS_PHONE = 'not all and (min-width: 57.5em)'

// The part of the photo to keep for a shape, in the original's pixels: inside
// the editor's crop, as large as possible, and centred on the hotspot (moved
// back inside the crop if centring would run off its edge).
function cropForShape(photo, ratio) {
  const {left = 0, top = 0, right = 0, bottom = 0} = photo.crop || {}
  const area = {
    x: left * photo.width,
    y: top * photo.height,
    w: (1 - left - right) * photo.width,
    h: (1 - top - bottom) * photo.height,
  }
  const w = Math.min(area.w, area.h * ratio)
  const h = w / ratio
  const centreX = (photo.hotspot?.x ?? 0.5) * photo.width
  const centreY = (photo.hotspot?.y ?? 0.5) * photo.height
  const x = Math.min(Math.max(centreX - w / 2, area.x), area.x + area.w - w)
  const y = Math.min(Math.max(centreY - h / 2, area.y), area.y + area.h - h)
  return {x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h)}
}

// Downloads one post's photo in every shape, width and format. Widths bigger
// than the kept part of the photo are skipped (never blown up), but the
// smallest is always made. Returns the files to write and the srcset lists.
async function fetchNewsPhoto(post) {
  const photo = post.photo
  if (!photo?.url) throw new Error(`News post "${post.title}" has no photo. Add one in the Studio.`)
  const id = photo.assetId.split('-')[1].slice(0, 10)
  const files = []
  const shapes = {}
  for (const [shape, {ratio, widths}] of Object.entries(NEWS_SHAPES)) {
    const rect = cropForShape(photo, ratio)
    const usable = widths.filter((w, i) => i === 0 || w <= rect.w)
    shapes[shape] = {webp: [], jpg: [], width: usable.at(-1), height: Math.round(usable.at(-1) / ratio)}
    for (const format of ['webp', 'jpg']) {
      for (const width of usable) {
        const height = Math.round(width / ratio)
        const name = `${post.slug.replace(/[^a-z0-9-]/g, '')}-${id}-${shape}-${width}.${format}`
        const url = `${photo.url}?rect=${rect.x},${rect.y},${rect.w},${rect.h}&w=${width}&h=${height}&fit=crop` +
          `&fm=${format}&q=${format === 'webp' ? 72 : 78}`
        const response = await fetchWithRetry(url)
        if (!response.ok) throw new Error(`Could not download the photo for "${post.title}" (${response.status}).`)
        files.push({name, data: Buffer.from(await response.arrayBuffer())})
        shapes[shape][format].push(`/${NEWS_DIR}/${name} ${width}w`)
      }
    }
  }
  return {files, shapes}
}

// "2026-07-21" as "21 July 2026"
function formatPostDate(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'})
}

// The photo for a card. Empty alt text: the title beside it already names the
// post, and the photo is inside the card's link area (alt text stays required
// in Sanity for the article pages). Posts after the first switch to the square
// photo on phones.
function renderNewsPhoto(shapes, square) {
  const wide = shapes.wide
  const sizes = '(min-width: 57.5em) 30vw, 100vw'
  const phoneSources = square ? `
              <source media="${NEWS_PHONE}" type="image/webp" srcset="${shapes.square.webp.join(', ')}" sizes="6rem">
              <source media="${NEWS_PHONE}" srcset="${shapes.square.jpg.join(', ')}" sizes="6rem">` : ''
  return `
            <picture class="news-card__photo">${phoneSources}
              <source type="image/webp" srcset="${wide.webp.join(', ')}" sizes="${sizes}">
              <img src="${wide.jpg.at(-1).split(' ')[0]}" srcset="${wide.jpg.join(', ')}" sizes="${sizes}" width="${wide.width}" height="${wide.height}" alt="" loading="lazy" decoding="async">
            </picture>`
}

// The cards. In the HTML the title comes before the category and date, so
// screen readers hear the title first; the CSS shows the category and date
// above it. The title link is stretched over the whole card by the CSS, so each
// post is one link.
function renderNewsCards(posts) {
  return posts.map((post, i) => {
    const category = POST_CATEGORIES[post.category]
    if (!category) throw new Error(`News post "${post.title}" has an unknown category "${post.category}".`)
    return `
        <li class="news__item">
          <article class="news-card${i === 0 ? ' news-card--lead' : ''}">${renderNewsPhoto(post.shapes, i > 0)}
            <div class="news-card__text">
              <h3 class="news-card__title"><a href="/news/${escapeHtml(post.slug)}/">${escapeHtml(post.title.trim())}</a></h3>
              <p class="news-card__meta"><span class="news-card__category">${escapeHtml(category)}</span><span class="news-card__dot" aria-hidden="true">·</span><time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(formatPostDate(post.publishedAt))}</time></p>
            </div>
          </article>
        </li>`
  }).join('')
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

  // News: the three newest published posts. Published only: the filter leaves
  // out drafts (their ids start with "drafts."), on top of the public API never
  // showing drafts to a request without a token. Same date: created later first.
  const posts = await sanityQuery(
    '*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[0...3]' +
      '{title, "slug": slug.current, publishedAt, category, "photo": mainImage{hotspot, crop, "url": asset->url, ' +
      '"assetId": asset->_id, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}}',
  )
  const newsFiles = []
  for (const post of posts) {
    const photo = await fetchNewsPhoto(post)
    post.shapes = photo.shapes
    newsFiles.push(...photo.files)
  }
  // No posts: the section is left out of the page altogether
  const newsSection = {cards: renderNewsCards(posts), html: ''}
  if (posts.length) {
    const partial = fs.readFileSync(path.join(SITE_DIR, 'partials', 'news.html'), 'utf8').trimEnd()
    newsSection.html = renderTemplate(partial, {newsSection})
  }

  const data = {hero, caseSection, pillarsSection, impactSection, newsSection}

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

  // The news photos downloaded from Sanity
  fs.mkdirSync(path.join(DIST_DIR, NEWS_DIR), {recursive: true})
  for (const file of newsFiles) {
    fs.writeFileSync(path.join(DIST_DIR, NEWS_DIR, file.name), file.data)
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
