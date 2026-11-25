# Phase 10 checklist: the Impact page

Page: `/projects/impact/`. Run on 21 Nov 2026 by Claude in headless Chrome (the test scripts are in the session's scratchpad, not in the repo). Part A is what Claude ran. Part B is what only you can check. Part C is for Ram and Joy before launch.

## A. Done by Claude (all passed unless it says otherwise)

**Before the push**
- A clean copy of the repo (cloned from the commits, no cache) was built the way Netlify builds it, and compared with the working build.
- Secrets scan of everything going public: no tokens, keys, passwords or email addresses (the only match was `process.env.WRITE`, which is harmless).
- The Studio schema validates with no errors and no warnings.

**Whole site, because the header changed on every page**
- 105 built pages, 5179 links and files checked: the only addresses that do not exist are the nine pages that are not built yet (`/resources/`, its five pages, `/projects/survey-report/`, `/funding/` and `/projects/`). Nothing new is broken.
- One page of every kind (home, News list, a second News page, an article, the project directory, a project, Theory of Change, Impact, the 404 page) at 1440 and 390: loads, one h1, header and footer once, no sideways scroll, no errors. The nav has Impact and no longer has Interactive map or Case studies.

**The Impact page, structure and content**
- One h1, four section headings, then the map heading and the country headings, none skipped. Header, main and footer once each, skip link, no duplicate ids, every section labelled by its heading.
- Impact is marked as the current page and Projects and impact as the section.
- 14 figures. The eyebrows read Tourism, Work, Skills, Places, and the word "chapter" is nowhere on the page.
- Every image has alt text and every shown image loads. Title, description (116 characters), canonical, share tags, language and favicon are set.
- No request goes to any other site, and there are no console errors, at 1440 and 390.

**Layout**
- No sideways scroll at 320, 360, 390, 600, 768, 920, 1099, 1100, 1280, 1440 and 1920.
- Section 1 photo on the right, section 3 on the left, on desktop (from 920). On phones: section 1 photo after the figures, sections 2 and 4 photo on top, section 3 has no photo (and it is never downloaded).

**Contrast** (every text line, measured against the real pixels behind it, with the real banner photo)
- At least 4.5:1 for small text and 3:1 for large at 1920, 1600, 1440, 1280, 1100, 1024, 920, 768, 600, 390 and 320. The lowest reading is the large 680 in terracotta on paper at 4.2:1, which only needs 3:1.

**Keyboard**
- 13 Tab stops in the page (7 place links, the map dots as one stop, 2 arrow buttons, 3 project links), each with a visible 3px ring (navy on paper, white on night), in page order.
- The map dots are one radio group: arrow keys, Home and End move and select, and wrap. The arrow buttons keep focus on the button you pressed. The country is announced.

**Map**
- 31 checks: opens on India, click, keyboard, wrapping, announcement, project links work, every dot big enough to press (24px on desktop), no sideways scroll, JavaScript off shows no map and lists all 15 countries and 20 projects.
- 12 data checks: no projects (section left out), a project with no country, a country that cannot be drawn (left off with a warning, the build carries on), adding projects (new country gets a dot, the count and the first year update), hostile text escaped, dot sizes (12, 16, 20 and no bigger).
- Reduced motion switches off the dot, arrow and link easing.

**Bad and odd content** (made-up entries): 21 checks. Eleven bad entries are refused with a message that says what to fix (three sections, an empty heading, a decimal number, no figures, six figures, an empty place, a photo with no alt text, and more). A page that is not published is left out. Hostile text and a `{{placeholder}}` typed into the content are shown as text and never run. Long unbroken words do not widen the page. Sections with no photo draw correctly.

**Big figures**: the 680 and the ₹30,000 roll once and land on the right number; with reduced motion or without JavaScript the real numbers are simply there. A number already on screen at load is left alone, by design: on a tall window the 680 is already visible, so it does not roll.

**Found and fixed during the phase**: the banner photo field had no tab in the Studio; the banner was sent as an 800px file and stretched (now sent at its full 1200px, higher quality); the chapter 2 text sat over a bright part of the photo between 920 and 1100px wide; the small banner and photo captions were too faint over bright patches of the real photo; a country outside the map frame would have stopped the whole build (now it is left off with a warning).

**Not covered:** a real screen reader, Firefox, Safari, real phones and tablets, judging the look, and Windows forced-colours mode. No page-weight budget is set. Slow 4G timing was not re-measured for this page.

## B. For you to check

Set aside 15 minutes. Run `node build/build.js`, start Live Server (or open the live preview after the push) and open the page.

1. **Desktop (1440).** Compare with your mock-up. Scroll through all four sections. Check section 1's photo is on the right, the 680 size, the banner height.
2. **Banner photo.** In the Studio (Pages, Impact page, Top of the page, Banner photo) drag the hotspot to the very bottom of the photo so the four people show fully, publish, rebuild. It is still soft on large screens (the original is only 1200px wide).
3. **Map.** Click several dots, use the arrow buttons, and press Tab to the map and use the arrow keys. Try the Virgin Islands dot next to Saint Lucia on a phone.
4. **Phone width.** DevTools (F12, phone icon) at 390. Nothing cut off on the right. Then a real phone, over mobile data if you can.
5. **Keyboard only.** Tab through the page: can you always see where you are?
6. **Another browser.** Firefox, and Safari or an iPhone if you have one.
7. **Screen reader (best if you can).** With Windows Narrator (Windows key + Ctrl + Enter): do the headings, the figures read as one sentence, the map dots and the arrows make sense?
8. **Zoom.** Ctrl and + to 200% then 400%: nothing needs sideways scrolling.
9. **Edit in the Studio.** Change a figure, tick a "Project it came from", add a project with a new country, publish, rebuild: the page and the map follow.

## C. Before launch (for Ram and Joy, and for you)

- **Joy to confirm the numbers** (sources in the Studio, never shown on the page): the hero says €111,000 across **14** countries, the homepage says **17**; the 2022 workshop's own report says **16** astroguides trained, OAD's page says **17**; OAD's page says **72** mentors from 14 countries, the 2022 workshop text says **28**; the third city council was "in progress" in the project text; 680, 5 resorts, $5,200 and 37 are not in any project text; the farmers' market is only on OAD's Impact page.
- **Which project each India figure came from**, so the six unlinked figures can link to a project page. Seven figures are linked now.
- **Photographers' credits** for the five photos (the credit field is optional and empty), and a sharper original of the banner photo if one exists.
- **Structural changes to tell Ram and Joy about:** there is no separate Interactive map page (the map is part of Impact) and no Case studies page (the Impact page takes over that job), as well as the earlier ones (three paths, About, four pillars, the dropped Theory of Change items).
- **The map covers the first country of each project.** A project in several countries has one dot at the first country listed.
- **Each Sanity publish costs a Netlify deploy** (see open decision 6).
