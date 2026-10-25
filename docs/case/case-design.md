# The case section (Phase 2)

The approved design for "the case", the statistics section directly under the hero. It was called "Trail" (design 3) during design. Files beside this one:

- `case-desktop-1440.png`: desktop at 1440 wide, with the bottom of the hero at the top so the join is visible
- `case-phone-390.png`: phone at 390 wide, same
- `case-trail-desktop.svg` and `case-trail-phone.svg`: the contour lines, the dotted trail (`id="trail"`) and the three waypoint dots, in section coordinates (0,0 is the top left of the section, directly under the hero)

Measurements are from the mock-ups. They are a target, not a pixel contract: build it fluid and check it at every width.

All words and numbers in this section come from Sanity. Never hard-code them. The drawings (contours, trail, dots) are fixed design files and live in the repo.

## The idea

Scrolling out of the hero feels like walking down into the mountains at night. The mountains dissolve into dark navy, and a dotted sand trail winds down the page past three waypoints. Each waypoint has one big number. Very little text, easy to scan.

## Content

| Item | Text | Source |
|---|---|---|
| Eyebrow | Why astrotourism | |
| Heading | A dark sky is worth travelling for. | |
| Stat 1 | **8 in 10** people live under light-polluted skies. | Falchi et al., Science Advances, 2016 |
| Stat 2 | **62%** of travellers are considering destinations with darker skies. | Booking.com survey of 27,713 travellers in 33 countries, 2024 |
| Stat 3 | **$2.2bn** the estimated size of the global astro tourism market in 2025. | Growth Market Reports, 2026 estimate (range $1.9bn to $2.5bn) |

Sources, checked on 25 October 2026 (put these in Sanity with each figure, and in whatever record we keep of statistics):

- Stat 1: Falchi, Cinzano, Duriscoe et al., "The new world atlas of artificial night sky brightness", Science Advances, 2016. The abstract says "more than 80% of the world" lives under light-polluted skies. https://www.science.org/doi/10.1126/sciadv.1600377 (open copy: https://pmc.ncbi.nlm.nih.gov/articles/PMC4928945/)
- Stat 2: Booking.com Travel Predictions 2025, published 18 October 2024. "Nearly two thirds (62%) are considering visiting darker sky destinations." Online survey of 27,713 respondents in 33 countries and territories, July to August 2024. Reported at https://www.hospitalitynet.org/news/4124191.html (use Booking.com's own press page if you can find it).
- Stat 3: Growth Market Reports, Astro Tourism Market, updated 11 October 2026. USD 2.2 billion in 2025, stated range USD 1.9 to 2.5 billion. A commercial estimate; the full method is paywalled. https://growthmarketreports.com/report/astro-tourism-market

## Sanity

Agree the schema with me before writing it. A starting point to discuss, not a decision:

- A single `caseSection` document: `eyebrow` (string), `heading` (string, required), `stats` (array of exactly 3).
- Each stat: `value` (string, required, for example "8 in 10", so editors can write any format), `label` (string, required), `sourceText` (string, required), `sourceUrl` (url, required), `checkedOn` (date). The plan also lists an "impact figure" type, so these might be reusable impact figures that this section references instead. Give me the options.
- The layout is designed for exactly three stats. Validation should stop editors adding a fourth or removing one.

## Desktop (reference 1440 wide)

The section is a box about 900px tall at 1440 wide, background `#0f1b2b`. Positions below are in section coordinates.

| Element | Value |
|---|---|
| Eyebrow | Barlow 600, 14px, uppercase, letter-spacing 0.14em, sand `#d9b487`, 16px below it to the heading |
| Heading | Space Grotesk 600, 44px, line-height 1.12, letter-spacing -0.02em, white, max width 560px. Block at left 64px, top 56px |
| Numbers | Space Grotesk 600, 104px, line-height about 1, letter-spacing -0.03em to -0.04em, yellow `#f9c434` |
| Labels | Barlow 400, 18 to 19px, line-height 1.4 to 1.45, white, 10 to 12px below the number |
| Source lines | Barlow 400, 12px, white at 62% opacity, 6px below the label |
| Stat 1 block | left 1044px, top 142px, width 360px. Waypoint dot at (1000, 210) |
| Stat 2 block | left 560px, top 420px, width 420px. Waypoint dot at (430, 490). It sits in the gap between two bends of the trail and must not touch the line |
| Stat 3 block | left 1044px, top 686px, width 360px. Waypoint dot at (1000, 740) |
| Trail | the path in `case-trail-desktop.svg`: sand, stroke 3, `stroke-dasharray: 2 12`, round caps. It starts at the top centre and leaves at the bottom centre, so the next section can pick it up |
| Waypoint dots | yellow dot radius 9, plus a ring radius 20 in yellow at 35% opacity |
| Contour lines | sage `#72896b` at 26% opacity, stroke 1.2. Decorative only |

