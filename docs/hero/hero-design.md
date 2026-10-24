# Hero design (Phase 1)

The approved hero design, called "H3" during design. Two reference images sit beside this file:

- `hero-desktop-1440.png`: desktop at 1440 x 900
- `hero-phone-390.png`: phone at 390 x 844

Measurements below are from those two mock-ups. They are a target, not a pixel contract: build it fluid, using `clamp()` and the formulas given, so it looks right at every width between and beyond them. The mock-ups use a still frame; the real hero uses the video.

Text in the hero comes from Sanity (`hero.headline`, `hero.subheading`, `hero.affiliation`). Never hard-code it.

## The idea

Night sky above, mountains along the bottom. "Astrotourism" is the largest thing on the page and sits on the mountain line. Everything is grouped low on the screen, so the sky above stays empty.

- **Desktop:** the mountains sit *in front of* the word, so the peaks cut into the bottom of the letters. "for a better world." and the subheading sit below, on the dark foreground.
- **Phone:** no cut-in. "Astrotourism" sits *on top of* the highest peak, in one line. Below the mountains is a dark navy "ground" band holding "for a better world." and the subheading, both right-aligned.

## Shared

| Element | Value |
|---|---|
| Headline word "Astrotourism" | Space Grotesk 600, white, letter-spacing about -0.045em |
| "for a better world." | Space Grotesk 600, white |
| Affiliation line | Barlow 600, uppercase, sand `#d9b487`, letter-spacing 0.12 to 0.14em. Sits just above "Astrotourism" as a small label |
| Subheading | Barlow 400, white at 90 to 92% opacity |
| "Part of the Office of Astronomy for Development ↗" | Barlow, sand, links to https://astro4dev.org |
| Dark navy used for the phone strip and ground | `#0f1b2b` (a darker shade of the brand navy, not in the CI palette; see decisions) |

## Desktop (reference 1440 x 900)

- **Hero box:** full width, `min-height: 100svh`, `overflow: hidden`.
- **Video:** fills the box, `object-fit: cover; object-position: 50% 100%` (anchored to the bottom, so the mountains are never cropped off).
- **Top shading** (behind the header): `linear-gradient(to bottom, rgba(30,53,81,0.75) 0%, transparent 20%)`.
- **Header:** padding 24px 64px. Left: OAD symbol (`oad-symbol-colour-transparent-for-dark-bg-300.png`) at 56px, a 1px divider (white 40%), "Astrotourism" in Space Grotesk 600 22px. Right: nav (see decisions), then a 1px divider and the "Part of OAD" link in sand at 15px.
- **Affiliation label:** 14px, left about 70px, 32px above the top of the word.
- **"Astrotourism":** 216px at 1440 wide (about `15vw`, clamp it), line-height 1, left about 62px, `z-index` below the mountain cut-out.
- **Mountain cut-out:** a transparent PNG of the mountains only, laid exactly over the video, above the word. See "Mountain cut-out" below.
- **Word position:** its baseline must sit at the same height on the mountains at every screen size. Because the video is `cover`, the video's scale is `s = max(100vw / 1920, 100svh / 1082)` (screen px per video px of the 1080p frame). In the mock-up the word's baseline is 155 video px above the bottom of the frame, so position it with `calc(155 * s)` from the bottom of the hero. Check this in the browser at several widths.
- **Bottom shading:** a 105px band at the bottom, `linear-gradient(to top, rgba(12,20,30,0.85) 0%, rgba(12,20,30,0.5) 55%, transparent 100%)`, above the cut-out, so the text below stays readable.
- **"for a better world.":** 52px, left about 66px, on the foreground under the word, `text-shadow: 0 2px 18px rgba(10,16,24,0.8)`.
- **Subheading:** 19px, line-height 1.5, about 440px wide, right side (right 64px), level with the tagline.

## Phone (reference 390 x 844)

Switch to this layout below roughly 720px wide (check where the desktop layout stops working and set the breakpoint there).

