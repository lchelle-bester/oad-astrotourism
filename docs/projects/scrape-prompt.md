# Prompt: fill the project pages from OAD's own pages

**Note, 11 Nov 2026:** this prompt was run for the goals and the page content. Its rule to leave the contact person out is replaced: Ram and Joy agreed that contact details can be shown, and `docs/projects/scrape-contacts-prompt.md` is the second pass that adds them.

Give this whole file to the Claude that will do the scraping, together with `studio/schemaTypes/project.js`, `studio/schemaTypes/articleBody.js` and `build/import-projects.js` (for the text clean-up code). It works from the prompt alone.

---

You are helping to fill in the content of a website for the IAU Office of Astronomy for Development (OAD) astrotourism programme. The site is built from a Sanity project (`gwz91d96`, dataset `production`, which is public to read; writing needs a token). It has 20 `project` documents. Each project already has a title, year, countries and a plain text `summary`. Your job is to add two things to each project, from OAD's own pages, without changing anything else.

## Job 1: fill in the Targeted SDGs

Source: https://astrotourism.astro4dev.org/astrotourism-funded-projects/ (a table of the 20 projects with the columns Project Title, Country, Implementation Year, Targeted SDG and Project Link).

The `sdgs` field is a list of numbers (for example `[4, 8]`). The table writes them as "04. Quality Education, 08. Decent Work and Economic Growth", so the numbers are 4 and 8. Seven projects currently have no goals and the table has them: LUNAA Journeys (4, 8), AstroGuides (1, 8), Anga Explorers (1, 8), LuNaR (8, 10), Starry Safaris (8, 10), the South Africa project (4, 8) and Starlight Bridges (9, 11). Read the table yourself and do not trust this list: where the table and Sanity differ, show me the difference and set the table's goals, sorted ascending. Where they already agree, change nothing. Match projects by their Project Link against the project's `originalUrl` (ignore `www.`, a trailing slash and tracking parameters such as `?_ga=`), not by title.

## Job 2: fill in the page content

