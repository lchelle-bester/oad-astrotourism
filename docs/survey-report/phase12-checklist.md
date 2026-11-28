# Phase 12 checklist: Global Survey Report page (28 Nov 2026)

## A. What Claude ran (headless Chrome and Node, all passing)

Run with a stand-in Sanity (nothing written to Sanity), using the mock-up's numbers.

- Import script: 23 tests on a made-up CSV shaped like the real sheet (single-choice type, free-text Location with states and towns, the "Facitilites" spelling, an offer with a comma inside it, free text that must not count as an offer, two duplicates reported by row number, `SKIP_ROWS`, stable keys, personal columns never kept, missing columns stop the script).
- Page content: 41 tests on the loader and renderer (counts match the mock-up: 33, 20, 12, 10, 7, 1 continents; offer shares; 36, 25, 10, 12 and 73% on the way; sentences are true to the counts; ties are never cut; a page with no document or no responses is left out; a bad country, type or offer stops the build with a clear message; Antarctica is warned about and not counted; hostile markup and a typed `{{placeholder}}` stay as text).
- Browser: one h1 and six h2 with no skipped levels, every section labelled, no duplicate ids, the header marks Projects and impact and Global Survey Report as current, the map has a text alternative and the rings are hidden from screen readers; no sideways scroll and every text line passes contrast (191 lines at 920px and up, 117 below, lowest 6.83:1) at 14 widths from 1920 to 320; every chart colour is at least 3:1 against night; folds open on desktop and closed on a phone, Enter opens one; tap targets at least 44px; real Tab presses reach the button, both folds and the last button with a visible ring; JavaScript off keeps everything open and readable; reduced motion switches off the transitions; forced colours draws the dots and land in system colours; no console errors.
- The site builds without the page published (it says so and leaves the page out).

## B. What only you can do

1. Export the survey sheet as CSV (Google Sheets: File, Download, Comma-separated values). The importer cannot read a PDF.
2. From the `studio` folder in PowerShell:
   - `$env:SURVEY_CSV="C:\path\to\responses.csv"; $env:HEADERS=1; npx sanity exec scripts/import-survey-responses.js --with-user-token` (prints column titles only; check it found the right columns)
   - `Remove-Item Env:HEADERS; npx sanity exec scripts/import-survey-responses.js --with-user-token` (dry run: prints the counts, the rows it could not place, and possible duplicates by row number)
   - Look at the duplicate groups in the sheet. For each copy to drop: `$env:SKIP_ROWS="12,40"`. Run the dry run again until the numbers look right.
   - `$env:WRITE=1; npx sanity exec scripts/import-survey-responses.js --with-user-token`
3. Give me the survey form address, then: `$env:SURVEY_URL="https://..."; $env:WRITE=1; npx sanity exec scripts/fill-survey-report-page.js --with-user-token`. (Or add the page in the Studio by hand.)
4. `node build/build.js`, then Live Server: look at the page at desktop width and at 390px.
5. Check in the Studio: Pages, Global Survey Report page; Survey responses (one list, A to Z by country).
6. A real screen reader (Narrator or NVDA): the list under each ring is the data, the ring and the map are decoration plus a short description. Firefox and Safari. A real phone.
7. Judge the look: the map is taller than in the mock-up (see the design record).

## C. For Ram and Joy

- Types 93 against 83: probably duplicate rows. Please validate.
- "All 38 countries" in the mock-up is 37 countries and one region.
- The "Who they work with" paragraph is not counted from the survey.
- One respondent did not give permission to be listed on the site. The page only counts answers and names nobody.
- The survey form address and whether the button should open in the same tab.
- Whether to keep the hand-written sustainability note ("That fits a group made up largely of tourism businesses, observatories and planetariums."); it is not checked against the real counts.
- The signed-off sitemap had an Interactive map page: it is gone (decided 20 Nov), so the last band no longer mentions it.

## Not run

A real browser on a real device, a real screen reader, Firefox, Safari, Slow 4G timing, a clean-copy Netlify build, the importer against the real sheet (it has never seen the real rows: the first dry run on the real CSV may list places it does not know, which is what the dry run is for).
