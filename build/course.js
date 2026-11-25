// The Online course page (Phase 11, 25 Nov 2026; design in docs/online-course/, from L'chelle's two
// mock-ups). Loads the one published "Online course page" document from Sanity, checks it, and draws
// the page (/resources/online-course/) the way impact.js and theory.js do for theirs.
//
// The course itself is run by The Open University on OpenLearn Create. This page describes it and sends
// people there, so what it says must match the real course (the facts were checked on 25 Nov 2026, see
// studio/scripts/fill-online-course-page.js).
//
// Fixed here, not in Sanity: the h1 "Astrotourism online course" (no breadcrumb: removed 25 Nov 2026,
// L'chelle), the three section headings ("What you will learn", "Course outline", "How it works"), the numbers (outcomes 01.., modules
// 01.. across all the parts, "Part 1 of 4", steps 1 to 4), the line "Ten modules, four parts" (worked out
// from the parts) and the words on the preview video card. Every piece of text from Sanity goes through
// escapeHtml. The preview video is optional: with no YouTube link the block is left out.

const path = require('path')
const {pathToFileURL} = require('url')
const {picture} = require('./news-article')

const PHOTO_FIELDS =
  '{alt, credit, hotspot, crop, "url": asset->url, "assetId": asset->_id, ' +
  '"width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}'

const COURSE_QUERY =
  '*[_id == "onlineCoursePage"][0]{intro, courseUrl, buttonLabel, hostedLine, facts[]{strong, small}, ' +
  '"heroPhoto": heroPhoto' + PHOTO_FIELDS + ', outcomes, videoUrl, videoTitle, ' +
  'parts[]{title, modules[]{title, topics}}, steps[]{title, text}}'

const PAGE_FILE = 'resources/online-course/index.html'
const PAGE_PATH = '/resources/online-course/'

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

const TRIANGLE = '<svg viewBox="0 0 24 24" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const word = (n) => NUMBER_WORDS[n] || String(n)
const two = (n) => String(n).padStart(2, '0')

// Reads the page and checks it. Returns null if it has not been published (the page is then left
// out and the build says so). Stops the build with a clear message if it is published but cannot
// be drawn, so a bad entry never reaches the site silently.
async function loadCourse({sanityQuery, safeUrl, root}) {
  const row = await sanityQuery(COURSE_QUERY)
  if (!row) return null
  const {youtubeSource} = await import(pathToFileURL(path.join(root, 'studio', 'schemaTypes', 'mediaLinks.mjs')).href)
  const fail = (message) => {
    throw new Error(`Online course page: ${message}`)
  }
  const need = (value, what) => {
    if (!clean(value)) fail(`${what} is empty. Fill it in in the Studio.`)
    return clean(value)
  }

  const courseUrl = safeUrl(row.courseUrl, ['https:'])
  if (!courseUrl) fail('the course address is not a web address starting with https://.')

  const facts = Array.isArray(row.facts) ? row.facts : []
  if (facts.length !== 4) fail('it needs exactly four facts.')
  const outcomes = (Array.isArray(row.outcomes) ? row.outcomes : []).map(clean).filter(Boolean)
  if (outcomes.length < 3 || outcomes.length > 8) fail('it needs three to eight outcomes.')
  const parts = Array.isArray(row.parts) ? row.parts : []
  if (parts.length !== 4) fail('it needs exactly four parts.')
  const steps = Array.isArray(row.steps) ? row.steps : []
  if (steps.length !== 4) fail('it needs exactly four steps.')

  let video = null
  if (clean(row.videoUrl)) {
    const source = youtubeSource(clean(row.videoUrl))
    if (!source || source.kind !== 'video') fail('the preview video link is not a link to one YouTube video.')
    video = {id: source.id, title: need(row.videoTitle, 'the video title')}
  }

  let photo = null
  if (row.heroPhoto && row.heroPhoto.url && row.heroPhoto.assetId) {
    if (!clean(row.heroPhoto.alt)) fail('the photo has no alt text. Add it in the Studio.')
    photo = row.heroPhoto
  }

  return {
    intro: need(row.intro, 'the introduction'),
    courseUrl,
    buttonLabel: need(row.buttonLabel, 'the button words'),
    hostedLine: need(row.hostedLine, 'the line under the button'),
    facts: facts.map((f, i) => ({strong: need(f.strong, `the bold line of fact ${i + 1}`), small: need(f.small, `the small line of fact ${i + 1}`)})),
    photo,
    outcomes,
    video,
    parts: parts.map((p, i) => {
      const modules = Array.isArray(p.modules) ? p.modules : []
      if (!modules.length) fail(`part ${i + 1} needs at least one module.`)
      return {
        title: need(p.title, `the title of part ${i + 1}`),
        modules: modules.map((m, j) => ({
          title: need(m.title, `the title of module ${j + 1} of part ${i + 1}`),
          topics: (Array.isArray(m.topics) ? m.topics : []).map(clean).filter(Boolean),
        })),
      }
    }),
    steps: steps.map((s, i) => ({title: need(s.title, `the title of step ${i + 1}`), text: need(s.text, `the text of step ${i + 1}`)})),
  }
}

// The button, used twice. External, so it says so to screen readers and has no new tab (as everywhere).
function renderButton(course, h, tone) {
  return `<a class="course-button course-button--${tone}" href="${h.escapeHtml(course.courseUrl)}">${h.escapeHtml(course.buttonLabel)}<span class="course-button__arrow" aria-hidden="true">&nearr;</span><span class="visually-hidden"> (opens another site)</span></a>`
}

