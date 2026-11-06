// One article page per post (/news/<slug>/), Phase 7 step d. Turns a post into
// the values for the placeholders in site/templates/news-article.html. Like
// news-pages.js it needs nothing of its own: build.js hands in its helpers as `h`.

const {renderPortableText, describe} = require('./portable-text')

// A photo as a <picture> (WebP with a JPG fallback). Everything that comes from
// Sanity is escaped. `lazy` is false only for the main photo, which is on the first screen.
function picture(image, h, {sizes, lazy = true, className = '', style = ''}) {
  const attributes = [
    `src="${h.escapeHtml(image.src)}"`,
    `srcset="${h.escapeHtml(image.jpg.join(', '))}"`,
    `sizes="${sizes}"`,
    `width="${image.width}"`,
    `height="${image.height}"`,
    `alt="${h.escapeHtml(image.alt)}"`,
    lazy ? 'loading="lazy"' : 'fetchpriority="high"',
    'decoding="async"',
    className ? `class="${className}"` : '',
    style ? `style="${style}"` : '',
  ].filter(Boolean).join(' ')
  return `<picture><source type="image/webp" srcset="${h.escapeHtml(image.webp.join(', '))}" sizes="${sizes}"><img ${attributes}></picture>`
}

// The text under a photo: the caption on the left and the credit on the right.
// Whichever is missing is left out, and with neither there is no figcaption at all.
function captionLine(image, h, className) {
  if (!image.caption && !image.credit) return ''
  const caption = image.caption ? `<span class="${className}__text">${h.escapeHtml(image.caption)}</span>` : ''
  const credit = image.credit ? `<span class="${className}__credit">${h.escapeHtml(image.credit)}</span>` : ''
  return `<figcaption class="${className}">${caption}${credit}</figcaption>`
}

// --ratio (set on the figure, so the photo and its caption both see it) is the photo's own shape; the CSS keeps a tall photo from getting taller
// than 720px (520px on phones): width = min(100%, cap x ratio)
const ownShape = (image) => `--ratio: ${image.ratio.toFixed(4)}`

// The main photo, pulled up over the dark band by the CSS. Its credit is the figcaption.
function renderMainPhoto(image, h) {
  if (!image) return ''
  const credit = image.credit ? `<figcaption class="article__photo-credit">${h.escapeHtml(image.credit)}</figcaption>` : ''
  return `<figure class="article__photo" style="${ownShape(image)}">${picture(image, h, {sizes: '(min-width: 1440px) 1312px, 100vw', lazy: false})}${credit}</figure>`
}

// A photo in the text, at its own shape (the editor's crop)
function renderSinglePhoto(block, images, h) {
  const image = images.byKey[block._key]
  if (!image) return ''
  return `<figure class="article-photo" style="${ownShape(image)}">${picture(image, h, {sizes: '(min-width: 1440px) 1312px, 100vw'})}${captionLine(image, h, 'article-photo__caption')}</figure>`
}

// Two or three photos side by side, equal columns. Each has its own caption and credit.
function renderPhotoRow(block, images, h) {
  const items = (block.images || []).map((photo) => images.byKey[photo._key]).filter(Boolean)
  if (items.length < 2) return ''
  const sizes = items.length === 3 ? '(min-width: 57.5em) 30vw, 100vw' : '(min-width: 57.5em) 46vw, 100vw'
  const figures = items.map((image) =>
    `<figure class="article-row__item">${picture(image, h, {sizes, style: `object-position: ${image.position}`})}${captionLine(image, h, 'article-row__caption')}</figure>`)
  return `<div class="article-row article-row--${items.length}">${figures.join('')}</div>`
}

// Addresses the News section already uses; a post with one of these as its slug
// would hide a real page
const RESERVED = ['page', 'category']

function renderArticle(post, h) {
  if (!/^[a-z0-9-]+$/.test(post.slug) || RESERVED.includes(post.slug)) {
    throw new Error(`News post "${post.title}" has the web address "${post.slug}", which cannot be used (only a to z, 0 to 9 and hyphens, and not "page" or "category").`)
  }
  const category = h.POST_CATEGORIES[post.category]
  if (!category) throw new Error(`News post "${post.title}" has an unknown category "${post.category}".`)

  const images = post.images
  const body = renderPortableText(post.body, {
    ...h,
    custom: {
      image: (block) => renderSinglePhoto(block, images, h),
      imageRow: (block) => renderPhotoRow(block, images, h),
    },
  })
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
      photo: renderMainPhoto(images.main, h),
      body: body.html,
    },
  }
}

module.exports = {renderArticle}
