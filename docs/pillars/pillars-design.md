# The six pillars section (Phase 3)

The approved design for the section after "the case". It replaces the old "OAD Flagship Ecosystem" image on the live site with a clickable circle. Files beside this one:

- `pillars-desktop-1440.png`: desktop at 1440 wide, with Resources open
- `pillars-phone-390.png`: phone at 390 wide, with Resources open
- `pillars-hover-desktop.png`: the hover effect (Training is being hovered)
- `pillars-ring.svg`: the exact shapes of the six segments at desktop size, with the colours and outlines

Measurements are from the mock-ups. They are a target, not a pixel contract: build it fluid and check it at every width.

All words, links and photos come from Sanity. The ring shapes, colours, trail and connector are fixed design and live in the repo.

## The idea

OAD's six pillars as one circle of arrows that feed into each other, echoing OAD's own ecosystem diagram. Click a pillar and it pops out of the circle, and a card beside it (below it on phone) shows a photo, OAD's sentence about that pillar, and links to where that work lives on the site.

## Content

Order round the circle, clockwise from the top. The middle four follow OAD's diagram. Putting Promotion first and Publications last is our proposal and needs Ram and Joy's agreement.

| # | Pillar | Segment colour | Label text colour | OAD's sentence |
|---|---|---|---|---|
| 1 | Promotion & Awareness | yellow `#f9c434` | `#0f1b2b` | Provide a platform to showcase the global astrotourism sector. |
| 2 | Resources | teal `#1a524b` | white | Develop resources to encourage and support astronomy based tourism. |
| 3 | Training | sand `#d9b487` | `#0f1b2b` | Offer free, online courses to support creation of astrotourism businesses and experiences. |
| 4 | Implementation | terracotta `#af5a4c` | white | Fund projects to stimulate local growth and opportunities for communities in rural areas. |
| 5 | Community | sage `#72896b` | `#0f1b2b` | Nurture an international community of stakeholders and peer group in astrotourism. |
| 6 | Publications | navy `#1e3551` | white | Publish reports and undertake relevant research to study the impacts of astrotourism and support the case for astrotourism. |

The sentences are OAD's wording from the live homepage (checked 26 October 2026). Two edits are ours and must be flagged to Ram and Joy: a full stop added to each sentence, and "Promotion and Awareness" shortened to "Promotion & Awareness".

