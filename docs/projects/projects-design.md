# Phase 8: Project data and the directory (/projects/directory/)

Started 10 Nov 2026. First phase of the Projects and impact section. The site plan (Google Doc "Astrotourism Site Plan", read 10 Nov 2026) says this section answers audience C's question "Does this work, and what has it achieved?", and that every project is structured data with a location, so the map, the directory and later ideas all read from one source.

## What this phase builds

1. A Sanity `project` document type, designed to hold funded projects now and surveyed initiatives later (decision 1).
2. An importer that reads OAD's 20 astrotourism-funded projects from the live OAD page, writes a file for review, and imports it into Sanity.
3. The build: projects fetched from Sanity and written into the directory page and one page per project.
4. The directory at `/projects/directory/`: search, filters, result count, cards.
5. One page per project at `/projects/directory/<slug>/`.
6. The phase-end checklist (as for News).

Not in this phase: the map, the Impact page, case studies, the Theory of Change page, the survey report, any survey data.

## What the data is (checked 10 Nov 2026)

- `Astrotourism Funded Projects.xlsx` (and the "(1)" copy) is NOT a usable source. Each row is one comma-separated text cell, long summaries split across rows, about 15 records of which 7 parse cleanly, some text damaged (for example `√Ç`), some links carry tracking junk (`?_ga=`). It is retired.
- The source is the public table at https://astro4dev.org/projects-search/ (the whole OAD portfolio, 308 table rows). 20 projects are tagged astrotourism. Columns: Project Title (linked to its own page on astro4dev.org), Summary (line breaks as `<br>`), Location, Year, Tags, SDG.
- The 20 projects: years 2016 to 2026 (2022: 4, 2023: 4, 2025: 4, 2026: 3, 2024: 2, 2016, 2018, 2020: 1 each); 21 countries once the South West Asia project is counted as its six (Armenia, Georgia, Iran, Israel, Turkey, United Arab Emirates); India and Tanzania have 3 projects each, Mongolia 2.
- Tags: all 20 have "astrotourism"; 10 have nothing else. Others: employment (6), community development, inclusion, visually impaired, curriculum development, education, outreach (one each).
- SDG: filled for 13 of 20, three values only (04 Quality Education, 08 Decent Work and Economic Growth, 10 Reduced Inequalities).
- Summaries are OAD's proposal text, 650 to 3,000 characters. Money is not in the table, and there are no coordinates.
- The survey sheet "Types of Astrotourism Initiatives" (Drive, shared drive) has about 83 initiatives (its own Calc_Data tab) but ALSO contact names, emails and phone numbers. Sanity's free datasets are public, so none of that is ever imported. Only rows with "Permission to List on Our Site" = Yes can appear. This is for the map phase.

## Decisions (L'chelle, 10 Nov 2026)

