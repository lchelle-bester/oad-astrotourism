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

// VIDEOS AND PODCASTS (step f). Nothing from YouTube or Spotify is loaded until someone
// presses play (decided 30 Oct 2026, for privacy and page weight). In the HTML each one
// is a plain link to YouTube or Spotify, so it works without JavaScript; main.js turns
// the link into a button and, when pressed, swaps it for the player. The player address
// is made here from the validated id, never from the editor's text, and main.js only
// accepts addresses on these two hosts.
const TRIANGLE = '<svg viewBox="0 0 24 24" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'
const LIST_ICON = '<svg viewBox="0 0 24 24" focusable="false"><path d="M3 6h13v2H3zM3 11h13v2H3zM3 16h8v2H3zM18 11v8l5-4z" fill="currentColor"/></svg>'
const WAVE_ICON = '<svg viewBox="0 0 24 24" focusable="false"><path d="M3 10h2v4H3zM7 7h2v10H7zM11 4h2v16h-2zM15 8h2v8h-2zM19 10h2v4h-2z" fill="currentColor"/></svg>'

// The line under a player: the caption (if any) on the left, where it plays from on the right
function embedCaption(block, host, h) {
  const caption = (block.caption || '').trim()
  return `<figcaption class="embed__caption">${caption ? `<span class="embed__text">${h.escapeHtml(caption)}</span>` : ''}<span class="embed__source">Plays from ${host}</span></figcaption>`
}

// One embed. `card` is the play card (playlists, podcasts, and videos with no still image);
// a video with a still image shows that picture with the title on a bar.
function renderEmbed({block, kind, host, href, embed, still, icon, eyebrow, height}, h) {
  const title = (block.title || '').trim() || eyebrow
  const data = [
    `data-embed-src="${h.escapeHtml(embed)}"`,
    `data-embed-title="${h.escapeHtml(title)}"`,
    `data-embed-label="${kind}"`,
    `data-embed-host="${host}"`,
    height ? `data-embed-height="${height}"` : '',
  ].filter(Boolean).join(' ')
  const hidden = `<span class="visually-hidden"> (opens ${host})</span>`
  if (still) {
    return `<figure class="embed embed--video"><div class="embed__frame" ${data}><a class="embed__trigger" href="${h.escapeHtml(href)}"><img class="embed__still" src="${h.escapeHtml(still.src)}" width="${still.width}" height="${still.height}" alt="" loading="lazy" decoding="async"><span class="embed__play" aria-hidden="true">${TRIANGLE}</span><span class="embed__bar">${h.escapeHtml(title)}${hidden}</span></a></div>${embedCaption(block, host, h)}</figure>`
  }
  return `<figure class="embed embed--card"><div class="embed__frame" ${data}><a class="embed__trigger" href="${h.escapeHtml(href)}"><span class="embed__icon" aria-hidden="true">${icon}</span><span class="embed__label"><span class="embed__eyebrow">${eyebrow}</span><span class="embed__title">${h.escapeHtml(title)}${hidden}</span></span><span class="embed__play" aria-hidden="true">${TRIANGLE}</span></a></div>${embedCaption(block, host, h)}</figure>`
}

function renderYoutube(block, images, h) {
  const source = h.media.youtubeSource(block.url)
  if (!source) return ''
  if (source.kind === 'playlist') {
    return renderEmbed({
      block, kind: 'playlist', host: 'YouTube', icon: LIST_ICON, eyebrow: 'YouTube playlist',
      href: `https://www.youtube.com/playlist?list=${source.id}`,
      embed: `https://www.youtube-nocookie.com/embed/videoseries?list=${source.id}&autoplay=1&rel=0`,
    }, h)
  }
  return renderEmbed({
    block, kind: 'video', host: 'YouTube', icon: TRIANGLE, eyebrow: 'YouTube video',
    href: `https://www.youtube.com/watch?v=${source.id}`,
    embed: `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`,
    still: images.youtube[block._key],
  }, h)
}

