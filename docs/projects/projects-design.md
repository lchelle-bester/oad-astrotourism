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

1. One document type for funded projects and surveyed initiatives, with a "kind" field.
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
| kind | list | yes | "Funded by OAD". Only this value until the map phase adds surveyed initiatives. Read-only. |
| year | number | yes for funded | "Implementation year", 2000 to 2100 |
| countries | list of selections | yes, at least one | One drop-down per country, from one shared list of countries (also used by the map later) |
| place | string | no | Detail inside the country, for example "Northern Cape and Karoo region" |
| summary | long text | yes | OAD's text, paragraphs separated by blank lines. Warning over 3,500 characters. |
| sdgs | list of choices | no | The 17 SDGs as tick boxes |
| tags | tags | no | Free tags, kept for later (not shown or filtered yet) |
| originalUrl | https address | no | "Original page on astro4dev.org" |

Left out on purpose: photos (consent and effort, ask Ram and Joy first), map pin coordinates (map phase, the country centre is the fallback), contact details (privacy), money (not in the data; the Impact page has its own figures).

The directory list in the Studio is sorted newest year first and shows title, year and countries.

## Steps (stop after each one, tell me what to check, suggest a commit message)

a. This document, the decisions, and the schema above agreed.
b. The schema, a shared countries list (names and country-centre positions, from a public dataset whose licence is checked first, not typed by hand), and the Studio list. Validate.
c. The importer: reads the live page, cleans it (line breaks, damaged characters, tracking junk in links, country names, "GREECE" to "Greece", locations split into countries and place), writes `docs/projects/imported-projects.json` for you to review, then imports it with Sanity's own command-line import (your login, so no secret key in the public repo; to be confirmed in this step).
d. build.js fetches the projects and writes the directory page and the project pages from templates (as the News pages).
e. The directory: search, filters (country, year, SDG), result count announced to screen readers, cards with a short excerpt. Without JavaScript it is a plain list of all 20.
f. The project pages.
g. Phase-end checklist: every width, keyboard only, screen reader order, 200% zoom, reduced motion, JavaScript off, contrast, a build with no projects, a filter with no results.

## Needs from Ram and Joy (does not block starting)

- Which of the 20 projects stay ("the site holds only relevant, current content").
- How "countries" is counted. The Proof section says 17 countries (Joy's June 2026 paper), the Impact page copy says 14, and the data gives 21 places (the South West Asia project counted as six).
- Whether they want categories for the directory, and what they are.
- The link to the existing "Astrotourism Around the World" Google My Map (it may already hold coordinates), for the map phase.
- Permission and approach for the survey data (contact details never go in; only "Permission to List" = Yes).
