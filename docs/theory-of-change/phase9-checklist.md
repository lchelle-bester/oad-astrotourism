# Phase 9 checklist: the Theory of Change page

Page: `/projects/theory-of-change/`. Run on 20 Nov 2026. Part A is what Claude ran in headless Chrome (the tests are in the session's scratchpad, not in the repo). Part B is what only you can check. Part C is for Ram and Joy.

## A. Done by Claude (all passed unless it says otherwise)

**Layout and zoom**
- No sideways scroll at 320, 360, 390, 600, 768, 920, 921, 1023, 1024, 1100, 1280, 1440 and 1920 px wide.
- 200%, 250% and 400% zoom (the same as 720, 576 and 360 px wide): no sideways scroll, nothing cut off.
- Compared with your two mock-ups at 1440 and 390, open and closed. The layouts switch at 920 px (sections side by side) and 1024 px (coloured rows).

**Fold-open parts**
- Desktop: the three row buttons and the assumptions button show; the two lists are open with no button.
- Each row opens on its own, shows "Show less" and its three full wordings, and closes again.
- Phone: the two lists start closed; the whole row title is the button; resizing across 920 px opens and closes them correctly.
- With JavaScript off (390 and 1440): every full wording, list and the assumptions are shown, and there are no buttons that do nothing.

**Keyboard**
- Tab goes link, three row buttons, assumptions button, Impact button, in that order, each with a visible focus ring. Enter opens and Space closes a row.

**Screen reader order (read from the page, not a real screen reader)**
- Title, intro, download, problem, who, pathways, goals, impact. The big figure is read with its sentence. The little people picture is skipped; the sentence under it is read. Each pathway reads Activity, Output, Outcome in turn. Every button's name includes its visible words, then a comma and what it opens (for example "Read in full, Train the trainers").
- One h1, no skipped heading levels, no duplicate ids, every `aria-controls` points at something real.

**Contrast**
- 61 visible text styles at 1440 and 44 at 390, measured from the real colours including the tinted rows: all at least 4.5:1 (lowest 4.6:1, sand on teal). The one reading below 4.5 is a hidden label nobody sees.

**Touch targets**
- Every button and standalone link is at least 24 by 24 px (WCAG 2.2) at 1440 and 390.

**Reduced motion**
- The arrow of each button and the Impact button do not animate.

**Download**
- The button appears when a file is uploaded, links to the file on this site, the file is served as an image (263 KB JPG), and its accessible name says "(JPG, 263 KB)". A PDF reads "(PDF, 3.0 MB)".

**Page head**
- Title "Theory of Change | Astrotourism", description (124 characters), canonical, og tags, language, favicon, not hidden from search.

**Links**
- 24 links checked. The only ones that do not work are the pages not built yet (Resources, Impact, Map, Case studies, Survey report, Funding and the two overview addresses). The ILO source link and the Download link work.

**Bad and odd content (made-up entries)**
- 13 bad entries are refused with a message that says what to fix: two pathways, an empty intro, a bad source link, more highlighted people than people, a people total out of range, no goals, four goals, an unknown goal, two main goals, half an indicator, an Impact button with no address (or a `javascript:` one), an empty list.
- A page that is not published is left out and the build says so.
- Hostile text (a script tag, an image with `onerror`, quotes, ampersands, a `{{placeholder}}`) is shown as text and never runs.
- One goal, no assumptions, a pathway with nothing to open, 40 people with 10 highlighted, and a very long word: all draw correctly.
- **Found and fixed:** a long unbroken word or web address in any text field pushed the page up to 1629 px wide. Long words now wrap.

**Network**
- No request goes to any other site while the page loads (the UN and ILO are only linked, not loaded). No console errors or failed requests.

**Weight on Slow 4G at 390 px (see the note)**
- 332 KB over the wire, 7 requests, first paint 2.6 s on a quieter run and 3.1 to 3.7 s on three runs today. The directory page measured 1.7 to 1.9 s on 11 Nov and 2.5 to 2.8 s today, so this machine is slower now. These sizes are measured on the local server without compression: Netlify compresses text files. No page-weight budget is set yet. **Judge this on Netlify after the next push.**

## B. For you to check

Set aside 15 minutes. Run `node build/build.js`, start Live Server and open the page.

1. **Desktop (1440 or your full screen).** Compare with the mock-up. Open each pathway row, the assumptions panel, and press the download button (it should save `astrotourism-theory-of-change.jpg`).
2. **Phone width.** In Chrome DevTools (F12, then the phone icon) choose 390. Open "The people it is for", a pathway's "Read in full" and the assumptions. Check nothing is cut off on the right.
3. **Keyboard only.** Press Tab through the page. Can you always see where you are? Does Enter open a row?
4. **A real phone** if you can: open it over mobile data. Is the first screen quick, and are the buttons easy to press?
5. **Another browser.** Open it once in Firefox and, if you have one, Safari or an iPhone. Look for anything that sits wrong.
6. **Screen reader (best if you can).** With Windows Narrator (Windows key + Ctrl + Enter) go through the page: do the headings, the figure and its sentence, and the open and close buttons make sense? I could not test a real screen reader.
7. **Zoom.** Press Ctrl and + until the browser says 200%, then 400%. Nothing should need sideways scrolling.
8. **Edit in the Studio.** Change the people numbers, a goal and the Main goal tick, publish, rebuild, and check the page follows.

## C. Before launch (for Ram and Joy, and for you)

- Joy to confirm the transcription and the reworded text: the short and full wordings and the assumptions are lightly reworded from OAD's diagram.
- Reports, Research and the World Tourism Organization definition are gone, and the statistic is now 4.9% for 2026 (ILO), not 5.1% for 2023.
- The UN's icon guidelines say they must be on the same page as the icons. The note and link were removed on request, so that rule is not met. Ram and Joy to decide whether it matters.
- A better diagram file than the current small JPG, if one exists.
- The Impact button goes to `/projects/impact/`, which does not exist yet. Do not push before that page exists, or accept the 404.
- Each Sanity publish costs a Netlify deploy (see open decision 6).
