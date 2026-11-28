# Global Survey Report page: design record (Phase 12, 28 Nov 2026)

Address: `/projects/survey-report/` (already in the nav and the footer). Mock-ups by L'chelle: `survey-report-desktop-1440.png` and `survey-report-phone-390.png` in this folder.

## What the page is

A night-coloured page that reports what astrotourism initiatives answered in OAD's survey: a title, three numbers, a world map with a dot for each country that answered, then four short sections (where the answers come from, who runs them, what they offer, can they pay their own way), a "who they work with" paragraph and a teal band that sends people to the survey.

## Where the numbers come from

Nowhere typed. Each survey response is one anonymous Sanity document (`surveyResponse`: country, one type of initiative, what it offers, can it pay its own way). `build/survey.js` counts them at build time and draws the totals, the percentages, the three donuts, the bars, the country list and the map dots. A new response is a new document; the next build has new numbers. Sanity's dataset is public, so a response never holds a name, email, phone number or the initiative's name.

The sentences that name the biggest groups ("Most answers so far come from ...", "The biggest group is ...") are written by the build from the counts, so they cannot claim something the numbers do not. "Most" is only written when the group is more than half. Ties are never cut in half: with four continents level the page says the answers are spread evenly.

The editors' own wording (introduction, notes, button words, survey address, the last band) is in the Sanity document "Global Survey Report page" (Pages folder).

## The real survey sheet (what I learned from it, no personal data kept)

- The category question ("What category does your project best fit into?") is single choice, so each initiative has ONE type. The mock-up's type chart adds up to 93 against 83 answers; with one choice each it cannot, so the 93 is probably duplicate rows in the raw sheet (the same initiative sent twice by the same contact). The importer reports candidate duplicates by row number, country, type and date, and you decide with `SKIP_ROWS`.
- "Location" is free text, not a country: the importer reads the country from the end of the text and falls back to a list of place names (Indian states, South African provinces, and so on). Rows it cannot place are listed by row number, never guessed.
- The "Key features" options are matched on the form's own wording ("Observatory Facitilites" is spelt wrong in the form).
- One respondent answered "No" to permission to be listed on the site. This page only counts answers (nothing identifies a respondent), but ask Joy whether that matters.

## Decisions (L'chelle, 27 Nov 2026) and Claude's choices

- Editors type in each validated response, and a script imports the data that exists (L'chelle).
- The "Who runs them" chart is built as drawn and flagged for Joy (L'chelle). It is now shares of the 83, one choice each.
- "interactive map" is removed from the last band (L'chelle): that page is not in the sitemap. The sentence is an editable field.
- Claude's choices, for L'chelle to change: the map is the Impact page's world drawing (no library), cut a little at the top (72 degrees north), dot area grows with the count (14px for one answer, 62px for the most, at full desktop size, shrinking on narrower maps); the button is as wide as its words on phones (the mock-up has it full width; the Online course page did the same change at L'chelle's request); the fold-open parts are closed by default at every width (L'chelle, 28 Nov 2026; the desktop mock-up showed them open); the map is at most 928px wide on desktop, centred (L'chelle, 28 Nov 2026), about the mock-up's size; "See answers from all 37 countries and 1 region" (the mock-up said "all 38 countries", but one of the 38 rows is the region Latin America, which has no dot on the map).
- The chart colours: yellow Asia, terracotta South America, grey-green Africa (#8fa8a0), slate North America (#566a8c), sand Europe, sage Oceania. The same six in the same order colour the type chart; the sustainability chart uses the first four. Each is at least 3:1 against night. Dots in terracotta and slate are under 3:1 against the navy land, so every dot has a night ring.

## Flags for Ram and Joy

- Types 93 against 83 (above).
- "37 countries" counts real countries; "Latin America" (one answer) is a region and is counted in South America but not drawn.
- The "who they work with" paragraph is not counted from the responses (no partner column in the import); it is the mock-up's wording.
- The survey form address is not on any OAD page I found; L'chelle supplies it.
- The mock-up's numbers may be from before the latest rows; the page now shows whatever is in Sanity.
