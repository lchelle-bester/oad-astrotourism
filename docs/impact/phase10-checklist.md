# Phase 10 checklist: the Impact page

Page: `/projects/impact/`. Rewritten on 25 Nov 2026 for the page as it is now (the first version, from 21 Nov, described a page that has since changed: new banner, no eyebrows, no place lines or project links on the figures, no note under the last section, a lower fade on the Places photo, and the Work photo below its text on phones). Claude ran the checks in headless Chrome; the test scripts are in the session's scratchpad, not in the repo. Part A is what Claude ran on 25 Nov. Part B is what Claude did not re-run since the changes, so it is out of date until someone runs it again. Part C is what only you can check. Part D is for Ram and Joy before launch.

## A. Run by Claude on 25 Nov 2026 (all passed unless it says otherwise)

**The current page, structure** (11 widths from 1920 to 320, with the lazy photos forced to load)
- One h1 ("Impact"), 11 h2s (four sections, the map heading and six country headings), none skipped. Header, main and footer once each, skip link present, no duplicate ids.
- Every image has an alt attribute and every shown image loads. Every link and button has a name.
- 14 figures, 15 map dots. No eyebrow, no place line, no "chapter" and no "All figures as reported by the funded projects to OAD." anywhere on the page.
- Title "Impact | Astrotourism", language `en`, canonical `https://astrotourism.netlify.app/projects/impact/`. Impact is marked as the current page and Projects and impact as the current section.
- No request goes to any other site and there are no console errors, at every width.
- No sideways scroll at 1920, 1440, 1280, 1100, 920, 919, 768, 600, 390 and 360. At 320 the test frame reported 4px too wide: it is the phone header strip ("Part of the IAU Office of Astronomy for Development") and it is the same on the News and Theory of Change pages. It is a side effect of the test frame's scrollbar and was not caused by this page.

**Banner contrast** (every text line and header link, measured against the real pixels behind it with the real published photo, ignoring the lightest 1% of pixels because stars are specks)
- At least 4.5:1 for small text and 3:1 for large at 1920 x 1000, 1536 x 730, 1440 x 760, 1366 x 650, 1280 x 720, 1280 x 600, 1100 x 700, 1024 x 600, 920 x 640, 768 x 1024, 390 x 720, 360 x 640 and 320 x 568. Lowest: the "Resources" link at 5.1:1 and the yellow "17 countries" on a 320px phone at 5.4:1. The first try failed at two places and was fixed with darker fades.

**Places photo caption contrast** over the real photo at 1920, 1600, 1440, 1366, 1280, 1100, 1024 and 920: 8.1:1 to 11.3:1.

**Layout, checked against the screenshots and measurements**
- Banner: one screen tall, the title and headline match the 1440 x 760 mock-up (the title box to the pixel) and shrink on shorter windows (the words take 51 to 60% of the banner height with the mock-up's wording; 67% with the longer published wording).
- Work photo: below the text on phones and tablets up to 919px (inset, 4 to 3, rounded, caption under it), the section's background from 920px. Places photo across the top, its fade starting lower. The 680 is deep teal, the Places numbers are solid sand.
- Phone: section 1 photo after the figures, section 3 has no photo (and it is not downloaded).

**Keyboard**
- Tab stops inside the page: 6 (the map dots as one stop, the 2 arrow buttons, the 3 project links in the panel). The seven place links of the first version are gone. Header and footer stops come before and after.

**Studio**
- The schema validates with no errors or warnings after each change today. The Headline sentence shows highlighted words with a yellow strip in the editor (checked that it compiles; not seen in the running Studio by Claude).

## B. Not re-run since the changes (out of date: run them again before launch)

These were run on 21 Nov and the page has changed since, so a pass then does not count now:
- **Every text line on the whole page against the real pixels** (only the banner and the Places caption were re-measured). The sections most affected: Work (the text moved up with the eyebrow gone), Places (heading now close to the photo's fade) and section 1 (the 680 changed colour; it is about 7.8:1 on the paper by calculation, not measured on the page).
- **The map**: 31 browser checks, 12 data checks and the reduced-motion check. The map code did not change except that its eyebrow is gone.
- **Bad and odd content** (21 checks): the checks that refuse a bad entry. The rules for the place and the eyebrow no longer exist, so some checks are obsolete and the rest should be repeated.
- **The big figures rolling once** (the 680 and the ₹30,000), reduced motion and JavaScript off.
- **Zoom at 200%, 250% and 400%**, forced colours, a build with no photo, and Slow 4G timing (the banner file is now 2400px wide).
- **The whole-site checks**: a clean copy built the way Netlify builds it, the secrets scan, and a link crawl of every page (the nine pages that are not built yet are expected to fail).

## C. For you to check

Set aside 15 minutes. Run `node build/build.js`, start Live Server and open the page.

1. **Fix the banner content in the Studio** (Pages, Impact page, Top of the page). Three things are still wrong in what is published:
   - the **alt text** of the banner photo still describes the old Langkawi photo (suggestion: "The Milky Way arching over a row of large telescope dishes on a hillside on La Palma");
   - the **headline** says "€111 000" with a space (the site uses "€111,000") and **17** countries (your mock-up says 14, which is Joy's question, see D);
   - the **credit** is empty. Enter "Evgeni Tcherkasski on Unsplash" and the page will show "Photo: Evgeni Tcherkasski on Unsplash" in the corner.
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