"Find it on this site" links (our proposal, based on the site plan's structure; the target pages do not exist yet):

| Pillar | Links |
|---|---|
| Promotion & Awareness | Astrotourism around the world (map); News and updates |
| Resources | The three resources; Which resource is right for you; Practical guidelines |
| Training | Free online course |
| Implementation | The Astrotourism Fund; Funded projects; Impact |
| Community | Community of practice and Discord |
| Publications | Global Survey Report; Case studies; Theory of Change |

Photos: one per pillar, which I am collecting. Each needs alt text, a credit, and OAD's confirmation that the people shown have agreed. Until a photo exists, show the placeholder in the mock-up (a soft gradient with a mountain line), never a broken image.

## Sanity

Agree the schema with me before writing it. A starting point to discuss, not a decision:

- A `pillar` document type, six documents: `name` (string, required), `description` (text, required), `order` (number 1 to 6, required, unique), `photo` (image with hotspot, with required `alt` and a `credit` field), `links` (array of `{ label, href }`).
- `href` can only be a plain path for now, because the pages it points to don't exist yet. Give me options for making it a reference to a page document later.
- Colours are tied to the position in the circle and live in the CSS, not in Sanity. If editors reorder the pillars, the colours stay in place.
- Validation: exactly six pillars, each with a different `order`.

## Desktop (reference 1440 wide)

| Element | Value |
|---|---|
| Section background | `#0f1b2b` |
| Eyebrow and heading | "Six pillars" (Barlow 600, 14px, uppercase, letter-spacing 0.14em, sand), then "What we do" (Space Grotesk 600, 44px). Block at left 64px, top 64px |
| Helper line | "Six pillars that feed into each other. Click one on the circle to see what it involves." Barlow 18px, white at 75%, 12px below the heading, max width 600px |
| Circle | centre at (384, 580) in section coordinates. Inner radius 140, outer radius 304. Shapes in `pillars-ring.svg` |
| Segment outlines | 1.5px sand `#d9b487` on every segment, so each clickable shape has at least 3:1 contrast with the page (teal and navy alone do not) |
| Segment labels | Barlow 600, 18px, line-height 1.2, centred on each segment's middle (at the middle radius, 222px from the centre), about 160px wide. Promotion & Awareness wraps to two lines |
| Centre | "OAD" (Barlow 600, 16px, sand, letter-spacing 0.14em) above "Flagship ecosystem" (Space Grotesk 600, 26px, white). Not clickable |
| Open segment | moves 12px outwards (along the line from the centre through its middle), outline becomes 3px white |
| Card | left 790px, top 236px, width 586px, background `#1e3551`, radius 20px. Photo at the top, 230px tall, `object-fit: cover`. Body padding 32px 40px |
| Card text | pillar name Space Grotesk 600 40px; sentence Barlow 19px, line-height 1.5; "Find it on this site" label (Barlow 600, 12px, uppercase, sand) then the links (Barlow 600, 17px, underlined, with an arrow) |
| Card footer | thin line, then "Previous", six small dots (the open one yellow), "Next" |
| Connector | a dotted yellow line from the open segment's outer edge to the card's left edge. Same dash as the trail: `stroke: #f9c434; stroke-width: 3; stroke-dasharray: 2 12; stroke-linecap: round` |
| Incoming trail | the dotted sand trail from the case section. It comes in at the top centre, curls round the left of the heading and drops into the top of the circle: `M720,0 C 720,22 24,2 24,64 L24,206 C 24,258 300,250 384,276` in section coordinates. Stroke 3, `stroke-dasharray: 2 12` |

The connector in the mock-up only shows Resources, which sits on the card's side. For pillars on the far side of the circle, the line must not cross the circle. My suggestion: run it round the outside of the circle (about 24px beyond the outer edge) to the 30 degree point, then straight to the card. Show me how it looks for Publications and Community before settling.

Below roughly 1024px wide, switch to the phone layout. Tell me where you set it and why.

## Phone (reference 390 wide)

| Element | Value |
|---|---|
| Heading | eyebrow 12px, "What we do" 30px, block at left 72px, top 28px. Helper line "Tap a pillar on the circle." 15px |
| Circle | centre (195, 330), inner radius 70, outer radius 182, so it nearly fills the width. Same shapes, scaled |
| Labels | 15px, about 124px wide |
| Open segment | moves 7px outwards (not 12, or it runs off the screen) |
| Card | below the circle: left and right 20px, top about 544px, radius 16px. Photo 170px tall. Name 28px, sentence 16px, links 16px, padding 24px |
| Incoming trail | straight down the left at x 36, then curving into the top of the circle: `M36,0 L36,110 C 36,135 120,140 190,146` |
| Connector | none (the card is directly below) |

On phone, the whole segment must be the tap target, not just its label.

## Interaction

- One pillar is open at a time. Which one is open when the page loads is an open decision (see below).
- Clicking or tapping a segment opens it: the segment pops out, the card updates, the connector redraws, and the dots and Previous/Next update. Previous and Next go round the circle in order and wrap from Publications back to Promotion.
- **Hover (desktop):** the segment and its label lift 6px outwards together and the colour brightens a little (`filter: brightness(1.12)`), over 200ms. `pillars-hover-desktop.png` shows it. Use a hand cursor. The open segment does not lift further.
- **Keyboard focus** gets the same lift plus a clearly visible focus outline. Never rely on colour alone.
- Card content changes with a short cross-fade (about 200ms).
- **Reduced motion:** no lift, pop or fade movement. The open segment keeps its white outline and brightness, and changes happen instantly.

## Accessibility

- This is a classic tabs pattern: six choices, one panel. I suggest `role="tablist"` on the circle, `role="tab"` with `aria-selected` and `aria-controls` on each segment, `role="tabpanel"` on the card, with arrow keys moving round the circle and Home and End going to the first and last. Give me the options (tabs, or plain buttons with `aria-pressed`) with trade-offs before building.
- Making the whole segment clickable: one way is an HTML button per segment, shaped with CSS `clip-path` to match the segment polygon. Another is SVG elements with roles. Recommend one.
- **Without JavaScript**, show the six pillars as a simple list of cards (photo, name, sentence, links). JavaScript then turns that list into the circle. This also helps search engines and screen readers.
- The circle's shapes, trail and connector are decorative. The labels are the accessible names.
- Contrast of labels on their segments (calculated): navy `#0f1b2b` on yellow 10.7:1, on sand 8.9:1, on sage 4.5:1 (only just passes, check in the browser); white on teal 8.9:1, on terracotta 4.8:1, on navy 12.5:1.
- Test at 1440, 1280, 1024, 768, 390 and 320 wide, keyboard only, at 200% zoom, with a screen reader if possible, and with reduced motion on.

## Decisions still open (bring me options)

1. **Sanity shape**, including how links point at pages that don't exist yet.
2. **Tabs or buttons**, and how to make the whole segment clickable.
3. **Which pillar is open on page load** (the first, Promotion & Awareness, or none with a prompt in the card).
4. **Connector route** for segments on the far side of the circle.
5. **Order round the circle**, and the "&" and full stops in OAD's wording: Ram and Joy to confirm.
6. **Photos**: which ones, credits, and consent.
