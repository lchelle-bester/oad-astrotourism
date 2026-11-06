// The News page and its relatives (Phase 7, step b): /news/, /news/page/2/ and
// so on, and the same set for each category (/news/category/events/ ...).
//
// This file only turns a list of posts into the pieces of each page (the filter
// pills, the featured post, the cards, the page links) and says where each page
// goes. build.js owns everything that needs Sanity or the template engine and
// hands its helper functions in as `h`, so this file needs nothing of its own.

const INTRO =
  'Projects, events and updates from the astrotourism work of the OAD.'

// Where a list lives. "all" is /news/, a category is /news/category/<code>/;
// page 2 and later add page/<n>/.
function listUrl(key, page) {
  const base = key === 'all' ? '/news/' : `/news/category/${key}/`
  return page > 1 ? `${base}page/${page}/` : base
}

// PAGE SIZES (6 Nov 2026, L'chelle: fewer posts per page, and no lone card at the
// end). The pages are built ahead of time, so one size has to suit a phone (1
// column), a tablet (2) and a desktop (3).
// Target 6 (two rows of 3, three rows of 2).
// A page is "clean" when its cards fill every row in both grids: an even
// count (no lone card in the 2-column grid) that is not 1 more than a multiple
// of 3 (no lone card in the 3-column grid). So 6 is clean; 4 and 10 leave one
// card alone in 3 columns; odd counts leave one alone in 2 columns. The
// planner picks page sizes from 2 to 9 with the lowest cost, which keeps pages
// near 6 and avoids lone cards; when the number of cards is odd, one odd page
// cannot be avoided, and it is placed last.
const TARGET = 6

function pageCost(size, last) {
  let cost = Math.abs(size - TARGET) * (last ? 2 : 8)
  if (size % 3 === 1) cost += 50 // a lone card in the 3-column grid
  if (size % 2 === 1) cost += last ? 40 : 45 // a lone card in the 2-column grid
  if (size < 3) cost += 30 // a nearly empty page
  return cost
}

function planPageSizes(cards) {
  if (cards <= 0) return [0]
  const memo = new Map()
  const best = (rest) => {
    if (memo.has(rest)) return memo.get(rest)
    let result = null
    for (let size = 2; size <= 9 && size <= rest; size++) {
      const last = size === rest
      const tail = last ? {cost: 0, sizes: []} : best(rest - size)
      if (!tail) continue
      const cost = pageCost(size, last) + tail.cost + (last ? 0 : 3) // 3: each extra page costs a little
      if (!result || cost < result.cost) result = {cost, sizes: [size, ...tail.sizes]}
    }
    memo.set(rest, result)
    return result
  }
  const plan = best(cards)
  // a lone page of 1 card (cards === 1) has no valid size: allow it
  return plan ? plan.sizes : [cards]
}

// Page 1 is the featured post plus its cards; every page is planned by planPageSizes.
// An empty list still gets one page, which says there is nothing yet.
function splitIntoPages(posts) {
  if (!posts.length) return [[]]
  const sizes = planPageSizes(posts.length - 1)
  const pages = [posts.slice(0, 1 + sizes[0])]
  let at = 1 + sizes[0]
  for (const size of sizes.slice(1)) {
    pages.push(posts.slice(at, at + size))
    at += size
  }
  return pages
}

// The four pills. They are real links to real pages, so they work without JavaScript.
function renderFilter(current, h) {
  const items = [['all', 'All'], ...Object.entries(h.POST_CATEGORIES)]
  const links = items.map(([key, label]) => {
    const here = key === current ? ' aria-current="page"' : ''
    return `
          <li><a class="news-filter__link" href="${listUrl(key, 1)}"${here}>${h.escapeHtml(label)}</a></li>`
  }).join('')
  return `<nav class="news-filter" aria-label="Filter by category">
        <ul class="news-filter__list">${links}
        </ul>
      </nav>`
}

// The newest post of a list, shown big on page 1. The title is the only link
// (stretched over the block by the CSS) and comes before the category and date
// in the HTML so screen readers hear the title first; the CSS puts "Latest",
// then the category and date, then the title on screen.
function renderFeature(post, h) {
  const category = h.POST_CATEGORIES[post.category]
  if (!category) throw new Error(`News post "${post.title}" has an unknown category "${post.category}".`)
  const photo = h.renderNewsPhoto(post.shapes, {
    shape: 'feature',
    className: 'news-feature__photo',
    sizes: '(min-width: 57.5em) 55vw, 100vw',
    lazy: false,
  })
  return `
      <article class="news-feature">${photo}
        <div class="news-feature__text">
          <p class="news-feature__eyebrow">Latest</p>
          <h2 class="news-feature__title"><a href="/news/${h.escapeHtml(post.slug)}/">${h.escapeHtml(post.title.trim())}</a></h2>
          <p class="news-card__meta"><span class="news-card__category">${h.escapeHtml(category)}</span><span class="news-card__dot" aria-hidden="true">·</span><time datetime="${h.escapeHtml(post.publishedAt)}">${h.escapeHtml(h.formatPostDate(post.publishedAt))}</time></p>
          <span class="news-feature__more" aria-hidden="true">Read more <span class="news-feature__arrow">&rarr;</span></span>
        </div>
      </article>`
}

