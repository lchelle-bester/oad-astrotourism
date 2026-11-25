// The Impact page (Phase 10, 21 Nov 2026; design in docs/impact/). Loads the one published
// "Impact page" document from Sanity, checks it, and draws the page (/projects/impact/) the way
// theory.js and projects.js do for theirs.
// Fixed here, not in Sanity: the h1 "Impact", the layout of each of the four
// sections (by position: 1 and 2 a big figure and a list, 3 a list, 4 a row) and the word "Photo:".
// The sections' eyebrows ("Tourism", "Work", ...) are the editors' own words; there is no "Chapter 1"
// (21 Nov 2026, L'chelle: "chapter" is not OAD's word). The code and CSS still call a section a
// chapter internally. Every piece of text from Sanity goes through escapeHtml.

const {picture} = require('./news-article')
const {renderImpactMap} = require('./impact-map')

const PHOTO_FIELDS =
  '{alt, caption, credit, hotspot, crop, "url": asset->url, "assetId": asset->_id, ' +
  '"width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}'

const IMPACT_QUERY =
  '*[_id == "impactPage"][0]{headline, "heroPhoto": heroPhoto' + PHOTO_FIELDS + ', ' +
  'chapters[]{label, heading, intro, "photo": photo' + PHOTO_FIELDS + ', ' +
  'figures[]{prefix, value, suffix, label}}, ' +
  'mapEyebrow, mapHeading}'

const PAGE_FILE = 'projects/impact/index.html'
const PAGE_PATH = '/projects/impact/'

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

// Reads the page and checks it. Returns null if it has not been published (the page is then
// left out and the build says so). Stops the build with a clear message if it is published but
// cannot be drawn, so a bad entry never reaches the site silently.
async function loadImpact({sanityQuery}) {
  const row = await sanityQuery(IMPACT_QUERY)
  if (!row) return null
  const fail = (message) => {
    throw new Error(`Impact page: ${message}`)
  }
  const need = (value, what) => {
    if (!clean(value)) fail(`${what} is empty. Fill it in in the Studio.`)
    return clean(value)
  }

  // The headline: one paragraph whose spans may carry the "highlight" mark
  const block = (row.headline || [])[0]
  const spans = (block?.children || []).filter((s) => s._type === 'span')
  const headline = spans.map((s) => ({text: String(s.text ?? ''), highlight: (s.marks || []).includes('highlight')}))
  if (!headline.map((s) => s.text).join('').trim()) fail('the headline sentence is empty. Fill it in in the Studio.')

  // A photo with no picture behind it is simply not there. One with a picture needs alt text.
  const photo = (p, where) => {
    if (!p || !p.url || !p.assetId) return null
    if (!clean(p.alt)) fail(`${where} has a photo with no alt text. Add it in the Studio.`)
    return p
  }

  if (!Array.isArray(row.chapters) || row.chapters.length !== 4) fail('it needs exactly four sections.')
  const chapters = row.chapters.map((c, i) => {
    const where = `section ${i + 1}`
    const figures = Array.isArray(c.figures) ? c.figures : []
    if (figures.length < 1 || figures.length > 5) fail(`${where} needs one to five figures.`)
    return {
      number: i + 1,
      label: need(c.label, `the eyebrow of ${where}`),
      heading: need(c.heading, `the heading of ${where}`),
      intro: need(c.intro, `the introduction of ${where}`),
      photo: photo(c.photo, where),
      figures: figures.map((f, j) => {
        const what = `figure ${j + 1} of ${where}`
        if (!Number.isInteger(f.value) || f.value < 0) fail(`${what} needs a whole number, zero or more.`)
        return {
          prefix: clean(f.prefix),
          value: f.value,
          suffix: clean(f.suffix),
          label: need(f.label, `the sentence of ${what}`),
        }
      }),
    }
  })

  return {
    headline,
    heroPhoto: photo(row.heroPhoto, 'the banner'),
    chapters,
    mapEyebrow: need(row.mapEyebrow, 'the small line above the map heading'),
    mapHeading: need(row.mapHeading, 'the map heading'),
  }
}

// "An astro-homestay in Maan. Photo: Dr Jane Doe": the caption, then the credit. Either may be missing.
function photoLine(image, h, className) {
  const caption = clean(image.caption)
  const credit = clean(image.credit)
  if (!caption && !credit) return ''
  const text = [caption && (/[.!?]$/.test(caption) ? caption : `${caption}.`), credit && `Photo: ${credit}`].filter(Boolean).join(' ')
  return `<p class="${className}">${h.escapeHtml(text)}</p>`
}

