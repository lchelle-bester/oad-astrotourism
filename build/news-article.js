// One article page per post (/news/<slug>/), Phase 7 step d. Turns a post into
// the values for the placeholders in site/templates/news-article.html. Like
// news-pages.js it needs nothing of its own: build.js hands in its helpers as `h`.

const {renderPortableText, describe} = require('./portable-text')

// Addresses the News section already uses; a post with one of these as its slug
// would hide a real page
const RESERVED = ['page', 'category']

function renderArticle(post, h) {
  if (!/^[a-z0-9-]+$/.test(post.slug) || RESERVED.includes(post.slug)) {
    throw new Error(`News post "${post.title}" has the web address "${post.slug}", which cannot be used (only a to z, 0 to 9 and hyphens, and not "page" or "category").`)
  }
  const category = h.POST_CATEGORIES[post.category]
  if (!category) throw new Error(`News post "${post.title}" has an unknown category "${post.category}".`)

  const body = renderPortableText(post.body, h)
  return {
    file: `news/${post.slug}/index.html`,
    skipped: body.skipped,
    page: {
      title: post.title.trim(),
      description: describe(body.text),
      categoryLabel: category,
      categoryUrl: `/news/category/${post.category}/`,
      date: post.publishedAt,
      dateText: h.formatPostDate(post.publishedAt),
      body: body.html,
    },
  }
}

module.exports = {renderArticle}