The trail's waypoints and the stat blocks have to stay lined up. Laying the SVG and the blocks out on the same 1440 x 900 coordinate box (scaled to the width, `aspect-ratio`, centred with a max width) is one way. Check it at 1440, 1280 and 1024. Below the width where the zigzag no longer fits (probably somewhere under 1024), switch to the phone layout. Tell me where you set the breakpoint and why.

## Phone (reference 390 wide)

A single column. Section about 844px tall in the mock-up, but let it grow with its content.

| Element | Value |
|---|---|
| Trail | runs down the left, about x 22 to 52, path in `case-trail-phone.svg`: sand, stroke 2.5, `stroke-dasharray: 2 10` |
| Waypoint dots | at x 36, level with the middle of each big number. Dot radius 7, ring radius 15 |
| Text column | left 72px, right 20px |
| Eyebrow | 12px, letter-spacing 0.12em, top about 30px |
| Heading | 25px, line-height 1.15 |
| Numbers | 72px, yellow |
| Labels | 15 to 16px |
| Source lines | 11px, white at 62% |
| Spacing | stat tops at about 200, 422 and 646px in the mock-up (roughly 220px apart) |

On a phone the stats should sit in normal document flow, so long labels or bigger text settings cannot cause overlaps. The trail then has to stretch to the column's height and the dots have to line up with the numbers. Two ways to do that: stretch the SVG with `preserveAspectRatio="none"` and `vector-effect: non-scaling-stroke` on each path (it is not inherited), with the dots as CSS pseudo-elements on each stat; or measure the stat positions with JavaScript and place the dots. Recommend one.

## The join with the hero

This changes the hero, so check the hero still matches its approved design afterwards.

- **Desktop:** replace the hero's 105px bottom shading with a longer, eased fade that ends exactly in the section colour: from 210px above the hero's bottom edge to the edge, `linear-gradient(to bottom, rgba(15,27,43,0) 0%, rgba(15,27,43,0.05) 12%, rgba(15,27,43,0.18) 30%, rgba(15,27,43,0.42) 50%, rgba(15,27,43,0.72) 70%, rgba(15,27,43,0.92) 88%, #0f1b2b 100%)`. It sits above the video and mountain cut-out and below the text, so "for a better world." and the subheading stay crisp. Check the word "Astrotourism" still looks fully white.
- **Phone:** the ground fade becomes 112px long, from about 550px to 662px in hero coordinates, with the same stops.
- There must be no visible line where the hero ends and the section starts.

## Motion

Keep it minimal. No libraries. Every animation is decoration and nothing depends on it.

**Desktop**
1. **The trail draws itself** as the section scrolls through the screen, tied to scroll position. Each waypoint dot lights up (fades from about 30% to full, ring included) when the drawn line reaches it. The trail is dotted, so animating its dash offset won't work directly. One approach is to reveal it through an SVG mask: a solid copy of the path with `pathLength="1"`, whose `stroke-dashoffset` goes from 1 to 0.
2. **Each stat block fades in and rises** about 16px, once, when it comes into view (IntersectionObserver, about 600ms, ease-out). The heading and eyebrow can do the same. No counting up of numbers.

**Phone**
- Only the trail draws itself, with the dots lighting up. All text is shown straight away, with no fade or movement.

**For everyone**
- `prefers-reduced-motion: reduce`: no animation at all, the trail fully drawn, the dots lit, the text visible.
- Without JavaScript the section must look finished. Only add the "hidden, waiting to animate" state from JavaScript.
- Use a passive scroll listener with `requestAnimationFrame`, or CSS scroll-driven animations with a fallback. Check browser support before relying on the CSS version, and tell me which you chose.

## Accessibility

- `<section aria-labelledby>` pointing at the `<h2>`. The eyebrow is a plain paragraph above it, not a heading.
- The three stats are a list (`<ul>`), each item reading as one sentence, number first.
- The SVG is decorative: `aria-hidden="true"`, `focusable="false"`.
- Contrast on `#0f1b2b` (calculated): white 17.3:1, yellow 10.7:1, sand 8.9:1, white at 62% 7.3:1. Re-check if any colour changes.
- Test at 1440, 1280, 1024, 768, 390 and 320 wide, at 200% zoom, with reduced motion on, and on a throttled connection.

## Decisions still open (bring me options)

1. **Sanity shape:** a section document with its own stats, or reusable impact figures that it references.
2. **Source lines as links** to the source page. I lean towards yes, since it shows where each number comes from.
3. **Where the trail goes next.** It leaves the bottom of this section. Does the next section (the six pillars) continue it, or does it end here?
4. **Breakpoint** between the zigzag and the single column.
5. **Stat 3 wording.** It is a commercial estimate. Joy should see it before launch.
