// The Theory of Change page (Phase 9, 19 Nov 2026; design in docs/theory-of-change/).
// Loads the one published "Theory of Change page" document from Sanity, checks it, and draws the
// page (/projects/theory-of-change/) the way projects.js and news-article.js do for their pages.
// The five section headings, the column labels and the words on the buttons are fixed here, not in
// Sanity. Every piece of text from Sanity goes through escapeHtml.

const path = require('path')
const {pathToFileURL} = require('url')

const THEORY_QUERY =
  '*[_id == "theoryOfChange"][0]{intro, problemFigure, problemText, sourceName, sourceUrl, sourceDate, ' +
  'peopleTotal, peopleHighlighted, peopleLineBefore, peopleLineBold, peopleLineAfter, ' +
  'audience{items, assumes}, stakeholders{items, assumes}, ' +
  'pathways[]{name, activityShort, activityFull, outputShort, outputFull, outcomeShort, outcomeFull}, ' +
  'activitiesAssumptions, outputsAssumptions, outcomesAssumptions, ' +
  'goals[]{sdg, target, main, text, indicatorCode, indicatorText}, impactText, impactButton{label, page, url}, ' +
  '"diagram": diagramFile.asset->{_id, url, originalFilename, extension, mimeType, size}}'

const PAGE_FILE = 'projects/theory-of-change/index.html'
const PAGE_PATH = '/projects/theory-of-change/'

// "Decent Work and Economic Growth" as the UN writes it becomes "Decent work and economic growth"
// as the mock-up sets it (every one of the 17 titles reads correctly in sentence case)
const sentenceCase = (title) => title.charAt(0) + title.slice(1).toLowerCase()

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

// Reads the page and checks it. Returns null if it has not been published (the page is then
// left out and the build says so). Stops the build with a clear message if it is published
// but cannot be drawn, so a bad entry never reaches the site silently.
async function loadTheory({sanityQuery, safeUrl, root}) {
  const row = await sanityQuery(THEORY_QUERY)
  if (!row) return null
  const {sdgs} = await import(pathToFileURL(path.join(root, 'studio', 'schemaTypes', 'sdgs.mjs')).href)
  const fail = (message) => {
    throw new Error(`Theory of Change page: ${message}`)
  }
  const need = (value, what) => {
    if (!clean(value)) fail(`${what} is empty. Fill it in in the Studio.`)
    return clean(value)
  }

  const theory = {
    intro: need(row.intro, 'the introduction'),
    problem: {
      figure: need(row.problemFigure, 'the big figure'),
      text: need(row.problemText, 'the sentence under the big figure'),
      sourceName: need(row.sourceName, 'the source name'),
      sourceDate: need(row.sourceDate, 'the source date'),
    },
  }
  theory.problem.sourceUrl = safeUrl(row.sourceUrl, ['https:', 'http:'])
  if (!theory.problem.sourceUrl) fail('the source link is not a web address starting with https://.')

  const total = row.peopleTotal
  const marked = row.peopleHighlighted
  if (!Number.isInteger(total) || total < 10 || total > 40) fail('"how many people" must be a whole number from 10 to 40.')
  if (!Number.isInteger(marked) || marked < 1 || marked > 10 || marked > total) {
    fail('"how many are highlighted" must be a whole number from 1 to 10, and no more than the number of people.')
  }
  theory.people = {
    total,
    marked,
    before: need(row.peopleLineBefore, 'the start of the line under the picture'),
    bold: need(row.peopleLineBold, 'the bold part of the line under the picture'),
    after: need(row.peopleLineAfter, 'the end of the line under the picture'),
  }

  for (const key of ['audience', 'stakeholders']) {
    const items = (row[key]?.items || []).map(clean).filter(Boolean)
    if (!items.length) fail(`"${key}" needs at least one item.`)
    theory[key] = {items, assumes: clean(row[key]?.assumes)}
  }

  if (!Array.isArray(row.pathways) || row.pathways.length !== 3) fail('it needs exactly three pathways.')
  theory.pathways = row.pathways.map((p, i) => {
    const pathway = {name: need(p.name, `the name of pathway ${i + 1}`)}
    for (const stage of ['activity', 'output', 'outcome']) {
      pathway[stage] = {
        short: need(p[`${stage}Short`], `the short ${stage} wording of "${pathway.name}"`),
        full: clean(p[`${stage}Full`]),
      }
    }
    return pathway
  })
  theory.assumptions = {
    activities: (row.activitiesAssumptions || []).map(clean).filter(Boolean),
    outputs: (row.outputsAssumptions || []).map(clean).filter(Boolean),
    outcomes: (row.outcomesAssumptions || []).map(clean).filter(Boolean),
  }

  if (!Array.isArray(row.goals) || row.goals.length < 1 || row.goals.length > 3) fail('it needs one to three goals.')
  theory.goals = row.goals.map((g) => {
    const goal = sdgs.find((s) => s.number === g.sdg)
    if (!goal) fail(`goal ${g.sdg} is not one of the 17 Sustainable Development Goals.`)
    const code = clean(g.indicatorCode)
    const wording = clean(g.indicatorText)
    if (Boolean(code) !== Boolean(wording)) fail(`goal ${g.sdg}: fill in both the indicator number and its wording, or neither.`)
    return {
      number: goal.number,
      title: sentenceCase(goal.title),
      target: Number.isInteger(g.target) ? g.target : null,
      main: Boolean(g.main),
      text: need(g.text, `the text of goal ${g.sdg}`),
      indicatorCode: code,
      indicatorText: wording,
    }
  })
  if (theory.goals.filter((g) => g.main).length > 1) fail('only one goal can be the main goal.')

  theory.impact = need(row.impactText, 'the impact statement')
  const button = row.impactButton || {}
  const href = clean(button.page || button.url)
  if (!clean(button.label)) fail('the impact button needs words.')
  if (!/^(\/|https?:\/\/)/.test(href)) fail('the impact button needs a page or a web address.')
  theory.impactButton = {label: clean(button.label), href}

  theory.diagram = row.diagram && row.diagram.url ? row.diagram : null
  return theory
}

