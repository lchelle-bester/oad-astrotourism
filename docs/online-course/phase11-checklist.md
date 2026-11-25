# Phase 11 checklist: the Online course page

Page: `/resources/online-course/`. Run on 25 Nov 2026 by Claude in headless Chrome and Node (test scripts are in the session's scratchpad, not in the repo). The page had no content in Sanity yet, so it was tested with a stand-in document (the fill script's wording, a placeholder video link and an existing Impact photo), through a preload that answers only the course query; nothing was written to Sanity. Part A is what Claude ran. Part B is what Claude could not run. Part C is for you. Part D is for Ram and Joy.

## A. Run by Claude (all passed unless it says otherwise)

**Content checks** (31, against the real loader and renderer, no network): 18 bad entries are refused with a message that names what to fix (three or five facts, an empty bold line, too few or too many outcomes, three parts, a part with no modules, an empty module title, three steps, an empty step text, an empty introduction, an http or javascript or missing course address, a video link that is not YouTube, a playlist instead of a video, a video with no title, a photo with no alt text); an unpublished page is left out; and the odd ones draw correctly (no video leaves the block out and the list full width, a YouTube link gives click-to-load markup with the privacy-enhanced address, modules are numbered across the parts, the "eight modules, four parts" line is worked out, hostile text is escaped everywhere including a typed `{{> header}}`, a module with no topics, a 300-letter word, the button says it opens another site and has no new tab, the title, canonical and description are right).

**Structure** (1440): one h1, headings h2, h3 (parts and steps), h4 (modules), none skipped, header, main and footer once each, skip link, no duplicate ids, every section labelled by its heading, every image has alt text, every link and button has a name, no console errors. Resources (button) and Online course (link) are marked as the current page in the header.

**Contrast** of every text line against the real pixels behind it (110 to 154 lines per width): all pass at 1920, 1440, 1280, 1100, 920, 768, 390, 360 and 320. Lowest: the small grey lines on the paper (6.2:1, needs 4.5).

**Keyboard, with real key presses**: the page has 3 Tab stops (the yellow button, the video, the navy button), each with a visible ring. Pressing Enter on the video swaps it for the player and moves focus into it; its name reads "Play video: <title> (loads YouTube)".

**Privacy**: before anything is pressed the page contacts only this site (no YouTube, no other host). The video address is `youtube-nocookie.com` and only loads after the press.

**Widths**: no sideways scroll at 720, 640, 576, 512, 360 and 320 (with a scrollbar present), and the 200%, 250% and 400% zoom equivalents are covered by those. With no video and no photo both cases draw cleanly at 1440 and 390.

**JavaScript off**: the video is a plain link to YouTube, every module and outcome is in the page, both buttons work.

**Reduced motion**: the button and play-circle transitions are off and nothing animates.

**Load on Slow 4G** (150 ms delay, 1.6 Mbit/s, cache off, uncompressed local server): 398 KB in 8 requests (stylesheet 209 KB, script 50 KB, fonts 57 KB, the photo 57 KB); desktop first paint 2.2 s; phone (CPU 4 times slower) first paint 2.7 s. Lighter than the Impact page.

**Studio**: the schema validates with no errors or warnings, and the fill script's dry run reads your Sanity and lists the four parts and ten modules.

**Whole site**: the build passes; the new page is left out with a note until the document is published.

## B. Not run, so not counted

- The page with the real content: nothing was published when this was run (see C1). Re-run the contrast, structure and zoom checks once the real photo and video are in, because the photo decides how the top band reads on a phone.
- Forced-colours (Windows high contrast) for this page, a real screen reader, Firefox, Safari, a real phone and tablet, judging the look, and the width between 920 and 1100px by eye.
- A clean copy built the way Netlify builds it.

## C. For you

1. **Create the content.** From the studio folder: `npx sanity exec scripts/fill-online-course-page.js --with-user-token` (dry run), then `$env:WRITE=1; npx sanity exec scripts/fill-online-course-page.js --with-user-token`. Then open Pages, Online course page in the Studio and add the photo (alt text, credit) and the YouTube link and title of the preview video. Then `node build/build.js`.
2. **Compare with your mock-ups** at 1440 and 390, and judge the look: the title size, the facts row, the outline columns, the numbers.
3. **Read the page against the real course** (open both): hours, level, modules and topics.
4. **Tab through it** and press Enter on the video; try the phone width in DevTools, then a real phone.
5. **Reduced motion**, another browser, and a screen reader if you can.

## D. For Ram and Joy

- **The module list.** The live OpenLearn course has "Introduction to Astronomy" as an extra module; OAD's own page and the original design leave it out. The page now has ten modules, adding it.
- **Wording not found on either real page:** "at your own pace", "start at any time", "no fees", and the part names "Foundations" and "Finishing the course". The outcomes are a plainer rewording of OpenLearn's five.
- **"Statement of Participation"**, not "certificate" (the real name), and the step that says completing the course earns it (the page says "on completion").
- **The licence credit:** OpenLearn says CC BY 4.0, OAD's page says CC BY-NC-SA 4.0 for the adapted preview. Does the page need a credit line?
- **The preview video and the photo:** whose are they, may we show them, and the credit.
- **A structural note:** this page replaces OAD's "Training: Astrotourism Online Course" page, which is a preview edition of the course with resource downloads. Those downloads are not on the new page.
