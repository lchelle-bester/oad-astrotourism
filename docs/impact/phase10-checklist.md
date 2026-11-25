# Phase 10 checklist: the Impact page

Page: `/projects/impact/`. Rewritten on 25 Nov 2026 for the page as it is now (the first version, from 21 Nov, described a page that has since changed: new banner, no eyebrows, no place lines or project links on the figures, no note under the last section, a lower fade on the Places photo, and the Work photo below its text on phones). Claude ran the checks in headless Chrome, including real Tab presses and real-time measurements through Chrome's debugging connection; the test scripts are in the session's scratchpad, not in the repo. Part A is what Claude ran on 25 Nov. Part B is what Claude could not run. Part C is what only you can check. Part D is for Ram and Joy before launch.

## A. Run by Claude on 25 Nov 2026 against the current build and the current Sanity content (all passed unless it says otherwise)

Published at the time: banner photo is the La Palma telescopes with the new alt text ("The Milky Way arching over a row of large telescope dishes on a hillside on La Palma, with an orange glow on the horizon.") and the credit "Evgeni Tcherkasski on Unsplash"; the headline still says "€111 000 invested in OAD astrotourism projects across 17 countries".

**Structure** (11 widths from 1920 to 320, lazy photos forced to load)
- One h1 ("Impact"), 11 h2s (four sections, the map heading and six country headings), none skipped. Header, main and footer once each, skip link, no duplicate ids. Every image has alt text and loads; every link and button has a name.
- 14 figures and 15 map dots. No eyebrow, place line, "chapter" or note left on the page. Title, `en`, canonical and description are set; Impact is the current page and Projects and impact the current section.
- No request goes to another site and there are no console errors at any width.

**Contrast of every text line on the whole page** (68 to 117 lines per width, each measured against the real pixels behind it with the photos loaded, the lightest 1% of pixels ignored because stars are specks): all pass at 1920, 1440, 1280, 1100, 920, 768, 600, 390, 360 and 320. Lowest readings: the banner headline over the photo at 920px (4.2:1, large text needs 3:1), the yellow "€111 000" on a 320px phone (5.1:1, needs 4.5), and the Places caption (6.2:1 and up). The banner and the Places caption were also measured separately, at 13 and 8 sizes.

**Map** (23 checks at 1440 with reduced motion, 23 at 390, 22 at 1440 with motion on, plus the roll test below): 15 dots and 15 panels, opens on India, click selects, the status line announces the country, ArrowRight and ArrowLeft move and focus, Home and End, wrapping both ways, only the chosen dot is a Tab stop, the Next and Previous arrows keep focus on the pressed arrow and wrap, 20 project links with real addresses, no dot outside the map, every dot press area is at least 24px on desktop (on a phone 13 dots are 19 to 22px, covered by the arrow buttons, WCAG 2.5.8).

**Motion, measured in real time**
- The two big figures (680 and ₹30,000): prepared as zeros while off screen, roll once when 60% visible (1.9 s and 2.2 s), a hidden spoken copy carries the real number while rolling, and they end on the plain correct number with nothing left behind (no strips, no hidden copy, no filters).
- The banner photo drift runs with motion allowed; the title and headline never animate.
- Reduced motion (emulated before load): the numbers are plain at once, no drift, no smooth scrolling, the map's transitions are off.

**Keyboard, with real Tab key presses** at 1440 and 390: every stop on the page has a visible focus ring (none without one). The page itself has 6 stops (the map dots as one stop, the 2 arrows, the 3 project links).

**Zoom and widths**: the 200%, 250% and 400% equivalents (720, 576 and 360px wide), and 640 and 512, show no sideways scroll in the main content.

**JavaScript off**: the map and arrows stay hidden, all 15 countries and 20 project links are listed, every figure shows its real number, 12 headings.