function renderSpotify(block, h) {
  const path = h.media.spotifyPath(block.url)
  if (!path) return ''
  // A single episode or track is the slim player, a show, album or playlist the tall one
  const slim = /^(episode|track)\//.test(path)
  return renderEmbed({
    block, kind: 'podcast', host: 'Spotify', icon: WAVE_ICON, eyebrow: 'Podcast',
    href: `https://open.spotify.com/${path}`,
    embed: `https://open.spotify.com/embed/${path}`,
    height: slim ? 152 : 352,
  }, h)
}

// THE BUTTON BLOCK (step g). Colours come from studio/schemaTypes/buttonColours.mjs (the
// Studio's own table), pages from sitePages.mjs. A button the page cannot draw (no words,
// both or neither of page and address, a page that is not in the list, an address that is
// not https or http) is left out and counted, so the build shows it. On the paper
// background the light colours (yellow, sand, white are 1.4, 1.7 and 1.1:1 against it)
// get a navy edge, decided 6 Nov 2026: any colour under 3:1 against the paper does.
const PAPER = '#f6efe5' // the same as --color-paper in the CSS

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

function renderButton(block, h) {
  const label = (block.label || '').trim()
  if (!label) return ''
  let href
  let outside = false
  if (block.page && !block.url) {
    if (!h.buttons.pages.some((page) => page.value === block.page)) return ''
    href = block.page
  } else if (block.url && !block.page) {
    href = h.safeUrl(block.url, ['https:', 'http:'])
    if (!href) return ''
    outside = true
  } else {
    return ''
  }
  const colour = h.buttons.colours.find((c) => c.value === block.colour) || h.buttons.colours[0]
  const align = ['left', 'center', 'right'].includes(block.align) ? block.align : 'left'
  const edged = contrast(colour.hex, PAPER) < 3 ? ' article-button__link--edged' : ''
  const arrow = outside ? ' <span aria-hidden="true">&nearr;</span><span class="visually-hidden"> (opens another site)</span>' : ''
  return `<p class="article-button article-button--${align}"><a class="article-button__link${edged}" href="${h.escapeHtml(href)}" style="--btn-bg: ${colour.hex}; --btn-ink: ${colour.ink}">${h.escapeHtml(label)}${arrow}</a></p>`
}

// MORE FROM OAD (step g): the three latest posts after the article, whatever their
// category and not the one being read (L'chelle, 6 Nov 2026; first it was the same
// category). The homepage's news section in an article page. Left out when there are
// no other posts.
function renderMore(post, h) {
  const picks = h.allPosts.filter((p) => p.slug !== post.slug).slice(0, 3)
  if (!picks.length) return ''
  return `
    <section class="news news--more" aria-labelledby="more-heading">
      <div class="news__inner">
        <div class="news__intro">
          <p class="news__eyebrow">Keep reading</p>
          <h2 id="more-heading" class="news__heading">More from OAD</h2>
        </div>
        <ul class="news__list">${h.renderNewsCards(picks)}
        </ul>
        <a class="pill-button news__button" href="/news/">See all updates <span class="pill-button__icon" aria-hidden="true">&rarr;</span></a>
      </div>
    </section>`
}

// Minutes to read: the words of the text blocks divided by 200, rounded up, at least 1
// (decided in the Phase 7 spec). Captions, button words and the players are not counted.
function readingTime(text) {
  const words = text.join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
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
      youtube: (block) => renderYoutube(block, images, h),
      spotify: (block) => renderSpotify(block, h),
      button: (block) => renderButton(block, h),
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
      readMinutes: readingTime(body.text),
      canonical: `${h.siteUrl}/news/${post.slug}/`,
      shareImage: images.share ? `${h.siteUrl}${images.share.src}` : '',
      shareImageWidth: images.share ? images.share.width : '',
      shareImageHeight: images.share ? images.share.height : '',
      shareImageAlt: images.share ? images.share.alt : '',
      body: body.html,
      more: renderMore(post, h),
    },
  }
}

module.exports = {renderArticle}