- **Background:** `#0f1b2b` for the whole hero.
- **"Part of OAD" strip:** at the very top, `#0f1b2b`, at least 34px tall, link in sand 13px, padding 0 20px. Sand on `#0f1b2b` is 8.9:1.
- **Header:** padding 12px 20px. OAD symbol 44px, divider, "Astrotourism" 18px. Menu button on the right: 44 x 44px, two 22px bars, `aria-label="Menu"`.
- **Video area:** the top 650px. The video is shown at 0.6 of its 1080p size (so it stays sharp) and shows only the part of the frame from 26% to 60% across, which puts the highest peak under the word. In the mock-up: video box 1152 x 649 at left -300px, top 0. This should use the phone video (see "Video work").
- **Top shading:** `linear-gradient(to bottom, rgba(15,27,43,0.9) 0%, transparent 22%)` over the video area.
- **Ground fade:** a band from 596px to 652px, `linear-gradient(to bottom, transparent, #0f1b2b)`, so the bottom of the video melts into the ground.
- **Affiliation label:** 12px, line-height 1.6, top about 430px, left and right 20px.
- **"Astrotourism":** one line, 61px, letter-spacing -0.05em, left about 19px. This is the largest one-line size that fits 390px with 20px margins (measured with the real font). Its baseline rests on the highest peak (about y 528 in the mock-up). Use `clamp()` so it never wraps on narrower phones.
- **"for a better world.":** 30px, right-aligned, right 20px, top about 672px (in the ground band).
- **Subheading:** 17px, line-height 1.5, `text-align: end`, left and right 20px, top about 722px.
- **No mountain cut-out on the phone.**

## Video work

These change the video files, so do them as separate steps with my approval, starting from OAD's original 4K clip (never re-encode the already compressed files, it loses quality).

1. **Brighten the mountains.** In the approved design the mountains are lifted so they stand out, but only from just above the peaks downwards; the sky and stars stay as they are. Mock-up settings, per frame of the 1080p video: a mask that fades in from y 850 to y 990 (smoothstep), and inside it each colour channel becomes `min(1, 1.12 * value^0.62)` (values 0 to 1). Apply it in the same encode as the existing steps in `credits.md`, then check that the loop still has no jump.
2. **Phone version.** A portrait crop from the 4K original covering 26% to 60% of the frame width, full height, so phones get a sharp picture. Phones have about 3x pixel density, so the 1080p file would look soft there.
3. **Poster images** to match each file, as now.

## Mountain cut-out (desktop only)

A PNG of the mountains with the sky made transparent, taken from the brightened first frame. Make it the **full frame size** (mostly transparent, it compresses well) so it can use exactly the same `object-fit: cover; object-position: 50% 100%` as the video and line up at every size. The camera drifts only 2 to 4px during the clip, so a still cut-out lines up, but check in real Chrome that the edge does not shimmer.

`make-mountain-cutout.py` beside this file is how the mock-up's cut-out was made (Python with Pillow, NumPy and SciPy). It finds the ridge line with a smoothest-path search and keeps everything below it. Use it as a reference, or redo it however suits the project. The output needs an entry in `credits.md` (derived from the hero video).

## Accessibility and behaviour

- The whole headline ("Astrotourism for a better world.") is one `<h1>`; the two parts are styled spans inside it.
- The video and cut-out are decorative: `aria-hidden="true"`, empty `alt`.
- `prefers-reduced-motion`: show the poster, no video.
- Check contrast of all text over the real video in the browser, not only on the still.
- Test at 1440, 1024, 768, 390 and 320 wide, keyboard focus on every link, and 200% zoom.

## Decisions still open (bring me options before building these)

1. **Headline in Sanity.** The design styles "Astrotourism" and "for a better world." differently, but the hero schema has one `headline` field. Options include splitting it into two fields, or a rule in `build.js` that splits off the first word.
2. **Nav in Phase 1.** The mock-up shows Resources and Projects and impact (with dropdowns), Get funding and About. Those pages do not exist yet. Build the nav now, or leave it until the pages exist?
3. **"Get funding"** as a single top link, renamed "Astrotourism Fund", or folded into Resources.
4. **Affiliation line link** (open decision 7 in CLAUDE.md).
5. **The darker navy `#0f1b2b`** is not in the CI palette. Keep it, or use the official navy `#1e3551` with a thin sand line under the strip.
