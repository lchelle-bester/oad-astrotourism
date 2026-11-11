# Prompt: tidy the structure of three project pages

Give this whole file to the Claude that will do the job, together with `studio/schemaTypes/articleBody.js` (the block shapes) and `build/portable-text.js` (how blocks are drawn). It works from the prompt alone.

---

You are helping to tidy the content of a website for the IAU Office of Astronomy for Development (OAD) astrotourism programme. The site is built from a Sanity project (`gwz91d96`, dataset `production`, public to read; writing needs a token). Each `project` document has a `body` field ("Page content"), a list of Portable Text blocks that was copied from OAD's own project page (its address is in the project's `originalUrl`). The copy kept OAD's words, but it kept some of OAD's rough formatting too. Your job is to fix the **structure** of three projects, without changing a single word.

## The three projects (do these)

1. "Guide Training for the Tribal Students (Phase 2)", about 99 blocks.
2. "Guide training workshop for tribal students" (the 2022 one), about 33 blocks.
3. "The Small Corner of the Stars: An Initiative for Development of Local Communities in "La Tatacoa"", about 28 blocks.

Find them by title with `*[_type == "project" && title match "..."]`, and use the `_id` (it looks like `project-<slug>`).

## Six more to check, and only fix if clearly needed

South Africa ("Astro Tourism for Development: Storytelling, Science, and Socio-Economic Growth in South Africa"), Langkawians Guide Malaysians to the Stars, Anga Explorers for Development, AstroGuides: Transforming Tours with Astrotourism, LUNAA Journeys Stargazing Training Programme, and Vaudemont - Solar Trail for visually impaired. They have a few typed numbers or a cut line each. Apply the same rules, but only where the problem is obvious, and report each change. Leave the other 11 projects alone.

## What is wrong (what to look for)

1. **Typed numbering written as plain paragraphs.** For example separate paragraphs reading "i. Earth (Latitudes and Longitudes...)", "ii. Basic astronomical terms (...)", "iii. Solar System (...)". OAD's own numbering also has mistakes: two items numbered "ii", a missing "c" after "b", a stray capital "H." where "e." was meant.
2. **Lettered section lines written as plain paragraphs.** For example "a. Level 1 Pre-Training test:", "b. Level 1: First training session (...)", "A1. Presentation of the project to local community", "A2. Teacher Training Program (TTP)".
3. **Label lines that introduce a list.** Short lines such as "Astronomical Topics covered" or "Astronomical Activities" followed by a dash, or "Psychological Activities".
4. **Lines cut in the middle of a sentence or a word.** For example one block ends "iv. Cosmic address (Milky Way Galaxy, Local Galaxy Group, Virgo" and the next starts "v. Cluster, Laniakea SuperCluster, Universe)". Another ends with a few words and the next starts "arkSkyAlqueva, La Palma and Antofagasta." (a word cut in two). Another is the line "(Level 2)" on its own after "...Astronomy Guide Training Courses". Another ends "by learning how to" and the next starts "calculate scale distances".
5. **Sections that should be lists but were flattened to paragraphs.** In the 2022 workshop, the "Deliverables" section ("Component 1: Online Guide Training Module (Level 1)" and the lines under it, "Component 2: Online Networking Platform" and its lines) may be a list on OAD's page.

## What to do about each

The decision on typed numbering is made: **real numbered lists.**

