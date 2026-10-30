# Importing news posts into Sanity: guide for the Claude doing the import

You are copying news articles from OAD's astrotourism blog into the Sanity project for the OAD Astrotourism site. This file says exactly what a news post (`_type: "post"`) must contain. It matches `studio/schemaTypes/post.js`, which is the source of truth if the two ever disagree.

Sanity project ID `gwz91d96`, dataset `production`. Writing needs an API token with write access. L'chelle supplies it through an environment variable or a `.env` file that git ignores. Never put the token in any file that is committed, never print it, and never paste it into a commit message. The repo is public.

## The rules that matter most

1. **Copy OAD's words exactly.** Do not paraphrase, summarise, shorten, correct or "improve" anything. Keep their spelling, capitalisation and punctuation, including any dashes. These are OAD's own articles.
2. **Add nothing that is not in the article.** Do not invent alt text details, credits, dates, names or video titles. If something is missing, leave it out and report it (see "Report back").
3. **Only use the fields below.** Do not add extra fields.
4. **Create drafts, not published posts.** Use a document id that starts with `drafts.` (for example `drafts.<a new uuid>`). L'chelle reviews them and publishes in the Studio. Only create published documents (an id without `drafts.`) if L'chelle tells you to.
5. **Do not create duplicates.** Before creating a post, query Sanity for an existing post with the same title or slug. Three test posts already exist (see the end).

## Fields of a `post`

| Field | Type | Required | What to put |
|---|---|---|---|
| `title` | string | yes | The article's headline, exactly as on the blog. Under about 100 characters is better, but never shorten it. |
| `slug` | `{_type: "slug", current: "..."}` | yes | The end of the web address. Must be made from the title with the rule below. Unique among posts. |
| `publishedAt` | date, `YYYY-MM-DD` | yes | The date shown on the blog post. If the blog shows no date, do not guess: leave the post out and report it. |
| `category` | string | yes | Exactly one of the codes `news`, `events`, `oad-projects`. See "Choosing the category". |
| `mainImage` | image | yes | The article's main photo. See "Images". |
| `body` | array (Portable Text) | yes | The article text, in the format described below. Do not repeat the title in it. |

Older notes mention a short summary ("excerpt") field. It was removed and does not exist. Do not add one.

### The slug

The Studio normally generates the slug with a Generate button, which you cannot use. Make it yourself with exactly this rule:

1. Take the title.
2. Remove accents (`é` becomes `e`).
3. Make it lower case.
4. Replace every run of characters that are not `a` to `z` or `0` to `9` with a single hyphen.
5. Remove hyphens from the start and end.
6. Cut it to at most 96 characters, then remove any hyphen left at the end.

`AstroDevSA Astro-Tourism Stakeholder Webinar` becomes `astrodevsa-astro-tourism-stakeholder-webinar`.

Store it as `{"_type": "slug", "current": "astrodevsa-astro-tourism-stakeholder-webinar"}`. Never change a slug after a post exists.

### Choosing the category

- `events`: webinars, workshops, conferences, call-outs for events, event reports.
- `oad-projects`: news about a specific OAD-funded project or initiative.
- `news`: everything else (announcements, publications, general updates).

If an article fits two, choose the one that is its main subject. If you are unsure, pick your best guess and list the post in your report so L'chelle can check.

### Images

- **Upload each image to Sanity** first (the assets API), then refer to it:
  ```json
  {"_type": "image", "asset": {"_type": "reference", "_ref": "image-<id>-<width>x<height>-<format>"},
   "alt": "...", "credit": "..."}
  ```
- **`alt` is required** (the Studio will not publish without it). It says what the photo shows, for people who cannot see it. Use the blog's own alt text if it has one. If it has none, write a plain description of only what is visible (no names, places or claims you cannot see), and list the post in your report as "alt text written by Claude".
- **`credit`** (main image only) is optional. Use the photo credit from the blog if it has one, in the form `Photo: Name / Organisation`. Otherwise leave it out.
- **`hotspot`** (optional): `{"_type": "sanity.imageHotspot", "x": 0.5, "y": 0.5, "width": 0.5, "height": 0.5}`, values from 0 to 1. It tells the site where the important part of the photo is, because the photo is cut to different shapes. Set it only if the subject is clearly off-centre, or the image has text or a graphic that must not be cut. Otherwise leave it out.
- Use the largest version of the image the blog has. Do not alter it.
- For each image, note its original web address in your report. The repo keeps a record of every image's source and licence.

## The article text (`body`)

`body` is Sanity's Portable Text: an array of blocks. Every block, and every span and link inside it, needs a unique `_key` (any short unique string).

### A paragraph

```json
{"_type": "block", "_key": "a1b2c3", "style": "normal", "markDefs": [],
 "children": [{"_type": "span", "_key": "d4e5f6", "text": "The paragraph text.", "marks": []}]}
```

### What is allowed

