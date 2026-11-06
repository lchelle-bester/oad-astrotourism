# Phase 7: the News page (/news/) and the article pages (/news/<slug>/)

Read CLAUDE.md first, then docs/news/news-design.md, docs/news/post-import-guide.md, studio/schemaTypes/post.js, studio/schemaTypes/buttonColours.js, studio/schemaTypes/sitePages.js, build/build.js, build/navigation.js, site/partials/news.html, site/partials/header.html, site/partials/footer.html and CSS section 10 (homepage news) in site/css/styles.css. Work the way CLAUDE.md says: one step at a time, explain what and why, I make the design decisions, and stop for me at the end of each step.

I approved the designs on a canvas you can't open, so everything you need is written below. Measurements are from 1440 (desktop) and 390 (phone) mock-ups. They are a target, not a pixel contract: build fluid and check every width.

Don't push to GitHub at any point in this phase (Netlify credits). I push when I say so.

## What this phase includes

The News page at /news/, with pages /news/page/2/ and so on.
Category pages at /news/category/news/, /news/category/events/ and /news/category/oad-projects/, with the same layout and their own pages (/news/category/events/page/2/).
One article page per published post at /news/<slug>/.

No Sanity schema changes are planned, apart from what decision 3 below may add. Only published posts, never drafts.

## Step a: write the spec and get my decisions

Save this whole prompt as docs/news-page/news-page-design.md (a new folder like the other phases), then bring me options with trade-offs for each open decision below. Don't build until I answer.

### Open decisions

1. **Button colours on the paper background.** Yellow, sand and white article buttons are 1.4:1, 1.7:1 and 1.1:1 against the paper colour #f6efe5, so they fail the 3:1 rule for controls. Options: (a) on article pages, give those three a 1.5px navy #1e3551 edge (inset box-shadow), which is what the mock-up shows; (b) remove white from the colour list and edge yellow and sand; (c) leave them as they are and tell Ram and Joy to use teal or terracotta.
2. **Quote bar colour.** In the Studio the quote has a yellow bar, but yellow barely shows on paper. The mock-up uses terracotta #af5a4c (4.2:1 on paper, fine for a decorative bar). The other choice is teal #1a524b.
3. **Search-engine description for article pages** (left open in CLAUDE.md on 29 Oct). Options: (a) made automatically from the first paragraph, cut at a word boundary under about 155 characters; (b) a new optional "Search summary" field on the post; (c) the field, falling back to (a) when it's empty.
4. **Wording at the top of the News page** (eyebrow, heading, intro). Fixed in the HTML like the homepage news wording (my choice on 29 Oct), or in Sanity?
5. **How to turn Portable Text into HTML.** Your own small renderer in build/ (no new dependency, every tag under our control) or the @portabletext/to-html package (less code, one more dependency). Say what each means for escaping.
6. **Posts per page.** Suggested: page 1 shows the featured post plus 9 cards, later pages show 12 cards (4 rows of 3). Confirm or give me alternatives.
7. **Tall main photos.** Some main images are portrait event flyers. Suggested: show the main photo at its own shape, but never taller than 720px on desktop and 520px on phones, centred on the paper with object-fit: contain. Confirm or give me alternatives.

### Decisions made (6 Nov 2026, L'chelle)

1. Button colours: option (a). Yellow, sand and white get a 1.5px navy #1e3551 edge on article pages. All five colours stay.
2. Quote bar: teal #1a524b. The Studio's quote bar is changed to teal to match.
3. Search description: option (a), made automatically from the first paragraph, cut at a word boundary under about 155 characters. No schema change.
4. News page wording: fixed in the HTML.
5. Portable Text: our own small renderer in build/, no new dependency. Everything from Sanity goes through escapeHtml, link addresses through safeUrl, unknown block types are skipped.
6. Posts per page: page 1 is the featured post plus 9 cards, later pages 12 cards.
7. Tall main photos: capped at 720px (desktop) and 520px (phones), object-fit: contain, centred on the paper.

## The News page (design "A: grid with pages")