**Bad and odd content** (26 checks against the real loader and renderer): 15 bad entries are refused with a message that names what to fix (three or five sections, an empty heading or sentence, a decimal, negative or text number, no figures or six, a photo or the banner with no alt text, an empty or missing headline, an empty map heading); an unpublished page is left out; the odd ones draw correctly (no photos, prefix and suffix, zero, hostile text escaped, a `{{placeholder}}` typed into the content shown as text, a 300-letter word, five figures, the highlight marks kept, no leftovers, no projects leaves the map out).

**Whole site**: 105 built pages and 8586 links and files checked. The only addresses that do not exist are the nine pages not built yet (`/resources/`, `/resources/guidelines/`, `/resources/online-course/`, `/resources/community/`, `/resources/the-three-resources/`, `/resources/which-resource/`, `/projects/survey-report/`, `/funding/` and `/projects/`). Nothing new is broken. Secrets scan of tracked files: no tokens, keys or passwords (the only matches were file hashes in the lock file); `.env`, `originals/`, `.cache/` and `dist/` are git-ignored. The Studio schema validates with no warnings.

**Load on Slow 4G** (150 ms delay, 1.6 Mbit/s, cache off; the local test server does not compress and Netlify does, so real sizes are smaller): phone 390 with the CPU 4 times slower: first paint 2.7 s, load event 3.8 s, 605 KB (images 237 KB, stylesheet 194 KB, fonts 84 KB, script 50 KB). Desktop 1440: first paint 2.9 s, load event 4.5 s, 842 KB (images 473 KB, mostly the banner). An article page is about 300 to 340 KB, so this is the heaviest page measured. No page-weight budget is set.