// "270 KB", "1.2 MB"
function formatSize(bytes) {
  if (!bytes) return ''
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const CHEVRON =
  '<svg class="toc-fold__chevron" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3.5 6 4.5 4.5L12.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

const DOWNLOAD_ICON =
  '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 3v9m0 0-3.5-3.5M10 12l3.5-3.5M4 16h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

// The little person of the picture, drawn once and reused
const PERSON_SYMBOL =
  '<svg class="toc-people__defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><symbol id="toc-person" viewBox="0 0 16 26"><circle cx="8" cy="5" r="4.5"/><path d="M1 14.5C1 11 4 10 8 10s7 1 7 4.5V24a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z"/></symbol></defs></svg>'

// A button that opens and closes a part of the page. It is written hidden: main.js shows it and
// closes the part, so without JavaScript the part stays open and nothing is lost. The name of
// the part follows the visible words ("Show" or "Hide"), so the visible label is inside the name.
function foldButton(h, {controls, label, context, openLabel, closedLabel, className = ''}) {
  return `<button class="toc-fold${className ? ` ${className}` : ''}" type="button" hidden aria-expanded="true" aria-controls="${controls}" data-open-label="${h.escapeHtml(openLabel)}" data-closed-label="${h.escapeHtml(closedLabel)}"><span class="toc-fold__label">${h.escapeHtml(label)}</span><span class="visually-hidden">: ${h.escapeHtml(context)}</span>${CHEVRON}</button>`
}

function renderProblem(theory, h) {
  const {problem, people} = theory
  const figures = Array.from({length: people.total}, (_, i) => `<svg class="toc-people__person${i < people.marked ? ' toc-people__person--marked' : ''}" viewBox="0 0 16 26" focusable="false"><use href="#toc-person"/></svg>`).join('')
  return `
    <section class="toc-section toc-problem" aria-labelledby="toc-problem-title">
      <h2 class="toc-section__title" id="toc-problem-title"><span class="toc-section__num" aria-hidden="true">1</span>The problem</h2>
      <div class="toc-problem__layout">
        <div class="toc-problem__main">
          <p class="toc-problem__lead"><span class="toc-problem__figure">${h.escapeHtml(problem.figure)}</span> <span class="toc-problem__text">${h.escapeHtml(problem.text)}</span></p>
          <p class="toc-problem__source">Source: <a href="${h.escapeHtml(problem.sourceUrl)}">${h.escapeHtml(problem.sourceName)}</a> (${h.escapeHtml(problem.sourceDate)})</p>
        </div>
        <div class="toc-people">
          ${PERSON_SYMBOL}
          <div class="toc-people__grid" aria-hidden="true">${figures}</div>
          <p class="toc-people__line">${h.escapeHtml(people.before)} <strong>${h.escapeHtml(people.bold)}</strong> ${h.escapeHtml(people.after)}</p>
        </div>
      </div>
    </section>`
}

function renderGroup(h, {id, title, count, items, assumes}) {
  const list = items.map((item) => `
            <li class="toc-list__item">${h.escapeHtml(item)}</li>`).join('')
  const note = assumes ? `
          <p class="toc-assumes"><strong>Assumes:</strong> ${h.escapeHtml(assumes)}</p>` : ''
  return `
      <div class="toc-group">
        <div class="toc-group__head">
          <h3 class="toc-group__title" id="${id}-title">${h.escapeHtml(title)}</h3>
          <p class="toc-group__count">${h.escapeHtml(count)}</p>
          ${foldButton(h, {controls: `${id}-panel`, label: 'Hide', context: title, openLabel: 'Hide', closedLabel: 'Show', className: 'toc-fold--group'})}
        </div>
        <div class="toc-group__panel" id="${id}-panel">
          <ol class="toc-list" role="list">${list}
          </ol>${note}
        </div>
      </div>`
}

function renderWho(theory, h) {
  const n = theory.audience.items.length
  const m = theory.stakeholders.items.length
  return `
    <section class="toc-section toc-who" aria-labelledby="toc-who-title">
      <h2 class="toc-section__title" id="toc-who-title"><span class="toc-section__num" aria-hidden="true">2</span>Who it serves</h2>
      <div class="toc-who__groups">${renderGroup(h, {id: 'toc-people', title: 'The people it is for', count: `${n} ${n === 1 ? 'group' : 'groups'}`, ...theory.audience})}${renderGroup(h, {id: 'toc-partners', title: 'The partners who make it possible', count: `${m} ${m === 1 ? 'kind' : 'kinds'} of partner`, ...theory.stakeholders})}
      </div>
    </section>`
}

const STAGES = [
  {key: 'activity', label: 'Activity'},
  {key: 'output', label: 'Output'},
  {key: 'outcome', label: 'Outcome'},
]

function renderPathway(pathway, i, h) {
  const n = i + 1
  // The full wordings are the part that opens. A stage with no full wording shows only its short one.
  const fullIds = []
  const stages = STAGES.map((stage, s) => {
    const {short, full} = pathway[stage.key]
    let fullHtml = ''
    if (full) {
      const id = `toc-p${n}-${stage.key}-full`
      fullIds.push(id)
      fullHtml = `
            <p class="toc-stage__full" id="${id}">${h.escapeHtml(full)}</p>`
    }
    const arrow = s < STAGES.length - 1 ? '<span class="toc-pathway__arrow" aria-hidden="true">&rarr;</span>' : ''
    return `
          <div class="toc-stage toc-stage--${stage.key}">
            <p class="toc-stage__label">${stage.label}</p>
            <p class="toc-stage__short">${h.escapeHtml(short)}</p>${fullHtml}
          </div>${arrow}`
  }).join('')
  const toggle = fullIds.length
    ? foldButton(h, {controls: fullIds.join(' '), label: 'Show less', context: pathway.name, openLabel: 'Show less', closedLabel: 'Read in full', className: 'toc-fold--row'})
    : ''
  return `
        <li class="toc-pathway toc-pathway--${n}">
          <h3 class="toc-pathway__name"><span class="toc-pathway__num" aria-hidden="true">${n}</span><span class="toc-pathway__words">${h.escapeHtml(pathway.name)}</span></h3>${stages}
          ${toggle}
        </li>`
}

function renderAssumptions(theory, h) {
  const columns = [
    ['Activities', theory.assumptions.activities],
    ['Outputs', theory.assumptions.outputs],
    ['Outcomes', theory.assumptions.outcomes],
  ].filter(([, items]) => items.length)
  if (!columns.length) return ''
  const cols = columns.map(([title, items]) => `
          <div class="toc-assumptions__col">
            <h4 class="toc-assumptions__col-title">${title}</h4>
            <ul class="toc-assumptions__list">${items.map((item) => `
              <li>${h.escapeHtml(item)}</li>`).join('')}
            </ul>
          </div>`).join('')
  return `
      <div class="toc-assumptions">
        <div class="toc-assumptions__head">
          <div>
            <h3 class="toc-assumptions__title" id="toc-assumptions-title">The assumptions behind each stage</h3>
            <p class="toc-assumptions__hint">What has to hold true for the pathways to work</p>
          </div>
          ${foldButton(h, {controls: 'toc-assumptions-panel', label: 'Hide', context: 'The assumptions behind each stage', openLabel: 'Hide', closedLabel: 'Show', className: 'toc-fold--assumptions'})}
        </div>
        <div class="toc-assumptions__panel" id="toc-assumptions-panel">${cols}
        </div>
      </div>`
}

function renderPathways(theory, h) {
  const heads = STAGES.map((s) => `<p class="toc-pathways__head">${s.label}</p>`).join('')
  return `
    <section class="toc-section toc-pathways" aria-labelledby="toc-pathways-title">
      <h2 class="toc-section__title" id="toc-pathways-title"><span class="toc-section__num" aria-hidden="true">3</span>How the change happens</h2>
      <p class="toc-section__lead"><span class="toc-wide-only">Each coloured row is one pathway, read from left to right. Open a row for OAD's full wording.</span><span class="toc-narrow-only">Each coloured line is one pathway, read from top to bottom. Tap it for OAD's full wording.</span></p>
      <div class="toc-pathways__heads" aria-hidden="true">${heads}</div>
      <ol class="toc-pathways__list" role="list">${theory.pathways.map((p, i) => renderPathway(p, i, h)).join('')}
      </ol>${renderAssumptions(theory, h)}
    </section>`
}

// The goal's picture. The official UN icons are fixed design files kept in the repo
// (site/assets/images/sdg/sdg-08.png and so on, all 17, added 20 Nov 2026). They are used whole
// and unaltered, as the UN guidelines require. If a file is ever missing, the tile shows the
// goal's number, so nothing is broken.
function goalIconFile(goal, iconFiles) {
  const number = String(goal.number).padStart(2, '0')
  return iconFiles.find((f) => f === `sdg-${number}.svg`) || iconFiles.find((f) => f === `sdg-${number}.png`)
}

function renderGoalIcon(goal, h, iconFiles) {
  const file = goalIconFile(goal, iconFiles)
  if (file) return `<img class="toc-goal__icon" src="/assets/images/sdg/${file}" alt="" width="96" height="96" loading="lazy" decoding="async">`
  return `<span class="toc-goal__icon toc-goal__icon--tile" aria-hidden="true">${goal.number}</span>`
}

function renderGoals(theory, h, iconFiles) {
  const one = theory.goals.length === 1
  // The UN's rules for its icons: the guidelines go on the same page (as a link to the UN's own
  // copy), and the page says the use is not an endorsement. Only shown when an official icon is.
  const note = theory.goals.some((g) => goalIconFile(g, iconFiles))
    ? `
      <p class="toc-goals__note">The goal icons are the <a href="https://www.un.org/sustainabledevelopment/">United Nations Sustainable Development Goals</a> icons, used under the <a href="https://www.un.org/sustainabledevelopment/wp-content/uploads/2023/09/E_SDG_Guidelines_Sep20238.pdf">UN guidelines for their use</a> (PDF). Their use does not mean the United Nations endorses OAD, this website or its activities.</p>`
    : ''
  const items = theory.goals.map((goal) => {
    const label = `SDG goal ${goal.number}${goal.target ? `<span aria-hidden="true"> &middot; </span><span class="visually-hidden">, </span>Target ${goal.target}` : ''}`
    const badge = goal.main ? ' <span class="toc-goal__badge">Main goal</span>' : ''
    const indicator = goal.indicatorCode
      ? `
          <p class="toc-goal__indicator">Measured by indicator ${h.escapeHtml(goal.indicatorCode)}: ${h.escapeHtml(goal.indicatorText)}.</p>`
      : ''
    return `
        <li class="toc-goal">
          ${renderGoalIcon(goal, h, iconFiles)}
          <p class="toc-goal__label">${label}${badge}</p>
          <h3 class="toc-goal__title">${h.escapeHtml(goal.title)}</h3>
          <p class="toc-goal__text">${h.escapeHtml(goal.text)}</p>${indicator}
        </li>`
  }).join('')
  return `
    <section class="toc-section toc-goals" aria-labelledby="toc-goals-title">
      <h2 class="toc-section__title" id="toc-goals-title"><span class="toc-section__num" aria-hidden="true">4</span>The goals it serves</h2>
      <p class="toc-section__lead">${one ? 'All three pathways lead to this UN Sustainable Development Goal.' : 'All three pathways lead to these UN Sustainable Development Goals.'}</p>
      <ul class="toc-goals__list toc-goals__list--${theory.goals.length}" role="list">${items}
      </ul>${note}
    </section>`
}

function renderImpact(theory, h) {
  const external = /^https?:\/\//.test(theory.impactButton.href)
  return `
    <section class="toc-impact" aria-labelledby="toc-impact-title">
      <div class="toc-impact__inner">
        <h2 class="toc-impact__title" id="toc-impact-title"><span class="toc-section__num toc-section__num--light" aria-hidden="true">5</span>The impact</h2>
        <p class="toc-impact__text">${h.escapeHtml(theory.impact)}</p>
        <div class="toc-impact__rule">
          <a class="toc-impact__button" href="${h.escapeHtml(theory.impactButton.href)}">${h.escapeHtml(theory.impactButton.label)}${external ? '<span class="visually-hidden"> (opens another site)</span>' : ''} <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </section>`
}

// diagramFile: {href, downloadName, ext, size} once the build has downloaded the file, or null
function renderDownload(diagramFile, h) {
  if (!diagramFile) return ''
  const detail = [diagramFile.ext.toUpperCase(), formatSize(diagramFile.size)].filter(Boolean).join(', ')
  return `
        <a class="pill-button toc-band__download" href="${h.escapeHtml(diagramFile.href)}" download="${h.escapeHtml(diagramFile.downloadName)}">Download the diagram<span class="visually-hidden"> (${h.escapeHtml(detail)})</span><span class="pill-button__icon" aria-hidden="true">${DOWNLOAD_ICON}</span></a>`
}

// The whole page: the pieces the template places (design in docs/theory-of-change/)
function renderTheoryPage(theory, h, {diagramFile = null, iconFiles = []} = {}) {
  return {
    file: PAGE_FILE,
    page: {
      title: 'Theory of Change | Astrotourism',
      description: theory.intro,
      canonical: `${h.siteUrl}${PAGE_PATH}`,
      intro: theory.intro,
      download: renderDownload(diagramFile, h),
      problem: renderProblem(theory, h),
      who: renderWho(theory, h),
      pathways: renderPathways(theory, h),
      goals: renderGoals(theory, h, iconFiles),
      impact: renderImpact(theory, h),
    },
  }
}

module.exports = {loadTheory, renderTheoryPage}
