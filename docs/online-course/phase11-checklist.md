# Phase 11 checklist: the Online course page

Page: `/resources/online-course/`. Full run on 27 Nov 2026 by Claude in headless Chrome (including real Tab and Enter key presses and Chrome's device emulation) and Node, against the real published Sanity content (the test scripts are in the session's scratchpad, not in the repo). Part A is what Claude ran. Part B is what Claude could not run. Part C is for you. Part D is for Ram and Joy. This replaces the first version, from 25 Nov, which was run with a stand-in document before the page had content.

## A. Run by Claude (all passed unless it says otherwise)

**Content** (published): a photo as the darkened backdrop of the top band (alt text "2 people amongst telescopes", no credit), a preview video with its YouTube thumbnail, ten modules in four parts, five outcomes, four steps, four facts.

**Content tests** (41, against the real loader and renderer, no network): 18 bad entries are refused with a message that names what to fix (three or five facts, an empty bold line, too few or too many outcomes, three parts, a part with no modules, an empty module title, three steps, an empty step text, an empty introduction, an http or javascript or missing course address, a video link that is not YouTube, a playlist instead of a video, a video with no title, a photo with no alt text); an unpublished page is left out; and the odd ones draw correctly (no video, a YouTube video, a video thumbnail, no thumbnail, a thumbnail with no video, a photo backdrop with and without a credit, modules numbered across the parts, the "ten modules, four parts" line worked out, hostile text escaped everywhere including a typed `{{> header}}`, a module with no topics, a 300-letter word, the buttons open another site with no new tab, the head tags).

**Structure**: one h1; h2 for the three sections, h3 for the parts and steps, h4 for the modules, none skipped; header, main and footer once each; no duplicate ids; every section labelled by its heading; every image has alt text and loads; every link and button has a name; Resources and Online course are marked as the current page in the header. The Studio schema validates with no errors or warnings.

**Contrast** of every text line against the real pixels behind it (107 to 151 lines per width): all pass at 1920, 1536, 1440, 1366, 1280, 1100, 1024, 920, 768, 600, 480, 414, 390, 375, 360 and 320. This includes the title, intro, facts and "Hosted by" line over the darkened photo and the "Course preview" label over the real thumbnail. (The photo overlay was darkened further on 26 Nov after the first try failed over its brighter parts.)

**Title**: one line at 600px wide and above (600, 640, 768, 919, 920, 1024, 1100, 1280, 1440, 1920); two lines below 600 (320 to 599).

**Keyboard, with real key presses**: the page has 3 Tab stops (the yellow button, the video, the navy button), each with a visible ring. Pressing Enter on the video swaps it for the player and moves focus into it; its name reads "Play video: Astrotourism online course preview (loads YouTube)". The phone menu opens with Enter, becomes "Close menu", makes the page inert, and Escape closes it and returns focus to the menu button.

**Privacy**: before anything is pressed the page contacts only this site (the thumbnail is served from here). Only after the press does it contact `youtube-nocookie.com`.

**Widths and spacing**: no sideways scroll at 720, 640, 576, 512, 360 and 320 (with a scrollbar present; this covers the 200%, 250% and 400% zoom cases). With text spacing loosened the way WCAG 1.4.12 describes (line height 1.5, letter spacing 0.12em, word spacing 0.16em, paragraph spacing 2em) nothing is clipped, nothing runs sideways and the title, intro, button, "Hosted by" line and facts stay in order, at 1440, 768 and 390.

**Joins** (the paper band's wavy edges against the dark bands): no hairline at 16 widths at normal density, at 7 phone widths at 1x, 2x, 2.625x and 3x, and at 6 widths from 360 to 1882 at 1x to 2x (one hit at 1366 and 1.5x was an artefact of how Chrome stitches a tall capture, and is not on the page).

**Forced colours** (Windows high contrast, emulated): text stays readable on solid backplates over the photo and over the thumbnail, the video play circle shows, the wavy band and the outline are visible. Looked at on desktop and phone.

**JavaScript off**: the video is a plain link to YouTube, every module and outcome is in the page, both buttons work. **Reduced motion**: the button and play-circle transitions are off and nothing animates. **Console**: no errors in the whole run.

**Load on Slow 4G** (150 ms delay, 1.6 Mbit/s, cache off, uncompressed local server): phone (CPU 4 times slower) 425 KB, first paint 2.9 s; desktop 620 KB, first paint 2.6 s (the photo and the thumbnail are the heaviest parts; Netlify compresses the stylesheet and script).

**Links**: every local link and image exists except the pages not built yet (Which resource, The three resources, Practical guidelines, Community, Global Survey Report, Get funding, and the two overview pages `/resources/` and `/projects/` that the footer links to). The course address opens the real OpenLearn Create course (read on 25 Nov; the site refuses command-line requests) and the video link answers.

**Whole project**: secrets scan of every file git would include: no tokens, keys or passwords, and no `.env`.

**Clean build**: see the end of this file for the result of building a clean copy with an empty cache, as Netlify does.

## B. Not run, so not counted

- A real browser: Chrome on your own screen, Firefox, Safari, a real phone and a real tablet (headless Chrome only).
- A real screen reader (Narrator or NVDA) and a real Windows high-contrast theme (the forced colours were emulated).
- Judging the look by eye, including the width between 920 and 1100px and the black bars on the video thumbnail.

## C. For you

1. **Compare with your mock-ups** at 1440 and 390 (the top band is now a darkened photo, the title one line, the learn band has the wavy edges, the outline and steps as drawn), on your own screen and your own phone.
2. **Improve the photo's alt text in the Studio.** It says "2 people amongst telescopes"; the photo changed since you wrote it, so describe what it shows now. Add a credit if you have one (it shows small at the bottom right of the top band).
3. **Read the page against the real course** (open both): hours, level, modules and topics.
4. **Tab through it**, press Enter on the video, open the phone menu, and look for a hairline under the wave on your phone.
5. **Reduced motion**, another browser, and a screen reader if you can.

## D. For Ram and Joy

- **The module list.** The live OpenLearn course has "Introduction to Astronomy" as an extra module; OAD's own page and the original design leave it out. The page now has ten modules, adding it.
- **Wording not found on either real page:** "at your own pace", "start at any time", "no fees", and the part names "Foundations" and "Finishing the course". The outcomes are a plainer rewording of OpenLearn's five.
- **"Statement of Participation"**, not "certificate" (the real name), and the step that says completing the course earns it (the real page says "on completion").
- **The licence credit:** OpenLearn says CC BY 4.0, OAD's page says CC BY-NC-SA 4.0 for the adapted preview. Does the page need a credit line?
- **The photo and the video:** may we show them, and the credit for the photo. The video's thumbnail shows black bars along the top and bottom because the video itself is wider than 16 to 9.
- **A structural note:** this page replaces OAD's "Training: Astrotourism Online Course" page, which is a preview edition of the course with resource downloads. Those downloads are not on the new page.