**Places section on desktop, changed 25 Nov 2026** (L'chelle: more of the photo, tighter text, the fade further down): the photo band is 30vw tall (432px at 1440, was 317), clear until 58% of its height (was 46%), the heading starts inside the band's faded lower part, the caption sits top right of the photo on a soft dark backing, and the text is tighter (section 649px tall at 1440, was 636). The caption first sat bottom right and met the heading at about 1032px wide (found by L'chelle); it is now at the top, checked at 1920, 1440, 1280, 1100, 1032, 1000, 960 and 920 with no overlap. Re-measured on the real photo: the caption is 6.8:1 to 10.3:1 at 920 to 1920, and every text line on the whole page still passes at 1920, 1440, 1280, 1100, 920, 768, 390 and 320.

### Problems found (not fixed yet, your decision)

1. **FIXED (25 Nov 2026): a few pixels of sideways scroll at 320px wide when a scrollbar takes space** (a desktop window at 400% zoom leaves 305px). The phone header strip ("Part of the IAU Office of Astronomy for Development") was 309px wide on every page and failed WCAG 1.4.10 by 4px. It may now wrap on a very narrow screen, and the arrow is tied to the last word with a no-break space so it never stands alone. Re-checked with a scrollbar at 320: no sideways scroll on Impact, News, Theory of Change and the project directory (the home page has only a clipped video element, no scroll). Wrapping only happens when the line does not fit; at 320 without a scrollbar it is still one line.
2. **FIXED (25 Nov 2026): Windows high-contrast (forced colours) map dots.** They were black on a black sea, so the dots over water vanished and the chosen dot differed only in size. In forced-colours mode the dots now use the system colours (a Highlight fill with a ring in the text colour, the chosen dot inverted with a Highlight ring), checked in emulated forced colours: every dot shows over land and sea and the chosen dot is distinct.
3. **Minor:** the fixed back-to-top arrow (bottom right on desktop) can cover the project year in the map panel at some scroll positions.
4. **Content still to fix in Sanity:** the headline's "€111 000" (a space, where the site uses a comma, and a space can split across lines) and "17" against your mock-up's 14.

## B. Not run, so not counted

- A clean copy built the way Netlify builds it (this working tree has uncommitted changes, and a cold build downloads every photo again and takes several minutes). Run it right before the push.
- A real screen reader (Narrator or NVDA), Firefox, Safari, a real phone and a real tablet: headless Chrome only.
- Judging the look by eye, including the tablet widths between 920 and 1100px.
- Hover states, and the colour of the focus ring against the photos (only that a visible ring exists).

## C. For you to check

Set aside 15 minutes. Run `node build/build.js`, start Live Server and open the page.

1. **Fix the banner headline in the Studio** (Pages, Impact page, Top of the page). The alt text and the credit are now right. Two things are still open in the headline: "€111 000" has a space (the site uses a comma, "€111,000", and a space can split across lines) and it says **17** countries (your mock-up says 14, which is Joy's question, see D).
2. **Desktop (1440).** Compare with your mock-up: the very large title, the headline break after "projects", the photo below. Watch the first 9 seconds: the photo should slowly pull back while the text stays still. Scroll through all four sections and the map.
3. **A shorter desktop window** (about 1366 x 650): the text should be smaller and the banner not crammed.
4. **Phone width.** DevTools (F12, phone icon) at 390. Nothing cut off on the right. Work: the photo is below the text. Places: the photo is across the top. Then a real phone, over mobile data if you can.
5. **Map.** Click several dots, use the arrow buttons, and press Tab to the map and use the arrow keys. Try the dots next to each other on a phone (Saint Lucia and the Virgin Islands, Kenya and Tanzania).
6. **Keyboard only.** Tab through the page: can you always see where you are?
7. **Reduced motion.** Turn on "Reduce motion" in Windows and reload: the banner photo should not drift and the big numbers should not roll.
8. **Another browser.** Firefox, and Safari or an iPhone if you have one.
9. **Screen reader (best if you can).** With Windows Narrator (Windows key + Ctrl + Enter): do the headings, the figures (each reads as number then sentence), the map dots and the arrows make sense?
10. **Zoom.** Ctrl and + to 200% then 400%: nothing needs sideways scrolling.
11. **Edit in the Studio.** Change a figure, add a project with a new country, publish, rebuild: the page and the map follow. Check the Studio shows no "unknown field" warnings (see D, the clean-up).

## D. Before launch (for Ram and Joy, and for you)

- **Joy to confirm the numbers** (sources in the Studio, never shown on the page): the banner says €111,000 across **17** countries in Sanity but your mock-up says **14** (OAD's own Impact page says 14, the homepage says 17); the 2022 workshop's own report says **16** astroguides trained, OAD's page says **17**; OAD's page says **72** mentors from 14 countries, the 2022 workshop text says **28**; the third city council was "in progress" in the project text; 680, 5 resorts, $5,200 and 37 are not in any project text; the farmers' market is only on OAD's Impact page.
- **Photographers' credits and licences.** The four section photos have no credit (the field is optional and empty). The banner photo is by Evgeni Tcherkasski from Unsplash: Claude has not re-read the Unsplash licence for that photo, so check its page. Consent and confirmation from OAD for the photos, as for the other photos. A sharper original of the section photos if one exists.
- **Tell Ram and Joy what changed from the signed-off plan:** no separate Interactive map page (the map is part of Impact), no Case studies page (the Impact page takes over that job), the figures show only a number and a sentence (no country line and no link to a project page), no eyebrows and no note under the last section, as well as the earlier ones (three paths, About, four pillars, the dropped Theory of Change items).
- **The map covers the first country of each project.** A project in several countries has one dot at the first country listed.
- **Studio clean-up.** Old values are still stored in Sanity and show as unknown fields: the figures' place and project, the banner caption, the note under the last section, the section eyebrows and the map eyebrow. A one-off script can remove them (dry run first, your own login). Not written yet for all of them; `studio/scripts/remove-impact-figure-places.js` covers only the figures.
- **`studio/scripts/fill-impact-page.js` is out of date** (it still writes fields that no longer exist) and must not be run again.
- **Each Sanity publish costs a Netlify deploy** (see open decision 6), and there is no webhook yet, so a published change shows on the live site only after a push or a manual deploy.