// 111000 becomes "111,000"; the prefix and suffix (for example a currency sign) stay outside it
const formatFigure = (f) => `${f.prefix}${f.value.toLocaleString('en-US')}${f.suffix}`

// One figure: the number, then the sentence, so it reads as one sentence to a screen reader.
// There is no place line and no link to a project (removed 25 Nov 2026, L'chelle).
// `kind`: "big" (the large first figure of chapters 1 and 2), "inline" (chapter 2's rows, number
// and words on one line), "row" (chapter 4) or "list".
function renderFigure(f, kind, h) {
  const value = `<span class="impact-figure__value">${h.escapeHtml(formatFigure(f))}</span>`
  return `
          <li class="impact-figure impact-figure--${kind}">${value}<span class="impact-figure__label">${h.escapeHtml(f.label)}</span></li>`
}

function renderChapter(c, images, h) {
  const id = `impact-chapter-${c.number}`
  // The first figure is shown large in chapters 1 and 2; chapter 3 is a plain list, chapter 4 a row
  const kinds = (i) => {
    if (c.number <= 2) return i === 0 ? 'big' : c.number === 2 ? 'inline' : 'list'
    return c.number === 3 ? 'list' : 'row'
  }
  const image = images[c.number - 1]
  // Chapter 2 and 4 use the photo as the background of the whole chapter. The first photo (chapter 1)
  // is just below the banner, so it loads lazily like the others.
  const sizes = c.number === 2 || c.number === 4 ? '100vw' : '(min-width: 920px) 50vw, 100vw'
  const photo = image ? picture(image, h, {sizes, lazy: true, className: 'impact-chapter__img', style: `object-position: ${image.position}`}) : ''
  const line = image ? photoLine(image, h, 'impact-chapter__caption') : ''
  return `
    <section class="impact-chapter impact-chapter--${c.number}${image ? '' : ' impact-chapter--no-photo'}" aria-labelledby="${id}">
      ${image ? `<figure class="impact-chapter__figure">${photo}${line ? `\n        ${line}` : ''}</figure>` : ''}
      <div class="impact-chapter__text">
        <p class="impact-chapter__eyebrow">${h.escapeHtml(c.label)}</p>
        <h2 class="impact-chapter__heading" id="${id}">${h.escapeHtml(c.heading)}</h2>
        <p class="impact-chapter__intro">${h.escapeHtml(c.intro)}</p>
        <ul class="impact-figures">${c.figures.map((f, i) => renderFigure(f, kinds(i), h)).join('')}
        </ul>
      </div>
    </section>`
}

function renderHero(impact, image, h) {
  const headline = impact.headline
    .map((s) => (s.highlight ? `<span class="impact-hero__mark">${h.escapeHtml(s.text)}</span>` : h.escapeHtml(s.text)))
    .join('')
  const photo = image ? picture(image, h, {sizes: '100vw', lazy: false, className: 'impact-hero__img', style: `object-position: ${image.position}`}) : ''
  // No caption on the banner (25 Nov 2026, L'chelle, asked twice): only the credit, and only when one is entered
  const line = image ? photoLine({...image, caption: ''}, h, 'impact-hero__caption') : ''
  return `
    <section class="impact-hero${image ? '' : ' impact-hero--no-photo'}" aria-labelledby="impact-title">
      ${photo}
      <div class="impact-hero__inner">
        <h1 class="impact-hero__title" id="impact-title">Impact</h1>
        <p class="impact-hero__headline">${headline}</p>
      </div>${line ? `\n      ${line}` : ''}
    </section>`
}

// images: {hero, chapters: [one per chapter, or null]} as downloaded by build.js
// projects: the published projects, for the map
function renderImpactPage(impact, h, {images, projects = []}) {
  const headlineText = impact.headline.map((s) => s.text).join('').replace(/\s+/g, ' ').trim()
  return {
    file: PAGE_FILE,
    page: {
      title: 'Impact | Astrotourism',
      description: headlineText,
      canonical: `${h.siteUrl}${PAGE_PATH}`,
      hero: renderHero(impact, images.hero, h),
      chapters: impact.chapters.map((c) => renderChapter(c, images.chapters, h)).join(''),
      map: renderImpactMap({eyebrow: impact.mapEyebrow, heading: impact.mapHeading}, projects, h),
    },
  }
}

module.exports = {loadImpact, renderImpactPage}
