# Phase 11: the Online course page

Address: `/resources/online-course/` (already in the nav, the footer and the Studio page list). Started 25 Nov 2026. Mock-ups by L'chelle: `online-course-desktop-1440.png` and `online-course-phone-390.png` in this folder. The course itself is run by The Open University on OpenLearn Create: this page describes it and sends people there, so every fact on it must match the real course.

## What the page is

Four bands, following the mock-ups:
1. **Top (night):** the title (no breadcrumb: removed 25 Nov 2026 at L'chelle's request), the introduction, a yellow "Start the free course" button with "Hosted by The Open University on OpenLearn Create.", a photo (right on desktop, full width under the header on phones) and four facts.
2. **What you will learn (paper):** five outcomes, numbered, and an optional "Course preview" video card (click to load from YouTube, as on the news pages).
3. **Course outline (night):** "Ten modules, four parts" (worked out from the data), four parts with ten modules, each with topics. Plain columns on desktop (four from 1100px, two from 920px), soft cards on phones with "Part 1 of 4".
4. **How it works (paper):** four steps (big numbers on desktop, a numbered line on phones), the navy button and the hosted line again.

## What is in Sanity and what is fixed

One document, `onlineCoursePage` (Studio: Pages, Online course page), in four tabs: Top of the page, What you will learn, Course outline, How it works. Editable: introduction, course address, button words, the line under the button, the four facts, the photo (alt text required, credit optional), the outcomes, the video link and title (both optional), the four parts with their modules and topics, the four steps, and (never shown) the source of the facts and the date they were checked.

Fixed in the page (`build/course.js`): the title, the three section headings, the numbers (outcomes, modules across all parts, "Part 1 of 4", steps), the "Ten modules, four parts" line and the words on the video card.

## Decisions (L'chelle, 25 Nov 2026)

- Preview video: she has a YouTube link (to be pasted in the Studio); the block is optional and left out with no link (neither real page has a video).
- Ten modules, adding "Introduction to Astronomy" (it is on the live OpenLearn course; OAD's own page and the mock-up leave it out).
- Fourth fact tile reads "Statement of Participation" (small line "free, on completion"), not "Certificate".
- Part names kept as in the mock-up: Foundations, Reading the night sky, Designing an astrotourism experience, Finishing the course.

## Facts checked on 25 Nov 2026

Against the real course (https://www.open.edu/openlearncreate/course/view.php?id=16594, first published 19/09/2025, updated 12/11/2025) and OAD's own page (https://astrotourism.astro4dev.org/?p=31151), both read by Claude:
- Confirmed: 24 hours of study; "Level 1: Introductory"; free, with a free account to enrol; a free Statement of Participation "on completion"; hosted on OpenLearn Create by The Open University; five learning outcomes (the page's wording is a plainer rewording of OpenLearn's); each module ends with a quiz that unlocks the next; the course address is the one both pages use.
- Module list: OAD's page has nine modules; OpenLearn also has "Introduction to Astronomy" (large-scale universe, local universe, solar system, basic definitions, telescopes and the electromagnetic spectrum). Topics on the page are shortened from OAD's outline.

## Not found on either real page (kept from the mock-up, for Ram and Joy to confirm)

- "At your own pace" and "start at any time" (self-paced is likely but not stated), and "no fees".
- The part names "Foundations" and "Finishing the course" (OpenLearn only groups "Reading the Night Sky" and "Designing an Astrotourism Experience").
- Step 4: the mock-up said the Statement is earned by the assignment; the real page says "on completion", so the step now says "Completing the course earns your free Statement of Participation."
- The licence line: OpenLearn says CC BY 4.0, OAD's page says "adapted from content created for OpenLearn (CC BY-NC-SA 4.0)". Joy to say which credit line, if any, the page needs.
- The preview video: no video exists on either real page. Whose is it, and may we show it?
- The photo: where it is from and OAD's agreement that it can be shown (and a credit). Not in the repo yet.
- The signed-off site plan PDF could not be read here (no PDF renderer), so what it says about this page was not compared.

## Build

`studio/schemaTypes/onlineCoursePage.js`, `studio/scripts/fill-online-course-page.js` (dry run by default, `WRITE=1`, never overwrites, L'chelle's own login), `build/course.js`, `site/templates/online-course.html`, `build/build.js` (loads it, downloads the photo at 3 to 2, marks Resources and Online course as current in the header), CSS section 23, and the existing click-to-load video code in `main.js` (no new JavaScript). The page is left out of the build, with a note, until the document is published.