1. One document type for projects. It was first planned with a "kind" field for funded projects and surveyed initiatives; the field was removed on 10 Nov 2026 because every project is funded by OAD (L'chelle). The map phase adds one only if it needs it, and a project without it counts as funded.
2. Category: Claude's pick: the directory filters by country, year and SDG only for now. No categories are invented. Joy can define categories later, and the tags are kept in Sanity for that.
3. Project pages are our own pages (Claude's pick, because astro4dev.org is being rebuilt after this site, so its addresses may change). Each has a "Read the original on astro4dev.org" link that editors can change or clear.
4. Master copy is Sanity. One import, then Joy and Ram edit in the Studio. The WordPress list is not read again.
5. All 20 projects for now (Ram and Joy decide later which stay).
6. Claude's pick: a project has a LIST of countries, so a multi-country project appears under each country.
7. Claude's pick: project pages live under the directory (`/projects/directory/<slug>/`), so a project can never take the address of another page in the section (impact, map, case-studies, theory-of-change, survey-report).

## The `project` type (to agree before it is written)

| Field | Type | Required | Editor sees |
|---|---|---|---|
| title | string | yes | "Project title", OAD's wording |
| slug | web address | yes | Generated from the title, locked once generated (like news posts) |
| year | number | yes for funded | "Implementation year", 2000 to 2100 |
| countries | list of selections | yes, at least one | One drop-down per country, from one shared list of 250 (studio/schemaTypes/countries.mjs, ISO codes stored). Map positions are added in the map phase. |
| place | string | no | Detail inside the country, for example "Northern Cape and Karoo region". Not shown on the directory cards (country only); where it shows on the project page is still to decide. |
| summary | long text | yes | OAD's text, paragraphs separated by blank lines. Warning over 3,500 characters. |
| photo | image | no | Added 10 Nov 2026 after the mock-up. Hotspot, alt text required once there is a photo, optional credit. The card's background, with the dark fade on the left. |
| cardColour | list | yes unless there is a photo | Added 10 Nov 2026 (L'chelle's choice: the editor picks). Five brand colour circles: deep teal, terracotta, sand, sage, deep navy (yellow was taken out on 10 Nov 2026). Used only when there is no photo. |
| sdgs | list of numbers | no | The 17 SDGs as tick boxes (studio/schemaTypes/sdgs.mjs) |
| tags | tags | no | Free tags, kept for later (not shown or filtered yet) |
| originalUrl | https address | no | "Original page on astro4dev.org" |

Left out on purpose: map pin coordinates (map phase, the country centre is the fallback), contact details (privacy), money (not in the data; the Impact page has its own figures). Photos are now a field, but none are imported: a photo is only added once OAD has agreed it can be shown (consent rule).

The directory list in the Studio is sorted newest year first and shows title, year and countries.

## The look (mock-up, 10 Nov 2026)

L'chelle's mock-up is docs/project directory/F2a final. Photo or brand colour, desktop@1x.png. Page: the h1 "Project directory", an intro line, a search field ("Search by name, country or keyword"), then two columns. Left: "Filter" with "Clear all", and three groups of checkboxes with counts: Country (the biggest seven, then "Show all 20 countries"), Year (the five newest, then "Show all years"), Sustainable Development Goal (only goals that have a project, shown as "4. Quality Education"). Right: the result count ("18 projects" in the mock-up, a placeholder), a Sort drop-down ("Newest first"), then one wide card per project, then a "Show more projects" button. Card: a year, a pin icon with the country (small capitals, sand; the mock-up also shows the place, but L'chelle wants the country only, 10 Nov 2026; a project in several countries lists them all), then the title in white; the whole card is the link to the project page. A project with a photo shows the photo, a project without one a solid brand colour; a dark navy fade on the left stays in both cases, so the white title and sand text always sit on navy and contrast does not depend on the colour. In the mock-up the cards without photos cycle through the six colours; in the build the editor chooses (cardColour). Counts in the mock-up are placeholders: the real ones come from the data.

## Steps (stop after each one, tell me what to check, suggest a commit message)

a. This document, the decisions, and the schema above agreed.
b. The schema, a shared countries list (names from a public dataset whose licence is checked first, not typed by hand; country-centre positions wait for the map phase), and the Studio list. Validate. DONE 10 Nov 2026: studio/schemaTypes/project.js, countries.mjs (250 countries, i18n-iso-countries 7.14.0, MIT), sdgs.mjs, projectColours.mjs; Projects list in the Studio, newest year first.
c. The importer: reads the live page, cleans it (line breaks, damaged characters, tracking junk in links, country names, "GREECE" to "Greece", locations split into countries and place), writes `docs/projects/imported-projects.json` for you to review, then imports it with Sanity's own command-line import (your login, so no secret key in the public repo). DONE except the import itself (10 Nov 2026): build/import-projects.js reads the live page and writes the review file and .cache/imported-projects.ndjson; run `cd studio` then `npx sanity datasets import ../.cache/imported-projects.ndjson production --missing` (the flag skips projects that already exist, so Studio edits are never overwritten). Repairs made to OAD's text: damaged quote marks restored in 4 summaries; a place for Greece (Karpenisi, Evrytania, from the summary and the mock-up) and for South Africa (from the location cell); tracking in links none found.
d. build.js fetches the projects and writes the directory page and the project pages from templates (as the News pages). DONE 10 Nov 2026: build/projects.js (loads and checks every project, stops the build with a clear message on bad data; draws the directory list and one page per project), site/templates/project-directory.html and project.html. Plain markup with no styling yet. The 20 projects were imported into Sanity the same day (`--missing`). The project page shows the place in its facts (L'chelle, 10 Nov 2026). The breadcrumb's first level, "Projects and impact", is plain text because /projects/ has no page. Photos are not drawn yet (the build counts them); L'chelle had already added 3 in the Studio.
e. (first part DONE 10 Nov 2026: the page and the cards, CSS section 15; the photo of a project is downloaded at build time into dist/assets/images/projects/ by the same function as the news photos, at its own shape, 640 to 2000 wide, and the card cuts it to a strip with object-fit around the hotspot. Second part DONE 10 Nov 2026: search and the Country, Year and SDG filters with counts, Clear all, Show all countries and years, the live result count, the no-results message, CSS section 15b, main.js PROJECT DIRECTORY block, build/projects.js renderFilters. Third part DONE 10 Nov 2026: the Sort drop-down (Newest first, Oldest first, Title A to Z, a real select) and Show more projects (five at first and five more each press, one number in main.js), CSS section 15c. Still to do: the look of the phone filter panel, which has no mock-up.) The directory, as in the mock-up: search, filters (country, year, SDG) with counts, Clear all, Show all countries and years, sort, result count announced to screen readers, cards, "Show more projects". Without JavaScript it is a plain list of all 20.
f. The project pages. DONE 10 Nov 2026: CSS section 16, the photo band (only when the project has a photo; a project without one has no band at all, L'chelle's choice over a colour band or a slimmer band), the header marking "Projects and impact" (and, on the directory page, "Project directory") as current, share-image tags for projects with a photo. Tested: 20 project pages at 8 widths (no sideways scroll, errors, failed requests or broken images), Tab order, focus rings.
g. DONE 11 Nov 2026, results in CLAUDE.md (Phase 8 checklist). Phase-end checklist: every width, keyboard only, screen reader order, 200% zoom, reduced motion, JavaScript off, contrast, a build with no projects, a filter with no results.

## Page content, added 11 Nov 2026 (L'chelle)

A project has a "Page content" field with the same editor as a news article, so a project page can show OAD's full page (text, photos, buttons such as the project report, videos) instead of only the plain summary. The Summary stays for the search and is shown only when there is no page content. OAD's contact person is deliberately not copied. The scraping prompt is docs/projects/scrape-prompt.md. Build and styling: see CLAUDE.md (Project page content) and CSS section 19.

Contact (11 Nov 2026): Ram and Joy agreed that the contact person on OAD's own page can be shown. A project has an optional `contact` {name, email}; the page shows it as "Project contact" in the facts, the name linking to an email. Second scraping pass: docs/projects/scrape-contacts-prompt.md.

## News linked to projects (added 10 Nov 2026, L'chelle)

An OAD projects news post can name the projects in the directory it is about. Decided: a post can name one or more projects (a list, not a single choice), and the article links back to the project.
- Studio: a "Projects this post is about" field on the news post (studio/schemaTypes/post.js), shown only when the category is OAD projects, a list of weak references to project documents (a project can still be deleted; the build ignores a link to a project that is gone or not published). A post whose category is changed away from OAD projects keeps the choice in the Studio but the site ignores it.
- Project page: "News and updates" in the sidebar, between the original-page link and "More projects in...", every linked post newest first as plain rows (date above the title, linking to the article). Left out when there are none.
- Article page: "About the project: <title>" (or "About the projects: ..." for several) under the date row on the dark band, each a link to the project page.
- Seen in the data (10 Nov 2026, corrected the same day after reading every post): 27 posts are in OAD projects. 22 have a suggested project (10 certain, 6 high, 6 medium), 1 matches none (the Nigerian radio telescope) and 4 are unsure (the Astrostays posts, which no project summary mentions). AstroTribe is not a separate project: it is the same programme as the two tribal students projects. The full list, with the reason for each match, is docs/projects/news-project-matches.md. Tagging is done by hand in the Studio.
- Tested with made-up data in dist/ (the page layout, wrapping of long titles, one and two projects, phone width). NOT tested end to end against Sanity: no post is tagged yet, and Claude was not allowed to write test tags into the live content, so the first real tag is the real test.

## Needs from Ram and Joy (does not block starting)

- Which of the 20 projects stay ("the site holds only relevant, current content").
- How "countries" is counted. The Proof section says 17 countries (Joy's June 2026 paper), the Impact page copy says 14, and the data gives 21 places (the South West Asia project counted as six).
- Whether they want categories for the directory, and what they are.
- The link to the existing "Astrotourism Around the World" Google My Map (it may already hold coordinates), for the map phase.
- Permission and approach for the survey data (contact details never go in; only "Permission to List" = Yes).
