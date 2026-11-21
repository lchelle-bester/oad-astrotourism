// The map on the Impact page, "Where the change happened" (Phase 10, 21 Nov 2026; mock-ups in
// docs/impact/). A flat map drawn by build/make-world-map.js (a plain SVG picture, no map library),
// with one dot for each country that has a project, sized by how many it has. Choosing a dot shows
// that country's projects in a panel beside the map. The words are fixed here except the small line
// above the heading and the heading itself, which are in Sanity.
//
// One dot per project, at its FIRST country (L'chelle's choice, 21 Nov 2026, as in the mock-up): the
// South West Asia project covers six countries, so it has one dot, at Armenia, and its panel says
// "Armenia and 5 more countries". Every project also appears in the plain list that is written into
// the page, which is what visitors see without JavaScript (main.js hides all but one group and shows
// the map and the arrows).

const positionsFile = require('./map-positions.json')

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

// A group's heading: the country, or, when its only project covers several countries, the first
// country "and 5 more countries"
function groupTitle(group) {
  const only = group.projects.length === 1 ? group.projects[0] : null
  if (only && only.countryNames.length > 1) {
    const more = only.countryNames.length - 1
    return `${group.name} and ${plural(more, 'more country', 'more countries')}`
  }
  return group.name
}

function groupProjects(projects) {
  const groups = new Map()
  for (const project of projects) {
    const code = project.countryCodes[0]
    if (!code) continue // a project with no country has no dot
    if (!groups.has(code)) groups.set(code, {code, name: project.countryNames[0], projects: []})
    groups.get(code).projects.push(project)
  }
  const list = [...groups.values()]
  for (const group of list) {
    const at = positionsFile.positions[group.code]
    if (!at) throw new Error(`Impact page map: there is no map position for the country "${group.name}" (${group.code}). Run node build/make-world-map.js after adding it, or check the country code.`)
    if (at.x < 0 || at.x > 100 || at.y < 0 || at.y > 100) throw new Error(`Impact page map: the dot for ${group.name} falls outside the map frame. Widen the frame in build/make-world-map.js and run it again.`)
    group.x = at.x
    group.y = at.y
    group.title = groupTitle(group)
  }
  // West to east, which is the order of the arrows and of the keyboard
  return list.sort((a, b) => a.x - b.x || a.y - b.y)
}

// Dot size: 12px for one project, 4px more for each further one (the mock-up's India is the biggest)
const dotSize = (count) => 12 + (Math.min(count, 4) - 1) * 4

function renderImpactMap({eyebrow, heading}, projects, h) {
  const groups = groupProjects(projects)
  if (!groups.length) return ''
  const first = Math.min(...projects.map((p) => p.year))
  // Chosen when the page opens: the country with the most projects (then A to Z)
  const start = [...groups].sort((a, b) => b.projects.length - a.projects.length || a.name.localeCompare(b.name))[0]

  const dots = groups
    .map((g) => `
          <button type="button" class="impact-map__dot" role="radio" aria-checked="${g === start}" tabindex="${g === start ? 0 : -1}" data-group="${g.code}" style="left: ${g.x}%; top: ${g.y}%; --dot: ${dotSize(g.projects.length)}px" aria-label="${h.escapeHtml(g.title)}, ${plural(g.projects.length, 'project', 'projects')}"></button>`)
    .join('')

  const panels = groups
    .map((g) => `
        <div class="impact-map__group" data-group="${g.code}"${g === start ? ' data-start' : ''}>
          <div class="impact-map__group-head">
            <h3 class="impact-map__group-title">${h.escapeHtml(g.title)}</h3>
            <div class="impact-map__arrows" hidden>
              <button type="button" class="impact-map__arrow" data-step="-1" aria-label="Previous country"><span aria-hidden="true">&larr;</span></button>
              <button type="button" class="impact-map__arrow" data-step="1" aria-label="Next country"><span aria-hidden="true">&rarr;</span></button>
            </div>
          </div>
          <p class="impact-map__count">${plural(g.projects.length, 'project', 'projects')}</p>
          <ul class="impact-map__projects">${g.projects
            .map((p) => `
            <li><a class="impact-map__project" href="/projects/directory/${h.escapeHtml(p.slug)}/">${h.escapeHtml(p.title)}</a><span class="impact-map__year">${p.year}</span></li>`)
            .join('')}
          </ul>
        </div>`)
    .join('')

  return `
    <section class="impact-map" aria-labelledby="impact-map-heading">
      <div class="impact-map__head">
        <p class="impact-map__eyebrow">${h.escapeHtml(eyebrow)}</p>
        <h2 class="impact-map__heading" id="impact-map-heading">${h.escapeHtml(heading)}</h2>
        <p class="impact-map__intro">${plural(projects.length, 'astrotourism project', 'astrotourism projects')} funded since ${first}.<span class="impact-map__hint" hidden> Choose a country to see its projects.</span></p>
      </div>
      <div class="impact-map__layout">
        <div class="impact-map__map" hidden>
          <div class="impact-map__dots" role="radiogroup" aria-label="Countries with projects">${dots}
          </div>
        </div>
        <div class="impact-map__panel">${panels}
        </div>
        <p class="visually-hidden" role="status" id="impact-map-status"></p>
      </div>
    </section>`
}

module.exports = {renderImpactMap}