// Page numbers: always the first, the last and the ones next to the current
// page, with "..." where numbers are left out.
function pageNumbers(current, total) {
  const wanted = new Set([1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total))
  const numbers = [...wanted].sort((a, b) => a - b)
  const out = []
  numbers.forEach((n, i) => {
    if (i > 0 && n - numbers[i - 1] > 1) out.push(null)
    out.push(n)
  })
  return out
}

// "Newer / 1 2 3 / Older" for wide screens and "Page 1 of 4" with one or two
// pill links for phones. Both are in the HTML and the CSS shows one of them
// (display: none also hides it from screen readers, so each person meets one).
// Left out when there is only one page.
function renderPager(key, current, total) {
  if (total < 2) return ''
  const link = (page, text, cls = '') =>
    `<a class="news-pager__link${cls}" href="${listUrl(key, page)}">${text}</a>`
  const off = (text) => `<span class="news-pager__link news-pager__link--off">${text}</span>`
  const newer = current > 1 ? link(current - 1, '<span aria-hidden="true">&larr;</span> Newer') : off('<span aria-hidden="true">&larr;</span> Newer')
  const older = current < total ? link(current + 1, 'Older <span aria-hidden="true">&rarr;</span>') : off('Older <span aria-hidden="true">&rarr;</span>')
  const numbers = pageNumbers(current, total).map((n) => {
    if (n === null) return '<li class="news-pager__gap" aria-hidden="true">&hellip;</li>'
    const attributes = n === current ? ' aria-current="page"' : ''
    return `<li><a class="news-pager__link news-pager__link--number" href="${listUrl(key, n)}" aria-label="Page ${n}"${attributes}>${n}</a></li>`
  })
  const phoneLinks = [
    current > 1 ? `<a class="news-pager__pill" href="${listUrl(key, current - 1)}"><span aria-hidden="true">&larr;</span> Newer posts</a>` : '',
    current < total ? `<a class="news-pager__pill" href="${listUrl(key, current + 1)}">Older posts <span aria-hidden="true">&rarr;</span></a>` : '',
  ].join('')
  return `
      <nav class="news-pager" aria-label="Pages">
        <ul class="news-pager__list">
          <li>${newer}</li>
          ${numbers.join('\n          ')}
          <li>${older}</li>
        </ul>
        <div class="news-pager__phone${current > 1 && current < total ? ' news-pager__phone--both' : ''}">
          <p class="news-pager__summary">Page ${current} of ${total}</p>
          ${phoneLinks}
        </div>
      </nav>`
}

function renderEmpty(key, h) {
  const label = key === 'all' ? null : h.POST_CATEGORIES[key]
  return label
    ? `<p class="news-page__empty">There are no posts in ${h.escapeHtml(label)} yet. <a href="/news/">See all news</a>.</p>`
    : '<p class="news-page__empty">There are no posts yet. Please check back soon.</p>'
}

// Every list page of the News section as {file, page}: the file inside dist/
// and the values for the placeholders in site/templates/news-list.html.
// `posts` is every published post, newest first, each with its photo shapes.
function renderNewsListPages(posts, h) {
  const lists = [
    {key: 'all', label: 'News', posts},
    ...Object.entries(h.POST_CATEGORIES).map(([key, label]) => ({key, label, posts: posts.filter((p) => p.category === key)})),
  ]
  const result = []
  for (const list of lists) {
    const pages = splitIntoPages(list.posts)
    pages.forEach((pagePosts, i) => {
      const number = i + 1
      const featured = number === 1 && pagePosts.length ? pagePosts[0] : null
      const cardPosts = featured ? pagePosts.slice(1) : pagePosts
      const url = listUrl(list.key, number)
      const name = list.key === 'all' ? 'News' : `${list.label} | News`
      result.push({
        file: `${url.slice(1)}index.html`,
        page: {
          title: `${number > 1 ? `${name}, page ${number}` : name} | Astrotourism`,
          description: INTRO,
          intro: INTRO,
          filter: renderFilter(list.key, h),
          featured: featured ? renderFeature(featured, h) : '',
          cards: cardPosts.length
            ? `<ul class="news-page__list">${h.renderNewsCards(cardPosts, {itemClass: 'news-page__item', lead: false, level: 2})}
      </ul>`
            : '',
          empty: list.posts.length ? '' : renderEmpty(list.key, h),
          pager: renderPager(list.key, number, pages.length),
        },
      })
    })
  }
  return result
}

module.exports = {renderNewsListPages, listUrl, splitIntoPages}
