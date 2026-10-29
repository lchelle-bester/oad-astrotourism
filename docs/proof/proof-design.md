# The proof section (Phase 4)

The approved design for "proof", the section after the six pillars. It shows what OAD-funded astrotourism projects have achieved and sends visitors to the full list of outcomes. Files beside this one:

- `proof-desktop-1440.png`: desktop at 1440 wide
- `proof-phone-390.png`: phone at 390 wide
- `proof-button-hover.png`: the "See all outcomes" button at rest (left) and on hover (right)
- `proof-ridge-desktop.svg` and `proof-ridge-phone.svg`: the mountain-ridge top edge of the teal band

The "three paths" section in the site plan has been cut, so the homepage order is now: hero, the case, the six pillars, proof, news and updates, get involved, footer.

Measurements are from the mock-ups. They are a target, not a pixel contract: build it fluid and check it at every width.

All words and numbers come from Sanity. The ridge edge, colours and button behaviour live in the repo.

## The idea

After the navy sections above, the page changes colour: a full-width teal band whose top edge is a soft mountain ridge, so it reads as part of the landscape, not a box. One big headline figure on the left with a strong yellow button, and three results on the right, each led by one big number. It must fit inside one screen on desktop.

## Content

| Item | Text |
|---|---|
| Eyebrow | Impact |
| Heading | What our projects have achieved |
| Headline figure | **€111,000** invested in astrotourism projects across 14 countries |
| Result 1 | **7** tour companies and five-star resorts introduced astrotourism packages. Label: Tourism · Malaysia |
| Result 2 | **37** village women and disabled persons trained to be astroguides. Label: Communities · India |
| Result 3 | **3** city councils adopted astrotourism. Label: Local government · Malaysia |
| Button | See all outcomes |

Source for all of it: OAD's own page "Impact of Our Astrotourism Projects" on astrotourism.astro4dev.org, copied by me on 28 October 2026. The source is not shown on the page (my decision), but every figure must still record its source in Sanity, and the button goes to the full outcomes, which is the source.

Our edits to OAD's wording, to flag to Ram and Joy:
- **7** adds together OAD's "4 tour companies and 3 5-star resorts".
- **37** adds together OAD's "30 village women and 7 disabled persons".
- The heading, eyebrow and the labels (Tourism, Communities, Local government) are our wording.

Still to confirm with Joy before launch (do not block the build on these, but keep them easy to change in Sanity):
- The headline figure. The Impact page says around €111,000 across 14 countries. Joy's paper from June 2026 says over €100,000 across 17 countries.
- Which project each result came from, so results can link to their project pages later.

## Sanity

Agree the schema with me before writing it. A starting point to discuss, not a decision:

- A single `impactSection` document: `eyebrow`, `heading`, `headline` (one figure), `results` (array of exactly 3), `buttonLabel`, `buttonLink`.
- Each figure (the headline and each result): `value` as a number (so it can count up), an optional `prefix` (for example "€") and `suffix`, `label` (the sentence), `tag` (for example "Tourism"), `place` (for example "Malaysia"), `sourceText` and `sourceUrl` (required, never shown on the page), `checkedOn` (date).
- The case section's statistics may want the same figure shape. Tell me whether to share one type between them.

## Desktop (reference 1440 wide)

| Element | Value |
|---|---|
| Band | full width, background teal `#1a524b`. The top edge is the ridge in `proof-ridge-desktop.svg` (navy above the line, teal below), stretched to the full width. Section height about 610px including the ridge |
| Bottom edge | straight for now. We'll decide when designing news and updates |
| Left column | left 64px, width about 560px, content starting about 140px below the top of the board |
| Eyebrow | Barlow 600, 14px, uppercase, letter-spacing 0.14em, sand `#d9b487` (4.6:1 on teal, just passes) |
| Heading | Space Grotesk 600, 40px, line-height 1.12, white |
| Headline figure | Space Grotesk 600, 112px, letter-spacing -0.045em, white. 36px above it |
| Figure label | Barlow 21px, line-height 1.45, white |
| Button | see below, 40px under the label |
| Right column | left 700px, right 64px |
| Results | a list of three rows, 1px lines in white at 22% between and around them, about 24px padding top and bottom |
| Result number | Space Grotesk 600, 76px, white, in a column about 132px wide |
| Result tag | Barlow 600, 12px, uppercase, letter-spacing 0.12em, sand, for example "TOURISM · MALAYSIA", 6px above the sentence |
| Result sentence | Barlow 22px, line-height 1.35, white |

## Phone (reference 390 wide)

- Same teal band, with `proof-ridge-phone.svg` as the top edge.
- Side margins 24px. Eyebrow 12px, heading 30px, headline figure 68px, its label 17px.
- Each result is stacked: the number (44px) with its tag on the same line beside it, then the sentence underneath at full width (17px). Lines between rows, about 16px padding.
- The button runs the full width.
- The mock-up is 840px tall. On real phones, with browser bars, it will need a short scroll, and that's accepted.

## The button

- Yellow `#f9c434` pill, navy `#0f1b2b` text (10.7:1), Barlow 600, 20px (18px on phone), with a soft shadow. On the right, a navy circle (48px, 44px on phone) holding a yellow arrow. It's the only yellow in the section.
- **Hover and keyboard focus:** the button turns white (the text stays navy, the arrow circle stays navy with a yellow arrow) and the arrow moves 4px right, over about 0.25 seconds. `proof-button-hover.png` shows both states. Focus also gets a 3px white outline. White against teal is 8.9:1.
- **Watch out:** the site's general link style may change link text colour on hover. Give the button its own hover colour so the general rule can't turn its text yellow on a yellow or white background.
- **Reduced motion:** the colour changes instantly, with no arrow movement.
- **Phone:** no hover. It stays yellow.
- It is a link (`<a>`), not a button element, because it goes to another page.

## Motion: numbers count up

- €111,000, 7, 37 and 3 count up from zero the first time the section comes into view (IntersectionObserver), over about 1.2 seconds, easing out (fast at first, slowing at the end). Once only.
- The real final numbers are in the HTML that build.js writes. The script animates over them. Screen readers, search engines and anyone without JavaScript always get the correct number, never 0 or a half-counted value. Hide the animating digits from screen readers if needed, so they don't announce every step.
- Keep the width stable while counting (`font-variant-numeric: tabular-nums`, or reserve the final width), so nothing beside the numbers jiggles.
- €111,000 keeps its thousands comma throughout.
- **Reduced motion:** no counting. The final numbers show straight away.

## Accessibility

- `<section aria-labelledby>` pointing at the `<h2>`. The eyebrow is a plain paragraph above it.
- The results are a list (`<ul>`). Each item should read as one sentence, number first, then the place.
- The ridge is decorative (`aria-hidden="true"`).
- Contrast on teal (calculated): white 8.9:1, sand 4.6:1 (only for the small bold labels; check in the browser), yellow button against teal 5.5:1.
- Test at 1440, 1280, 1024, 768, 390 and 320 wide, keyboard only, at 200% zoom, and with reduced motion on.

## Decisions still open (bring me options)

1. **Sanity shape**, and whether the case section's statistics share the same figure type.
2. **Where the button goes.** The current site's Impact page for now, or a placeholder for the new site's Impact page.
3. **The breakpoint** between the two-column and the stacked layout.
4. **Joy's answers** (headline figure, which project each result came from, and approving the 7 and 37 totals): these change content, not code.