| In the original article | Use |
|---|---|
| Paragraph | block, `style: "normal"` |
| Heading level 2 | block, `style: "h2"` |
| Heading level 3 | block, `style: "h3"` |
| Heading level 4 or lower | block, `style: "h3"` (report it) |
| Bold | span with `marks: ["strong"]` |
| Italic | span with `marks: ["em"]` |
| Link | a `markDefs` entry `{"_type": "link", "_key": "k1", "href": "https://..."}`, and the span's `marks` holds `"k1"` |
| Bulleted list item | block with `listItem: "bullet"`, `level: 1`, `style: "normal"` |
| Numbered list item | block with `listItem: "number"`, `level: 1`, `style: "normal"` |
| Photo inside the article | image block (below) |
| YouTube video | youtube block (below) |
| Spotify podcast, episode or playlist | spotify block (below) |

The article title is the page's main heading, so never put a level 1 heading in `body`.

Link addresses must start with `https://`, `http://` or `mailto:`, or with `/` for a page on this site. Keep links pointing where the original points. Do not turn a link into plain text or the other way round.

Do not use the `style` values `blockquote` or `h1` and do not add other marks (underline, code, highlights): they do not exist in the schema. Put the text in a normal paragraph and report it.

### A photo inside the article

```json
{"_type": "image", "_key": "g7h8i9",
 "asset": {"_type": "reference", "_ref": "image-<id>-<width>x<height>-<format>"},
 "alt": "What the photo shows", "caption": "Caption from the article, if it has one"}
```

`alt` is required here too, with the same rules as above. `caption` is optional: use the article's caption word for word, or leave it out. `credit` is optional: add it (as `Photo: Name / Organisation`) only if the article gives one, and never put the credit in the caption.

### A YouTube video

```json
{"_type": "youtube", "_key": "j1k2l3",
 "url": "https://www.youtube.com/watch?v=VIDEOID",
 "title": "What the video is", "caption": "Optional caption"}
```

- `url` must be a YouTube video address: `youtube.com/watch?v=...`, `youtu.be/...`, `youtube.com/shorts/...`, `youtube.com/embed/...` or `youtube.com/live/...`, with an 11-character video id. If the article embeds a video by its embed address, convert it to the normal `https://www.youtube.com/watch?v=ID` form.
- `title` is required (screen readers read it). Use the video's real title, from the page or from the surrounding article text. If you cannot find it, write a short plain description and report it.
- Put the block where the video sits in the article.

### A Spotify podcast

```json
{"_type": "spotify", "_key": "m4n5o6",
 "url": "https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk",
 "title": "What the podcast is", "caption": "Optional caption"}
```

- `url` must be an `open.spotify.com` link to an `episode`, `show`, `track`, `album` or `playlist`, with a 22-character id. If the article embeds the player by its embed address (`open.spotify.com/embed/episode/...`), convert it to the normal `https://open.spotify.com/episode/ID` form. `?si=...` on the end is fine.
- `title` is required. Use the episode's real title if the article gives it, otherwise a short plain description, and report it.
- Put the block where the player sits in the article.

### Things the schema cannot hold

Tables, buttons, forms, Vimeo, SoundCloud or social media embeds, PDFs shown inline, image galleries and sliders, and raw HTML are not supported. Do not invent a way to include them. Keep the article's text around them, add a plain link paragraph only if the original has a link, and list every such omission in your report.

## Checks before you save a post

- `title`, `slug`, `publishedAt`, `category`, `mainImage` and a non-empty `body` are all present.
- `category` is one of `news`, `events`, `oad-projects`.
- `publishedAt` is `YYYY-MM-DD`.
- `mainImage.alt` is not empty, and every image block in the body has `alt`.
- Every `_key` is unique within its array.
- The slug is not already used by another post.

## Report back

When you finish, give L'chelle a short list:

- Every post created: title, slug, date, category.
- Every post where you guessed the category, wrote alt text yourself, wrote a video title yourself, or mapped a level 4 heading.
- Everything left out because the schema cannot hold it, and which post it was in.
- Every image's original web address, per post, so it can be added to `credits.md`.
- Any article you skipped, and why.

## Posts that already exist (do not recreate)

| Title | Slug | Date |
|---|---|---|
| IAU OAD Project in Tanzania Launches Astrotourism Tours | `iau-oad-project-in-tanzania-launches-astrotourism-tours` | 2026-07-21 |
| Building a Global Astrotourism Community of Practice Through Astronomy for Development | `building-a-global-astrotourism-community-of-practice-through-astronomy-for-development` | 2026-07-16 |
| AstroDevSA Astro-Tourism Stakeholder Webinar | `astrodevsa-astro-tourism-stakeholder-webinar` | 2026-06-30 |

## What happens after

Drafts do not appear on the site. The homepage shows the three newest published posts by `publishedAt`, and the full News page will list them all. Importing older posts does not change the homepage unless one is newer than 21 July 2026.