Every project has an `originalUrl` (for example https://astro4dev.org/development-of-astro-tourism-in-south-west-asia/). Read that page. Write what is on it into the project's `body` field (called "Page content" in the Studio), as Portable Text, so the project page on our site shows OAD's full page instead of just the short summary.

### What to take from the page

The main content of the project: the text (descriptions, background, aims, activities, results), its subheadings, lists, links, any photos or galleries inside the content, any videos, and any download or resource buttons (for example "Project Report" and "Project Resources", which link to Google Drive).

### What to leave out

- The page title (our page already has it as its main heading).
- Navigation, header, footer, cookie notices, share buttons (WhatsApp, Facebook and so on).
- The related posts, "more stories" cards and promotional banners.
- The location, year, tags and the SDG icons picture (we already hold these as separate fields).
- **The contact person's name and email address.** This is decided: personal contact details are not copied into our public dataset. People can reach the project through the "Original page on astro4dev.org" link on our page.
- Logos, icons, and the thumbnails of other posts.

### Keep OAD's words exactly

This is OAD's own writing. Do not summarise, rewrite or paraphrase. Keep every paragraph, in order. Keep the wording, the spelling and the numbers. The only changes allowed are repairing damaged characters and the tidying listed below.

- OAD's pages contain some text saved in the wrong encoding. For example a quote mark appears as `â` followed by invisible control characters, and `\x92` stands for an apostrophe. `build/import-projects.js` has a `repair()` function that fixes these correctly: use the same logic. Report how many repairs you made on each page.
- Strip tracking parameters (`?_ga=...`, `utm_...`) from every link you keep.
- Make links absolute (https://astro4dev.org/...). Only keep links that are https, http or mailto. Do not keep a mailto link that belongs to the contact person.
- Collapse repeated spaces and drop empty paragraphs.

### The shape to write

The `body` field is a list of blocks. Every block, and every span or child inside it, needs a unique `_key` (any short unique string). These are the only block types you may use.

**A paragraph, subheading, quote or list item:**
```json
{"_type": "block", "_key": "a1", "style": "normal",
 "markDefs": [{"_key": "l1", "_type": "link", "href": "https://example.org/"}],
 "children": [
   {"_type": "span", "_key": "s1", "text": "Some words ", "marks": []},
   {"_type": "span", "_key": "s2", "text": "in bold", "marks": ["strong"]},
   {"_type": "span", "_key": "s3", "text": " and a link", "marks": ["l1"]}
 ]}
```
- `style` is one of `normal`, `h2` (a subheading), `h3` (a smaller subheading) or `blockquote`. The page title is already the main heading, so the biggest heading you may use is `h2`. Use `h2` for the page's main section headings and `h3` for lower levels.
- Bold is the mark `strong` and italic is `em`. A link is a mark whose key points to an entry in `markDefs`.
- A list item is a normal block with `"listItem": "bullet"` or `"listItem": "number"` and `"level": 1` (2 for a nested item).

**A single photo:**
```json
{"_type": "image", "_key": "i1", "asset": {"_type": "reference", "_ref": "image-..."},
 "alt": "What the photo shows", "caption": "Optional", "credit": "Optional"}
```
Download the image from OAD's page and upload it to Sanity's assets (`client.assets.upload('image', buffer, {filename})`), then reference the returned `_id` as `_ref`. Use the original, largest version, not a thumbnail. **`alt` is required and must say what the photo shows**: use OAD's own alt text if it has one, otherwise write a short plain description from what you can see and the caption, and list it in your report as "alt text written by me". Add `caption` and `credit` only if the page has them.

**Two or three photos side by side** (a gallery or a row of images that sit together):
```json
{"_type": "imageRow", "_key": "r1", "images": [ {image}, {image} ]}
```
Each inner image has the same fields as a single photo, with its own `_key`. Two or three only: split a longer gallery into rows of two or three.

**A button** (a download, report or resources link):
```json
{"_type": "button", "_key": "b1", "label": "Project Report", "url": "https://drive.google.com/...", "colour": "yellow", "align": "left"}
```
Use the button's own words for `label` (40 characters or fewer). `url` must be https or http. `colour` is one of `yellow`, `sand`, `white`, `teal`, `terracotta`: use `yellow` for every button. `align` is `left`.

**A YouTube video or playlist:**
```json
{"_type": "youtube", "_key": "y1", "url": "https://www.youtube.com/watch?v=...", "title": "What the video is", "caption": "Optional"}
```
`title` is required. Take it from the page; if there is none, use the video's own title.

(A `spotify` block exists too, with `url` and `title`: use it only for a Spotify link.)

Anything else on the page that does not fit these types, such as an embedded map, a form or a table: do not invent a block for it. Leave it out and list it in your report, with the project and what it was, so a person can decide.

### What not to change

Do not touch `summary`, `title`, `slug`, `year`, `countries`, `place`, `photo`, `cardColour`, `tags`, `originalUrl` or any news post. You write only `sdgs` and `body`, using `set`, on the 20 project documents.

## How to work (rules)

1. **Read first, write nothing yet.** For every project: read the table, then fetch the page at its `originalUrl`, convert it to the blocks above, and save everything to `docs/projects/scraped-projects.json` (an array of `{projectId, originalUrl, sdgs, body}`, with images listed by source address and not yet uploaded). Then stop and give me the report. Do not write to Sanity until I say go.
2. **Be polite to the site.** Fetch one page at a time, wait at least two seconds between requests, and use a generic client name (for example `OAD site content import`) in the User-Agent, never anyone's personal email.
3. **Never put a token in a file, a commit or the chat.** Read it from the `SANITY_TOKEN` environment variable or a `.env` file in the repo, which is git-ignored. The repository is public. I will create the token with the Editor role and delete it when you are done.
4. **Skip any project that has a draft.** If `drafts.<projectId>` exists, someone is editing it, and writing to the published copy would be undone when they publish. Report it and leave it alone.
5. **Do not overwrite.** If a project already has a non-empty `body`, report it and skip it.
6. **Check before writing.** Each project id must be an existing published `project` document. Each image must upload successfully before you reference it. Validate every block against the shapes above (required fields, allowed values, unique keys) and fix or drop anything that does not match, and say so.
7. **Write one project at a time,** with `set`, and print the result for each.
8. **Verify afterwards** with a GROQ query that returns each project's `title`, `sdgs`, and the number of blocks, images, buttons and links in its `body`, and compare it with your report.

## The report I want (before any writing)

For each of the 20 projects: the page address, whether it loaded, the number of paragraphs, subheadings, lists, links, photos, buttons and videos you found, how many text repairs you made, anything you left out (and why), and anything uncertain (alt text you wrote, a link you could not classify, a block that did not fit). Then the table check: which projects' `sdgs` would change and to what. Flag any project whose page has almost no content beyond the summary, and any two projects with identical pages (the two Tanzania projects, "Astro-tourism development in Tanzania" 2022 and "Astro Tourism Development Tanzania" 2023, have identical summaries, so their pages may be identical).

## After it is written

Run `node build/build.js` in the repository. It should print `Project pages with page content: 20` (or the number you wrote) and no line starting `Blocks not drawn on project pages`. If it does print that line, tell me which blocks and why.
