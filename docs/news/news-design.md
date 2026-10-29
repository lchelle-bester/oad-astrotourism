# News and updates on the homepage (Phase 5)

The approved design for the "news and updates" section of the homepage, and the Sanity content type that will hold every news post. Files beside this one:

- `news-desktop-1440.png`: desktop at 1440 wide
- `news-phone-390.png`: phone at 390 wide
- `news-trails-desktop.svg` and `news-trails-phone.svg`: the star trails behind the section

The homepage order is now: hero, the case, the six pillars, proof, news and updates, get involved, footer.

This phase is only the homepage section and the `post` type in Sanity. The full News page (`/news/`) and the article pages (`/news/<slug>/`) are the next phase. They are designed already, but don't build them yet.

Measurements are from the mock-ups. They are a target, not a pixel contract: build it fluid and check it at every width.

## The idea

The three newest posts, so a visitor can see OAD is active right now. Quiet star trails arc across the background from the top right, like a long-exposure photo of the night sky. They pass through the gaps between the posts but never behind any text. One strong yellow button, the same as the proof section's, takes people to all the news.

## Content

| Item | Text | From |
|---|---|---|
| Eyebrow | News and updates | Sanity (homepage settings) |
| Heading | Latest from OAD | Sanity (homepage settings) |
| Posts | The three newest published posts, newest first | Sanity `post` documents |
| Each post shows | photo, category, date, title | the post |
| Button | See all updates | Sanity (homepage settings) |

No excerpts on the homepage (my decision). The excerpt field still exists in Sanity for the News page and for search engines.

The three posts in the mock-ups are real posts from OAD's astrotourism blog (checked October 2026). Use them as test content (see "Test content" below).

## Sanity: the `post` type

Agree the schema with me before writing it. This is a starting point to discuss, not a decision.