- **Typed numbering (1):** a run of consecutive items with typed numerals ("i.", "ii.", "iii." or "1)", "a)", "(i)") becomes one numbered list: each item is a block with `"listItem": "number"` and `"level": 1`, and the typed numeral and the full stop or bracket and space after it are removed from the text. Nothing else in the item changes. A numbered list restarts at 1 whenever a block that is not a list item comes between two runs, so each group gets its own 1, 2, 3. This also removes OAD's numbering mistakes, because the site numbers the items itself. Say in your report where you did that.
- **Lettered section lines (2):** a short line (under about 120 characters) that starts a section becomes a block with `"style": "h3"`. **Keep its text exactly, including the letter or code** ("a. Level 1 Pre-Training test:" stays "a. Level 1 Pre-Training test:"). A long line that starts like that but is really a paragraph (for example "Day 1. Part 1. This we are and we have (2h). Main goal: ...") stays a normal paragraph. The page's main headings are already `h2`, so these are `h3`, never `h2`.
- **Label lines (3):** keep the text exactly and make it bold (add the mark `strong` to its spans). Do not turn it into a heading.
- **Cut lines (4):** join the pieces into one block. The new text must be exactly the old pieces joined, with a single space between them, **except** where a word was cut in two (the second piece starts in the middle of a word): then join with no space. If the second piece starts with a typed numeral that really belongs to the sentence (as "v. Cluster..." after "Virgo" does), keep the words and drop the numeral. If you are not sure whether two blocks belong together, do not join them: list them in your report with both texts so a person can decide.
- **Flattened lists (5):** do not guess. Fetch the project's `originalUrl` and read its HTML. Where OAD's page marks the lines as list items (`<ul>`, `<ol>`, `<li>`), the content must be a list too (`"listItem": "bullet"` for a bullet list, `"number"` for a numbered one, `"level": 1`, or 2 for a nested item). Where OAD's page uses plain paragraphs or headings, leave them as they are.

## The rule that matters most: no words change

This is OAD's own writing. You may change **structure only**: join cut blocks, make blocks into list items or `h3` headings, make a label line bold, and remove typed numerals when you make a numbered list. You must not reword, fix spelling or punctuation (OAD's typos stay), reorder anything, merge or split sentences (except re-joining a cut one), or add or remove any other text. Keep every link, bold and italic mark that is already there: when you join two blocks, join their spans and keep every `markDefs` entry that is still used.

**Do not touch** any non-text block (button, image, imageRow, youtube, spotify), any existing `h2`, any existing list, or any other field of the project (`title`, `sdgs`, `contact`, `photo` and so on, and every other document).

## Block shapes (for reference)

```json
{"_type": "block", "_key": "a1", "style": "normal", "markDefs": [],
 "children": [{"_type": "span", "_key": "s1", "text": "Some words", "marks": []}]}
```
- `style` is `normal`, `h2`, `h3` or `blockquote`. A list item is a `normal` block with `"listItem": "bullet"` or `"number"` and `"level": 1` (2 for nested).
- Bold is the mark `strong`; italic is `em`; a link is a mark whose key is listed in `markDefs`.
- Every block and every span needs a `_key` that is unique within the document. Keep the existing keys of blocks you do not change.

## How to work

1. **Dry run first.** For each project, read the current `body`, make the changes in memory, and **save a backup of the old body** to `.cache/body-backup/<projectId>.json` (the folder is git-ignored; keep it until the work is checked). Save the proposed new bodies to `docs/projects/tidied-projects.json`. Then stop and give me the report. Write nothing to Sanity until I say go.
2. **A "no words lost" check, mandatory.** For every project, take the plain text of the old body and of the new body, and compare them word by word after removing the typed numerals you removed (roman numerals, letters and digits at the start of the items you turned into lists) and ignoring spaces. They must be identical. If any difference remains, stop and show me. Print this check's result for each project.
3. **Never put a token in a file, a commit or the chat.** Use the `SANITY_TOKEN` environment variable or a `.env` file, which is git-ignored. The repository is public. I will create a token with the Editor role and delete it afterwards.
4. **Skip any project that has a draft.** If `drafts.<projectId>` exists, someone is editing it and writing to the published copy would be undone when they publish. Report it and leave it alone.
5. **Write one project at a time,** only the `body` field, with `set`, and print the result. Then verify with a GROQ query that the number of blocks, lists, headings and non-text blocks matches your report.
6. **Never write to a project whose current `body` differs from what you read in step 1.** Fetch it again right before writing. If it changed, someone has edited it: stop and tell me.

## The report I want before any writing

For each project: blocks before and after, how many cut blocks you joined (list each join: the old pieces and the new text), how many numbered lists and items you made, how many `h3` headings you made (list their text), how many label lines you made bold, how many flattened lists you rebuilt from the original page (with the evidence from its HTML), and everything you were unsure about and left alone (both texts shown). Then the result of the "no words lost" check for each project.

## After it is written

Run `node build/build.js` in the repository. It should still print `Project pages with page content: 20` and no line starting `Blocks not drawn on project pages`. Then open the three pages and tell me how the lists and headings look.