function renderHero(course, image, h) {
  const photo = image
    ? `<figure class="course-hero__figure">${picture(image, h, {sizes: '(min-width: 920px) 40vw, 100vw', lazy: false, className: 'course-hero__img', style: `object-position: ${image.position}`})}${clean(image.credit) ? `<figcaption class="course-hero__credit">Photo: ${h.escapeHtml(clean(image.credit))}</figcaption>` : ''}</figure>`
    : ''
  return `
    <section class="course-hero${image ? '' : ' course-hero--no-photo'}" aria-labelledby="course-title">
      <div class="course-hero__inner">
        <div class="course-hero__text">
          <h1 class="course-hero__title" id="course-title">Astrotourism online course</h1>
          <p class="course-hero__intro">${h.escapeHtml(course.intro)}</p>
          ${renderButton(course, h, 'yellow')}
          <p class="course-hosted">${h.escapeHtml(course.hostedLine)}</p>
        </div>
        ${photo}
      </div>
      <ul class="course-facts">${course.facts.map((f) => `
        <li class="course-fact"><strong class="course-fact__strong">${h.escapeHtml(f.strong)}</strong><span class="course-fact__small">${h.escapeHtml(f.small)}</span></li>`).join('')}
      </ul>
    </section>`
}

function renderLearn(course, h) {
  const video = course.video
    ? `
      <figure class="course-video">
        <div class="embed__frame course-video__frame" data-embed-src="https://www.youtube-nocookie.com/embed/${h.escapeHtml(course.video.id)}?autoplay=1&amp;rel=0" data-embed-title="${h.escapeHtml(course.video.title)}" data-embed-label="video" data-embed-host="YouTube">
          <a class="embed__trigger course-video__trigger" href="https://www.youtube.com/watch?v=${h.escapeHtml(course.video.id)}"><span class="course-video__play" aria-hidden="true">${TRIANGLE}</span><span class="course-video__label">Course preview<span class="visually-hidden">: ${h.escapeHtml(course.video.title)} (opens YouTube)</span></span></a>
        </div>
        <figcaption class="course-video__caption">Course preview. The video loads from YouTube only when you press play.</figcaption>
      </figure>`
    : ''
  return `
    <section class="course-learn${course.video ? '' : ' course-learn--no-video'}" aria-labelledby="course-learn-heading">
      <div class="course-learn__text">
        <h2 class="course-heading" id="course-learn-heading">What you will learn</h2>
        <ol class="course-outcomes" role="list">${course.outcomes.map((o) => `
          <li class="course-outcome">${h.escapeHtml(o)}</li>`).join('')}
        </ol>
      </div>${video}
    </section>`
}

function renderOutline(course, h) {
  const total = course.parts.reduce((sum, p) => sum + p.modules.length, 0)
  const eyebrow = `${word(total)} modules, ${word(course.parts.length)} parts`
  let number = 0
  const parts = course.parts
    .map((p, i) => {
      const id = `course-part-${i + 1}`
      const modules = p.modules
        .map((m) => {
          number += 1
          const topics = m.topics.length ? `\n              <ul class="course-topics" role="list">${m.topics.map((t) => `<li>${h.escapeHtml(t)}</li>`).join('')}</ul>` : ''
          return `
            <li class="course-module"><span class="course-module__num" aria-hidden="true">${two(number)}</span>
              <div class="course-module__body"><h4 class="course-module__title">${h.escapeHtml(m.title)}</h4>${topics}
              </div>
            </li>`
        })
        .join('')
      return `
        <section class="course-part" aria-labelledby="${id}">
          <p class="course-part__label">Part ${i + 1}<span class="course-part__of"> of ${course.parts.length}</span></p>
          <h3 class="course-part__title" id="${id}">${h.escapeHtml(p.title)}</h3>
          <ul class="course-modules" role="list">${modules}
          </ul>
        </section>`
    })
    .join('')
  return `
    <section class="course-outline" aria-labelledby="course-outline-heading">
      <p class="course-eyebrow">${h.escapeHtml(eyebrow)}</p>
      <h2 class="course-heading" id="course-outline-heading">Course outline</h2>
      <div class="course-parts">${parts}
      </div>
    </section>`
}

function renderHow(course, h) {
  return `
    <section class="course-how" aria-labelledby="course-how-heading">
      <h2 class="course-heading" id="course-how-heading">How it works</h2>
      <ol class="course-steps" role="list">${course.steps.map((s, i) => `
        <li class="course-step"><span class="course-step__num" aria-hidden="true">${i + 1}</span>
          <div class="course-step__body"><h3 class="course-step__title">${h.escapeHtml(s.title)}</h3><p class="course-step__text">${h.escapeHtml(s.text)}</p></div>
        </li>`).join('')}
      </ol>
      <div class="course-how__action">
        ${renderButton(course, h, 'navy')}
        <p class="course-hosted">${h.escapeHtml(course.hostedLine)}</p>
      </div>
    </section>`
}

// image: the hero photo as downloaded by build.js (or null)
function renderCoursePage(course, h, {image}) {
  return {
    file: PAGE_FILE,
    page: {
      title: 'Online course | Astrotourism',
      description: course.intro,
      canonical: `${h.siteUrl}${PAGE_PATH}`,
      hero: renderHero(course, image, h),
      learn: renderLearn(course, h),
      outline: renderOutline(course, h),
      how: renderHow(course, h),
    },
  }
}

module.exports = {loadCourse, renderCoursePage}