| Field | Type | Required | Notes for the editor |
|---|---|---|---|
| `title` | string | yes | The headline. Warn (don't block) above about 100 characters. |
| `slug` | slug, generated from the title | yes | Becomes the address, for example `/news/starry-safaris-tanzania/`. Never change it after publishing, or old links break. |
| `publishedAt` | date | yes | The date shown on the site. Posts are ordered by this. |
| `category` | one of: News, Events, OAD projects | yes | Used for the label on the card and the filters on the News page. |
| `mainImage` | image with hotspot, plus `alt` (required) and `credit` (optional) | yes | The hotspot lets the editor choose the focus point, so the square crop on phone keeps the important part. |
| `excerpt` | text, up to about 200 characters | no | One or two sentences. Shown on the News page and used as the search-engine description. Not shown on the homepage. |
| `body` | Portable Text: paragraphs, subheadings (H2, H3), bold, italic, links, bulleted and numbered lists, and images (with required alt text and an optional caption) | yes | The article itself. |

Things to settle with me:

1. **Categories: a fixed list or their own document type.** A fixed list (Sanity's `options.list`) is simplest and stops typos, but adding a category needs a code change. A separate `category` type lets Ram and Joy add categories themselves, at the cost of one more thing to manage.
2. **Homepage text** (eyebrow, heading, button label): a `homepage` single document with a news group, or a small `newsSection` document. Match whatever pattern the earlier sections used.
3. **Studio list.** The News list in the Studio sorted by `publishedAt`, newest first, showing the title, date and image in each row.

Things not to add yet: links to projects, authors, tags. We can add them when the project directory exists.

Sanity's draft and publish system already means nothing appears on the site until someone clicks Publish. The plan also wants a second person to review before publishing. What the free plan offers for that is still not checked, so don't promise it.

## How it reaches the page

- `build/build.js` fetches the three newest published posts at build time, the same way as the other sections (public dataset, no token). Only published posts, never drafts.
- Only fetch the fields the card needs: title, slug, date, category, image (with alt, hotspot and crop).
- Escape every value from Sanity before it goes into the HTML.
- **Fewer than three posts:** show what there is. **No posts:** leave the whole section out of the page, and the build must still succeed.
- Check that the Sanity webhook rebuilds the site when a post is published, not only when the earlier section types change. If it filters by document type, add `post`.
- **Images:** use the same approach as the pillar photos. If "link to Sanity's image CDN or self-host" is still an open question, stop and give me the options before writing the image code. Desktop needs about 820px wide (2x for sharp screens), the phone card about 700px, the phone thumbnail about 192 by 192. Ask for WebP with a fallback, and crop using the editor's hotspot.

## Desktop (reference 1440 wide)

| Element | Value |
|---|---|
| Section | background navy `#0f1b2b`, about 680px tall, padding about 80px top |
| Star trails | `news-trails-desktop.svg`, anchored to the top right, behind everything, decorative (`aria-hidden="true"`). Trails are 1 to 1.4px, in white, sand and pale blue at 8 to 28% opacity |
| Header row | eyebrow and heading on the left, the button on the right, bottom-aligned to the heading |
| Eyebrow | Barlow 600, 14px, uppercase, letter-spacing 0.14em, sand `#d9b487` |
| Heading | Space Grotesk 600, 40px, line-height 1.12, white |
| Cards | three equal columns, 40px apart, 44px below the header row, left and right margins 64px |
| Card photo | full card width, rounded 14px, aspect ratio about 15 by 8 (220px tall at this width) |
| Category and date | one line, 14px under the photo. Barlow 600, 12px, uppercase. Category in sand, then a dot in white at 35%, then the date in white at 70% (7.3:1) |
| Title | Space Grotesk 600, 22px, line-height 1.22, white, 14px under the date line |

Every card has a solid navy background behind its photo and text, so the trails show only in the gaps.

## Phone (reference 390 wide)

Version C from the canvas: one big card, then two compact rows.

- Side margins 20px. Eyebrow 12px, heading 28px. Use `news-trails-phone.svg`, which has more trails spread down the whole height.
- **The newest post:** a full card like desktop, photo about 190px tall, title 21px.
- **The next two posts:** each a row with a 96 by 96px square photo (rounded 10px) on the left, and the category, date and title (Space Grotesk 600, 17px) on the right, 14px apart. Thin lines (1px, white at 14%) above each row, 16px padding top and bottom.
- **Trails go between the rows.** Only the text block and the photo in each row get a navy background, not the whole list, so the trails show around and between them but never behind words.
- The button runs the full width, 22px under the list.
- Section about 830px tall.
- Long titles wrap to up to four lines beside the square photo. That's accepted. Don't cut them off.

## The button

Exactly the proof section's button (see `docs/proof/proof-design.md`), with the label "See all updates". Reuse the same CSS class rather than copying it. If it isn't a shared component yet, make it one now and use it in both places.

- Yellow pill, navy text, navy circle with a yellow arrow, soft shadow.
- Hover and keyboard focus turn it white and nudge the arrow 4px right. Focus also gets a 3px white outline. Reduced motion: no arrow movement.
- It links to `/news/`, which will exist after the next phase.

## Links on the cards

- The title is the link. Make the whole card clickable by stretching the title link over the card (one link per card, so keyboard and screen-reader users hear each post once, not twice).
- The site's general rule turns links yellow on hover. On the titles that's fine (yellow on navy is 10.7:1). Also underline the title on hover and focus, so the change isn't shown by colour alone.
- Cards link to `/news/<slug>/`. Those pages are the next phase, so the links will 404 until then. That's fine locally, but tell me before anything deploys to the live address with broken links.

## Accessibility

- `<section aria-labelledby>` pointing at the `<h2>`. The eyebrow is a plain paragraph above it.
- The posts are a list (`<ul>`). Each post is an `<article>` with an `<h3>` title.
- The date is a `<time datetime="2026-07-21">`, written out as "21 July 2026". The capitals come from CSS (`text-transform: uppercase`), not the text itself, so screen readers don't spell it out letter by letter.
- On the homepage cards, the photo can have empty alt text (`alt=""`), because the title next to it already says what the post is and the link would otherwise be read twice. The alt text stored in Sanity is still required, because the article page will use it. Tell me if you think otherwise.
- The trails are decorative (`aria-hidden="true"`).
- Contrast on `#0f1b2b`: white 17.3:1, sand 8.9:1, white at 70% 7.3:1, navy on the yellow button 10.7:1.
- Test at 1440, 1280, 1024, 768, 390 and 320 wide, keyboard only, at 200% zoom, and with reduced motion on.

## Test content

Enter these three in the Studio by hand to test (from OAD's astrotourism blog). Copy OAD's words exactly. Don't rewrite them. Use each post's own photo from the blog, and add its source to `credits.md`.

| Title | Date | Category |
|---|---|---|
| IAU OAD Project in Tanzania Launches Astrotourism Tours | 21 July 2026 | OAD projects |
| Building a Global Astrotourism Community of Practice Through Astronomy for Development | 16 July 2026 | Events |
| AstroDevSA Astro-Tourism Stakeholder Webinar, 30 June 2026 | 19 June 2026 | Events |

Moving all the old posts across is a separate job, and Ram and Joy need to agree which posts move. Don't write a migration script in this phase.

## Decisions still open (bring me options)

1. The `post` schema above, and categories as a fixed list or a document type.
2. Images from Sanity: the CDN or self-hosted (if not already settled with the pillars).
3. The breakpoint between the three-column desktop layout and the phone layout. Between them, at tablet widths, consider two columns or the phone layout.
4. Whether anything should change on card hover beyond the underlined title (for example, the photo brightening slightly).