Dark navy page like the homepage (#0f1b2b, the same token).

**Header.** The shared header partial. Mark News as the current page (aria-current="page"). If the header has no current-page style yet, add one: the link in white with a 2px sand #d9b487 line 6px below the text. Same idea in the phone menu.

**Page head** (padding about 72px top, side margin = --gutter, content max 1312px):

- Eyebrow "News and updates": Barlow 600, 13px, uppercase, letter-spacing 0.14em, sand.
- h1 "News": Space Grotesk 600, 64px, line-height 1.05, white, 16px below. Phone 40px.
- Intro "Projects, events and updates from the astrotourism work of the IAU Office of Astronomy for Development.": Barlow 400, 19px, line-height 1.55, white at 75%, max-width 560px, 20px below. Phone 17px.
- Faint star trails at the top right, decorative only (aria-hidden), never behind the heading or intro. Reuse the look of the homepage news trails (same colours and opacities) but static, with no animation. No trails on phones, the same as the homepage. Bring me one option if reusing build/make-star-trails.js is awkward.

**Category filter**, 40px below the intro: `<nav aria-label="Filter by category">` holding four links: All, News, Events, OAD projects. Each one is a pill: min-height 44px, padding 0 20px, fully rounded, 1px border white at 28%, Barlow 600 15px, white at 88%. Hover and focus: yellow border and text. The current one: sand background, navy #0f1b2b text, aria-current="page". 12px apart. 40px of space under the pills, then a 1px line in white at 12%. On phones the pills stay on one line and the row scrolls sideways (overflow-x: auto, 10px gap). They are real links to real pages, so they work without JavaScript.

**Featured post** (page 1 of each list only: the newest post in that list), 48px below the line:

- Photo on the left (flex 1 1 600px), 16:10, rounded 14px. Text on the right (flex 1 1 360px), 56px gap, vertically centred.
- Text: eyebrow "Latest", then category and date line, then the title as an h2 (Space Grotesk 600, 40px, line-height 1.12), then "Read the story" (Barlow 600 17px) with a 44px yellow circle holding a navy arrow. 20px between items.
- The title is the only link, stretched over the whole block, the same pattern as the homepage cards. "Read the story" is decoration (aria-hidden).
- Phone: photo on top at 4:3, title 26px.

**Cards**, 96px below the featured post (on later pages, 48px below the line): a list (`<ul>`) of the same card the homepage uses. Reuse its CSS and the function in build.js that writes it, don't copy them. Photo 15:7 rounded 14px, category and date line 16px under it, title 19px. Grid: repeat(auto-fill, minmax(min(100%, 340px), 1fr)), gap 56px between rows and 96px between columns, which gives three columns of about 373px at 1440. On phones every card keeps its photo (lazy-loaded), one column, 40px apart.

**Page links**, 88px below the cards: `<nav aria-label="Pages">` with "← Newer", the page numbers and "Older →". Each is 44px tall, at least 44px wide, Barlow 600 16px, white at 85%. The current page has a sand circle with navy text and aria-current="page". "Newer" on page 1 (and "Older" on the last page) is plain text at white 35%, not a link. Phones: "Page 1 of 4" on the left (white at 70%, 15px) and an outlined pill "Older posts →" on the right (with "← Newer posts" on later pages). Leave the nav out when there's only one page.

Then 120px of space and the shared footer.

**Empty list.** If a category has no posts, show its page with one line saying there are no posts in that category yet and a link to All. Bring me wording.

## The article page (design "B: light paper")

**Top band**, dark #0f1b2b, holding the header, then the title block (content max 1312px, side margin --gutter, 56px top padding):

- Breadcrumb: `<nav aria-label="Breadcrumb">` with an `<ol>`: "News" (links to /news/) / category name (links to its category page). Barlow 15px, links sand, the slash white at 60% and aria-hidden.
- h1: the post title. Space Grotesk 600, 54px, line-height 1.1, max-width 1100px, 28px below. Phone 30px, line-height 1.15.
- Meta row, 28px below, space-between and wrapping: on the left the category (sand), dot, `<time datetime>` date written out ("23 April 2026"), dot, "3 min read" (12px Barlow 600 uppercase, letter-spacing 0.1em, white at 70%). Reading time = words in the body divided by 200, rounded up, at least 1. On the right a "Copy link" button: 44px tall, rounded, 1px border white at 50%, white text, link icon. On phones the label is "Copy" with aria-label "Copy link to this post", and the meta shows "3 min".
- The band's bottom padding is 260px on desktop and 120px on phones, so the main photo can overlap it.

**Paper.** Everything below the band, down to "More from OAD", sits on #f6efe5. Add it as a named token like --color-night, noted as outside the CI palette (decisions log). Contrast on it, calculated: navy #1e3551 10.9:1, darker ink #13243a 13.7:1, grey #4b5a6e 6.2:1, teal #1a524b 7.8:1, terracotta 4.2:1 (decoration and large text only, never small text).

**Main photo:** pulled up over the band (margin-top -212px on desktop, -96px on phones), full content width (1312px), rounded 16px (phones 12px, inside the 20px side margins), shadow 0 24px 60px rgba(15,27,43,.35). Shown at its own shape (the editor's crop, no hotspot cut), with the alt text from Sanity. Decision 7 covers tall photos. Credit underneath as the figcaption: Barlow 15px, grey #4b5a6e, 14px below. Leave the figcaption out when there's no credit.

Text starts 64px below the photo, left-aligned with it. Every text block (paragraphs, headings, lists, quotes) has max-width 960px. Photos and photo rows can use the full 1312px.

- **Paragraphs:** Barlow 400, 20px, line-height 1.7, navy #1e3551, 28px apart. The first paragraph is the lead: 23px, line-height 1.6, #13243a. Phones: 17px and 19px.
- **Subheading (h2):** Space Grotesk 600, 34px. **Smaller subheading (h3):** 28px, line-height 1.25. Both #13243a, 60px above and 18px below. Phones 26 and 22px, 44px above. The post title is the page's only h1. In the Studio, "Subheading" is h2 and "Smaller subheading" is h3, so the levels already follow on.
- **Links:** teal, underlined, underline offset 4px. Hover and focus: #13243a with a thicker underline (not terracotta, which fails for text). Links to other sites behave like ordinary links.
- Bold and italic as normal. Only load the font weights already in use; if italic needs a new font file, tell me before adding it.
- **Bulleted lists:** 7px terracotta dots. **Numbered lists:** normal numbers in navy.
- **Quote** (style "blockquote"): a `<blockquote>` with a 4px bar on the left (colour from decision 2) and 28px padding, the text in Space Grotesk 600 26px, line-height 1.35, #13243a. The paragraph after it (who said it) is an ordinary paragraph.

**Single photo:** full content width, its own shape, rounded 12px, 56px above and below. Under it a line with the caption on the left (Barlow 15px grey) and the credit on the right (12px Barlow 600 uppercase, letter-spacing 0.08em, grey). Leave out whichever is missing.

**Photos side by side (imageRow):** one row at full content width, equal columns, 20px gap. Two photos are cut to 3:2 and three to 1:1, each around its hotspot. Each photo's own caption and credit go under it (14px). On phones they stack, each at 3:2, 10px apart.

**YouTube video:** click to load (decided 30 Oct). In the HTML it is a link to the video on YouTube, so it works without JavaScript. main.js turns it into a button. It shows the video's still image, downloaded at build time from i.ytimg.com (test which size exists, fall back to a smaller one), at 16:9, rounded 12px. In the middle is a 76px yellow circle with a navy play triangle (white on hover and focus), and across the bottom the video title on a bar of #0b1522 at 85% (Space Grotesk 600 17px, white, 16px 20px padding). The button's accessible name is "Play video: <title> (loads YouTube)". On press, replace it with an iframe from youtube-nocookie.com/embed/<id>?autoplay=1, with title="<video title>". Under it: the optional caption on the left and "Plays from YouTube" (small uppercase) on the right. Use the same youtubeId() rule as post.js.

**YouTube playlist:** the same block when the link is a playlist. There's no still image, so show a play card: a rounded 14px panel in #0f1b2b with 18px padding. Inside: a 72px teal square with a sand list icon, then the eyebrow "YouTube playlist" (sand, 12px uppercase) and the title (Space Grotesk 600 19px white), then a 52px yellow play button. On press, load youtube-nocookie.com/embed/videoseries?list=<id> (not tested yet, so test it). Same caption line.

**Spotify:** the same card with a sand sound-wave icon and the eyebrow "Podcast". On press, load open.spotify.com/embed/<path> (spotifyPath() from post.js) with the iframe title set to the podcast title. Caption line "Plays from Spotify".

**Button block:** colours from studio/schemaTypes/buttonColours.js (import or read the same table, don't copy the hex values by hand), with the edge from decision 1. min-height 48px, padding 0 24px, fully rounded, Barlow 600 16px, left, centre or right as the editor chose. A page of this site uses its address from sitePages.js. An outside address gets a small ↗ after the words, plus "(opens another site)" for screen readers only.

**End of the article**, 72px below the last block: a 1px line in navy at 18%, then 28px below it a row. On the left: "Filed under <category>" (grey 15px, the category a teal link to its category page). On the right: a "Copy link" button (1px border navy at 60%, navy text, link icon) and "← All news" (Barlow 600 16px navy). On phones: the Copy link button at full width, then the Filed under and All news row.

**More from OAD**, back on #0f1b2b, 120px below, padding 88px top and 96px bottom:

- Eyebrow "Keep reading", h2 "More from OAD" (40px, phones 28px), and the shared .pill-button "See all updates" on the right, bottom-aligned (on phones below the list, as on the homepage).
- Three posts: the three newest other posts in the same category, topped up with the newest posts from any category when there aren't three. On desktop, the homepage cards in the same 96px-gap grid. On phones, the homepage's text-only rows (category and date line, 17px title, thin lines between).
- Leave the section out if there are no other posts.

Then the shared footer.

**Copy link:** the button is rendered with the hidden attribute, and main.js shows it only when navigator.clipboard is available, so nobody gets a button that does nothing. On press, copy the page's full address. The label changes to "Link copied" for 2 seconds and an aria-live="polite" region announces it. No email or social buttons, and no third-party scripts.

**Head of each article page:** `<title>` "<post title> | Astrotourism", the description from decision 3, a canonical link, and og:title, og:description and og:image (the main photo at 1200 wide).

## Images

Use the same approach as the pillar and news photos: download at build time, never enlarged, WebP with a JPG fallback, with alt text from Sanity. Suggested widths: main photo 800, 1312 and 2000; single photos the same; row photos 480 and 960; YouTube stills 640 and 1280. Card images reuse the homepage card files. Lazy-load everything below the first screen, but not the article's main photo. Add every downloaded image's source to credits.md the way the existing phases do, or tell me if that should be one line for the whole news collection.

## Breakpoints

Use the existing switches: header at 1240px, and the phone layout below 920px (57.5em) as in the homepage news section. Between 920 and 1240 the grid gives two columns on its own. Check 1440, 1280, 1024, 920, 768, 390 and 320.

## Steps (stop after each one, tell me what to check, suggest a commit message)

a. Save the spec and get my decisions (above).
b. build.js: fetch every published post once (all fields, including body), then write /news/, the category pages and the pages after page 1 as plain HTML with no new CSS yet. Explain how one template becomes many pages. Each post's link already points to /news/<slug>/.
c. News page CSS, desktop then phone (a new numbered section in styles.css).
d. Article page: the Portable Text renderer for text blocks (paragraphs, headings, lead, links, bold, italic, lists, quotes) and one page per post, with the top band, paper and end row. Escape everything from Sanity.
e. Article images: main photo, single photos, photos side by side.
f. YouTube video, YouTube playlist and Spotify, with click to load in main.js.
g. Button block, Copy link, and More from OAD.
h. Page head tags (title, description, canonical, og) and reading time.
i. Phase-end checklist: every width above, keyboard only (focus visible on every link and button, playing a video works with Enter and Space), screen reader order (title before meta on cards, breadcrumb, landmarks), 200% zoom, reduced motion, JavaScript off (videos are links, no copy button, every page and filter still works), contrast, no sideways scroll, no console errors, a post with every block type, a category with no posts, and a build with no posts at all (it must still succeed).

When the phase is done, update CLAUDE.md: current state, decisions log (with the decisions above and the new paper colour) and open decisions.
