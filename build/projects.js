// The project directory (Phase 8, step d, 10 Nov 2026; design in docs/projects/projects-design.md).
// Loads the published projects from Sanity, checks them, and turns them into the
// directory page (/projects/directory/) and one page per project
// (/projects/directory/<slug>/), the way news-pages.js and news-article.js do for News.
// The directory's search and filters (step e) and the look of both pages (steps e and
// f) come later: this step draws the real markup with the real data.

const path = require('path')
const {pathToFileURL} = require('url')
const {describe} = require('./portable-text')

// What the directory needs from each project. The tags are only used by the search (they
// are not shown). Drafts are left out (their ids start with "drafts.").
const PROJECTS_QUERY =
  '*[_type == "project" && !(_id in path("drafts.**")) && defined(slug.current)] | order(year desc, title asc)' +
  '{title, "slug": slug.current, year, countries, place, summary, sdgs, tags, originalUrl, cardColour, ' +
  '"photo": photo{alt, credit, hotspot, crop, "url": asset->url, "assetId": asset->_id, ' +
  '"width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}}'

const INTRO = 'Astrotourism projects funded by the IAU Office of Astronomy for Development.'

// Reads the projects, checks every one and adds what the pages need: country names,
// goal labels, paragraphs and the card colour. Stops the build with a clear message
// if a project cannot be drawn, so a bad entry never reaches the site silently.
async function loadProjects({sanityQuery, safeUrl, root}) {
  const lists = async (name) => import(pathToFileURL(path.join(root, 'studio', 'schemaTypes', name)).href)
  const {countryName, countries} = await lists('countries.mjs')
  const {sdgLabel, sdgs} = await lists('sdgs.mjs')
  const {projectColours} = await lists('projectColours.mjs')

  const rows = (await sanityQuery(PROJECTS_QUERY)) || []
  const seen = new Set()
  return rows.map((row) => {
    const fail = (message) => {
      throw new Error(`Project "${row.title}": ${message}`)
    }
    if (!/^[a-z0-9-]+$/.test(row.slug)) fail(`the web address "${row.slug}" can only use a to z, 0 to 9 and hyphens.`)
    if (seen.has(row.slug)) fail(`another project has the same web address "${row.slug}".`)
    seen.add(row.slug)
    if (!Number.isInteger(row.year)) fail('it has no implementation year.')
    const codes = row.countries || []
    if (!codes.length) fail('it has no country.')
    for (const code of codes) if (!countries.some((c) => c.code === code)) fail(`"${code}" is not a country in studio/schemaTypes/countries.mjs.`)
    const goals = [...(row.sdgs || [])].sort((a, b) => a - b)
    for (const number of goals) if (!sdgs.some((s) => s.number === number)) fail(`SDG ${number} is not one of the 17.`)
    const paragraphs = (row.summary || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    if (!paragraphs.length) fail('it has no summary.')

    const hasPhoto = Boolean(row.photo && row.photo.url)
    const colour = projectColours.find((c) => c.value === row.cardColour)
    if (!hasPhoto && !colour) {
      fail(row.cardColour
        ? `its card colour "${row.cardColour}" is not one the Studio offers any more. Choose another in the Studio.`
        : 'it has no photo and no card colour.')
    }

    return {
      title: row.title.trim(),
      slug: row.slug,
      year: row.year,
      countryCodes: codes,
      countryNames: codes.map(countryName),
      place: (row.place || '').trim(),
      paragraphs,
      goalNumbers: goals,
      goals: goals.map(sdgLabel),
      tags: (row.tags || []).map((t) => t.trim()).filter(Boolean),
      originalUrl: row.originalUrl ? safeUrl(row.originalUrl, ['https:']) : null,
      photo: hasPhoto ? row.photo : null,
      colour: hasPhoto || !colour ? null : colour.hex,
    }
  })
}

const projectUrl = (project) => `/projects/directory/${project.slug}/`

// One project in a list: the title is the link and comes first in the HTML (screen
// readers hear it first), the year and country follow. Countries only, not the place
// (L'chelle, 10 Nov 2026). A project without a photo carries its solid colour.
function renderCard(project, h, level = 2, order = null) {
  const colour = project.colour ? ` style="--card-colour: ${project.colour}"` : ''
  // The photo is the card's background and only decoration (the title names the project),
  // so its alt text is empty. It comes after the text in the HTML, so screen readers meet
  // the title first; the CSS lays it behind.
  const photo = project.image
    ? h.picture({...project.image, alt: ''}, h, {sizes: '(min-width: 1440px) 996px, 100vw', className: 'project-card__photo', style: `object-position: ${project.image.position}`})
    : ''
  // What the filters read (the codes, the year and the goal numbers)
  const data = ` data-countries="${project.countryCodes.join(' ')}" data-year="${project.year}" data-goals="${project.goalNumbers.join(' ')}" data-slug="${project.slug}"${order === null ? '' : ` data-order="${order}"`}`
  return `
        <li class="project-card${project.image ? ' project-card--photo' : ''}"${data}${colour}>
          <h${level} class="project-card__title"><a href="${projectUrl(project)}">${h.escapeHtml(project.title)}</a></h${level}>
          <p class="project-card__meta"><span class="project-card__year">${project.year}</span><span class="project-card__dot" aria-hidden="true">·</span><span class="project-card__countries">${h.escapeHtml(project.countryNames.join(', '))}</span></p>
          ${photo}
        </li>`
}

// THE SEARCH AND THE FILTERS. Both need JavaScript (the page is static), so they are in the
// HTML with the hidden attribute and main.js shows them: without JavaScript the page is the
// plain list. Within one group the choices are alternatives (India or Brazil); between
// groups they add up (India and 2023). The counts are the totals, and do not change as
// choices are made.
const COUNTRIES_SHOWN = 7
const YEARS_SHOWN = 5

function renderSearch() {
  return `<form class="project-search" role="search" data-project-search hidden>
      <label class="visually-hidden" for="project-search-input">Search projects by name, country or keyword</label>
      <svg class="project-search__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input class="project-search__input" id="project-search-input" type="search" name="q" placeholder="Search by name, country or keyword" autocomplete="off" spellcheck="false" enterkeyhint="search">
      <button type="button" class="project-search__filters" data-filters-toggle aria-expanded="false" aria-controls="project-filters">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span class="visually-hidden">Filters</span>
      </button>
    </form>`
}

function renderFilterGroup({key, title, options, shown, moreLabel, lessLabel}, h) {
  const items = options
    .map((o, i) => `
          <li${shown && i >= shown ? ' hidden data-extra' : ''}><label class="filter-option"><input class="filter-option__input" type="checkbox" value="${h.escapeHtml(o.value)}"><span class="filter-option__box" aria-hidden="true"></span><span class="filter-option__name">${h.escapeHtml(o.name)}</span><span class="filter-option__count">${o.count}<span class="visually-hidden"> project${o.count === 1 ? '' : 's'}</span></span></label></li>`)
    .join('')
  const more = shown && options.length > shown
    ? `
        <button type="button" class="filter-group__more" data-more aria-expanded="false" data-more-label="${h.escapeHtml(moreLabel)}" data-less-label="${h.escapeHtml(lessLabel)}">${h.escapeHtml(moreLabel)}</button>`
    : ''
  return `
      <fieldset class="filter-group" data-group="${key}">
        <legend class="filter-group__title">${title}</legend>
        <ul class="filter-group__list">${items}
        </ul>${more}
      </fieldset>`
}

function renderFilters(projects, h) {
  if (!projects.length) return ''
  const tally = (pairs) => {
    const map = new Map()
    for (const [value, name] of pairs) map.set(value, {value, name, count: (map.get(value)?.count || 0) + 1})
    return [...map.values()]
  }
  // Countries: the ones with most projects first, then A to Z. Years: newest first. Goals: in number order.
  const countries = tally(projects.flatMap((p) => p.countryCodes.map((code, i) => [code, p.countryNames[i]])))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en'))
  const years = tally(projects.map((p) => [String(p.year), String(p.year)])).sort((a, b) => b.value - a.value)
  const goals = tally(projects.flatMap((p) => p.goalNumbers.map((n, i) => [String(n), p.goals[i]]))).sort((a, b) => a.value - b.value)

  const groups = [
    renderFilterGroup({key: 'country', title: 'Country', options: countries, shown: COUNTRIES_SHOWN, moreLabel: `Show all ${countries.length} countries`, lessLabel: 'Show fewer countries'}, h),
    renderFilterGroup({key: 'year', title: 'Year', options: years, shown: YEARS_SHOWN, moreLabel: 'Show all years', lessLabel: 'Show fewer years'}, h),
    goals.length ? renderFilterGroup({key: 'goal', title: 'Sustainable Development Goal', options: goals}, h) : '',
  ].join('')
  return `<section class="project-filters" id="project-filters" aria-labelledby="project-filters-title" data-project-filters hidden>
      <div class="project-filters__head">
        <h2 class="project-filters__title" id="project-filters-title">Filter</h2>
        <button type="button" class="project-filters__clear" data-clear>Clear all</button>
      </div>${groups}
    </section>`
}

// The words the search looks in, one lower-case line per project: title, place, countries,
// goals, tags and the whole summary. A separate file, fetched the first time someone
// searches, so the page itself stays light.
function renderSearchIndex(projects) {
  const index = {}
  for (const p of projects) {
    index[p.slug] = [p.title, p.place, p.countryNames.join(' '), p.goals.join(' '), p.tags.join(' '), p.paragraphs.join(' ')]
      .filter(Boolean).join(' ').replace(/\s+/g, ' ').toLowerCase()
  }
  return JSON.stringify(index)
}

// The sort drop-down (hidden until main.js shows it). The order the build writes the cards in,
// newest year first then A to Z, is "Newest first"; main.js reorders the cards for the others.
function renderSort() {
  return `<div class="project-sort" data-project-sort hidden>
        <label class="project-sort__label" for="project-sort-select">Sort</label>
        <select class="project-sort__select" id="project-sort-select">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A to Z</option>
        </select>
      </div>`
}

// "Show more projects": main.js shows the first few and this adds more. Without JavaScript
// every project is on the page and this is never shown.
function renderShowMore() {
  return `<div class="project-directory__more" data-more-wrap hidden>
      <button type="button" class="project-directory__more-button">Show more projects<span class="visually-hidden" data-more-status></span></button>
    </div>`
}

function renderDirectoryPage(projects, h) {
  // The hidden ", newest first" is read out with the count, and changes with the sort
  const count = `${projects.length} project${projects.length === 1 ? '' : 's'}<span class="visually-hidden">, newest first</span>`
  return {
    file: 'projects/directory/index.html',
    page: {
      title: 'Project directory | Astrotourism',
      description: INTRO,
      canonical: `${h.siteUrl}/projects/directory/`,
      intro: INTRO,
      count,
      search: projects.length ? renderSearch() : '',
      filters: renderFilters(projects, h),
      sort: projects.length ? renderSort() : '',
      more: projects.length ? renderShowMore() : '',
      none: `<div class="project-directory__none" data-none hidden>
      <p>No projects match your search and filters.</p>
      <button type="button" class="project-directory__none-clear" data-clear>Clear all</button>
    </div>`,
      list: projects.length
        ? `<ul class="project-list">${projects.map((p, i) => renderCard(p, h, 2, i)).join('')}
      </ul>`
        : '<p class="project-list__empty">There are no projects here yet. Please check back soon.</p>',
    },
  }
}

// The facts beside the text: year, country (or countries), place, goals
function renderFacts(project, h) {
  const rows = [
    ['Funded by OAD in', String(project.year)],
    [project.countryNames.length > 1 ? 'Countries' : 'Country', h.escapeHtml(project.countryNames.join(', '))],
  ]
  if (project.place) rows.push(['Place', h.escapeHtml(project.place)])
  if (project.goals.length) {
    rows.push(['Sustainable Development Goals', `<ul class="project-facts__goals">${project.goals.map((g) => `<li>${h.escapeHtml(g)}</li>`).join('')}</ul>`])
  }
  return `<dl class="project-facts">${rows
    .map(([name, value]) => `
        <div class="project-facts__row"><dt>${name}</dt><dd>${value}</dd></div>`)
    .join('')}
      </dl>`
}

// "More projects in India": up to two other projects, newest first, from the first of
// this project's countries that has any. Left out when there are none.
function renderMoreInCountry(project, projects, h) {
  for (const [i, code] of project.countryCodes.entries()) {
    const others = projects.filter((p) => p.slug !== project.slug && p.countryCodes.includes(code)).slice(0, 2)
    if (!others.length) continue
    return `<section class="project-more" aria-labelledby="project-more-heading">
        <h2 class="project-more__heading" id="project-more-heading">More projects in ${h.escapeHtml(project.countryNames[i])}</h2>
        <ul class="project-more__list">${others.map((p) => renderCard(p, h, 3)).join('')}
        </ul>
      </section>`
  }
  return ''
}

// The wide photo under the title, at its own shape cut by the CSS to a strip around the hotspot.
// A project with no photo has no band at all (L'chelle, 10 Nov 2026). The photo is the first
// thing on the screen, so it is not lazy-loaded. The credit sits under it, on the right.
function renderProjectPhoto(project, h) {
  if (!project.image) return ''
  const image = project.image
  const credit = image.credit ? `\n      <figcaption class="project__photo-credit">${h.escapeHtml(image.credit)}</figcaption>` : ''
  return `<figure class="project__photo">
      ${h.picture(image, h, {sizes: '(min-width: 1440px) 1312px, 100vw', lazy: false, className: 'project__photo-img', style: `object-position: ${image.position}`})}${credit}
    </figure>`
}

// How the page looks when it is shared: the photo at up to 1400 wide, if it has one
function renderShareImage(project, h) {
  if (!project.image) return ''
  const image = project.image
  const sizes = image.jpg.map((entry) => {
    const [src, width] = entry.split(' ')
    return {src, width: parseInt(width, 10)}
  })
  const pick = sizes.filter((s) => s.width <= 1400).at(-1) || sizes[0]
  const height = Math.round(pick.width / image.ratio)
  return `<meta property="og:image" content="${h.escapeHtml(h.siteUrl + pick.src)}">
  <meta property="og:image:width" content="${pick.width}">
  <meta property="og:image:height" content="${height}">
  <meta property="og:image:alt" content="${h.escapeHtml(image.alt)}">`
}

// "News and updates" about this project: the OAD projects posts that name it, newest first,
// all of them. Plain text rows like "More projects in...", with the date above the title.
// Left out when there are none.
function renderProjectNews(project, h) {
  const posts = (h.newsByProject && h.newsByProject.get(project.slug)) || []
  if (!posts.length) return ''
  const rows = posts.map((post) => `
          <li class="project-card">
            <h3 class="project-card__title"><a href="/news/${h.escapeHtml(post.slug)}/">${h.escapeHtml(post.title.trim())}</a></h3>
            <p class="project-card__meta"><time datetime="${h.escapeHtml(post.publishedAt)}">${h.escapeHtml(h.formatPostDate(post.publishedAt))}</time></p>
          </li>`).join('')
  return `<section class="project-more project-news" aria-labelledby="project-news-heading">
        <h2 class="project-more__heading" id="project-news-heading">News and updates</h2>
        <ul class="project-more__list">${rows}
        </ul>
      </section>`
}

function renderProjectPage(project, projects, h) {
  return {
    file: `projects/directory/${project.slug}/index.html`,
    page: {
      title: `${project.title} | Astrotourism`,
      name: project.title,
      photo: renderProjectPhoto(project, h),
      shareImage: renderShareImage(project, h),
      description: describe(project.paragraphs),
      canonical: `${h.siteUrl}${projectUrl(project)}`,
      // Each paragraph is a <p>; a line break inside one (a bullet list, for example) is kept
      summary: project.paragraphs.map((p) => `<p>${h.escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('\n          '),
      facts: renderFacts(project, h),
      original: project.originalUrl
        ? `<p class="project__original"><a href="${h.escapeHtml(project.originalUrl)}">Original page on astro4dev.org <span aria-hidden="true">&nearr;</span><span class="visually-hidden"> (opens another site)</span></a></p>`
        : '',
      news: renderProjectNews(project, h),
      more: renderMoreInCountry(project, projects, h),
    },
  }
}

module.exports = {loadProjects, renderDirectoryPage, renderProjectPage, renderSearchIndex, projectUrl}
