# Footer

The approved design for the footer, which appears at the bottom of every page, and the Sanity content it needs. Files beside this one:

- `footer-desktop-1440.png`: desktop at 1440 wide
- `footer-phone-390.png`: phone at 390 wide, with the Resources section open

On the homepage the footer comes straight after "news and updates" (the "get involved" section will go between them later).

Measurements are from the mock-ups. They are a target, not a pixel contract: build it fluid and check it at every width.

## The idea

A navy footer in OAD's brand navy, so it reads as a step down from the darker page above. Contact details first, then the site's sections as columns, then a sand link home to the main OAD site, a light band of partner logos, and the copyright line.

From top to bottom:

1. Contact: "Contact us", the email address, four social icons. On desktop the site's link columns sit beside it.
2. A thin line, then the link home: "Part of the IAU Office of Astronomy for Development ↗".
3. The partners band: "Our partners" and three logos on a light grey band, full width.
4. The copyright line: "Copyright 2026 © IAU-OAD" and a Privacy link.

There is no "Back to top" link and no separate "Visit astro4dev.org" button (both removed on purpose).

## Content

| Item | Text | From |
|---|---|---|
| Contact heading | Contact us | Fixed in the template |
| Email | info@astro4dev.org | Sanity `siteSettings` |
| Social links | Facebook, Instagram, TikTok, YouTube, in that order | Sanity `siteSettings` |
| Site links | See "Site links" below | Fixed in code, shared with the header |
| Link home | Part of the IAU Office of Astronomy for Development, to https://astro4dev.org | Sanity `siteSettings` |
| Partners heading | Our partners | Fixed in the template |
| Partner logos | Department of Science, Technology and Innovation; International Astronomical Union; National Research Foundation and South African Radio Astronomy Observatory | Sanity `siteSettings` |
| Copyright | Copyright {year} © IAU-OAD. The year comes from the build date | Build script |
| Privacy | Privacy | Fixed in the template |

The site plan says contact details, social links and partner logos must be editable by Ram and Joy. Navigation and layout stay fixed in code.

## Site links

These are the pages that will exist, so only these are linked. The section names are links to their main pages.

| Section | Pages under it |
|---|---|
| Resources | Practical guidelines, Online course, Community |
| Projects and impact | Impact, Interactive map, Project directory, Theory of Change, Global Survey Report |
| Get Funding | (none, the heading is the only link) |
| News | (none, the heading is the only link) |

Keep this list in one place in the code (for example a small `navigation.js` data file) that the header and footer both read, so a page added later only has to be added once. Most of these pages don't exist yet, so the links will 404 for now. That's fine locally. Tell me before anything with broken links deploys to the live address.

## Sanity: the `siteSettings` type

Agree the schema with me before writing it. This is a starting point to discuss, not a decision. CLAUDE.md already lists "site settings (contact details, social links)" as a planned type.

A single document (only one `siteSettings` can exist, like the `hero`).

| Field | Type | Required | Notes for the editor |
|---|---|---|---|
| `contactEmail` | string, checked as an email address | yes | The public contact address shown in the footer. |
| `socialLinks` | list of { `platform`: one of Facebook, Instagram, TikTok, YouTube, LinkedIn, X; `url`: URL } | no | Drag to reorder. The icon is chosen from the platform in code, so editors can't break the icons. LinkedIn and X are in the list so they can be added back later without a code change. |
| `homeLinkLabel` | string | yes | Default "Part of the IAU Office of Astronomy for Development". |
| `homeLinkUrl` | URL | yes | Default https://astro4dev.org. |
| `partners` | list of { `name`: string, `logo`: image with required `alt`, `url`: URL (optional) } | no | Drag to reorder. Use the official logo files only, never redrawn or recoloured. |

Things to settle with me:

1. Do partner logos link to the partners' websites? In the mock-up they don't. If they do, each needs a visible focus outline in navy (white won't show on the light band).
2. Should the header's "Part of OAD" link read from the same `homeLinkLabel`? Right now the header says "Part of the Office of Astronomy for Development" (without "IAU") and the footer says "Part of the IAU Office of Astronomy for Development". I'm deciding which wording to use.

## How it reaches the page

- The footer is on every page, so make it one shared template (a partial) that `build/build.js` inserts into each page, not a copy in every HTML file. Bring me the options for how to do the insert before writing it, because the header will use the same approach.
- `build/build.js` fetches `siteSettings` at build time (public dataset, no token), like the other sections.
- Escape every value from Sanity before it goes into the HTML. Only allow `https:` and `mailto:` links from Sanity.
- **If `siteSettings` is missing or empty**, the build must still succeed: leave out the parts with no content (no social row, no partners band) rather than showing empty boxes.
- Check that the Sanity webhook rebuilds the site when `siteSettings` is published.
- **Partner logos** are Sanity images. Use whatever we decided for the pillar and news images (Sanity's CDN or self-hosted). Ask for PNG (they need transparency), at twice the display height: about 104px tall for desktop.
- The copyright year is the year of the build. That's fine because the site rebuilds whenever anything is published.

## Desktop (reference 1440 wide)

| Element | Value |
|---|---|
| Footer | background brand navy `#1e3551`, padding 72px top, 64px left and right |
| Top row | a grid of five columns, 1.6fr then four of 1fr, 40px apart |
| "Contact us" | Barlow 600, 24px, line-height 1.2, white. It is an `<h2>` |
| Email | Barlow 400, 18px, yellow `#f9c434`, underlined (offset 4px), 14px under the heading |
| Social icons | 20px under the email. Circles 44 by 44px, 10px apart, 1px border in white at 45% (3.8:1, needed for 3:1 on UI parts), white icon about 17px tall |
| Column heading | Barlow 600, 17px, white, a link. 16px above its list (0 if the column has no list) |
| Column links | Barlow 400, 15px, line-height 1.35, white at 80% (8.6:1), 11px apart, no underline |
| Line | 56px under the top row: 1px, white at 18%, full width of the content |
| Link home | 32px padding above and below. Barlow 600, 14px, uppercase, letter-spacing 0.14em, sand `#d9b487` (6.4:1), no underline, then the ↗ arrow |
| Partners band | full width of the window (outside the 64px padding), background `#f2f3f5`, padding 30px 64px. "Our partners" on the left in Space Grotesk 600, 22px, `#0f1b2b` (15.6:1). Logos on the right, 52px tall, 72px apart, vertically centred |
| Copyright line | padding 24px top, 32px bottom. Barlow 14px, white at 78% (8.3:1). Copyright on the left, Privacy on the right (underlined, offset 3px) |

## Phone (reference 390 wide)

- Footer padding 44px top, 24px left and right.
- "Contact us" 22px, then the email (18px) and the four icons in one row, as on desktop.
- **The site links fold open** (an accordion), 32px under the icons:
  - Each section is a row 1px apart from the next (lines in white at 18%), 16px padding top and bottom, title in Barlow 600, 17px, white, with a sign on the right.
  - **Sections with pages under them** (Resources, Projects and impact): the row is a button that opens and closes the list. A "+" when closed, a "−" when open. The list starts with an overview link to the section's main page ("Resources overview", "Projects and impact overview"), because tapping the title now opens the list rather than going to the page. Then the pages, Barlow 16px, white at 80%, 12px apart, 18px under the list.
  - **Sections without pages under them** (Get Funding, News): the row is a plain link with a → on the right.
  - All closed when the page loads. More than one can be open at once.
- The link home, 36px under the last line, 12px, line-height 1.6 (it wraps to two lines), then 32px of space.
- The partners band full width (outside the 24px padding), padding 30px 24px. "Our partners" 20px, 20px above the logos. Logos 34px tall, wrapping, 22px apart vertically and 28px across.
- The copyright line stacked: copyright, then Privacy below it, 12px apart.

## How the fold-open sections work

New concept for me, so please explain the code as you write it.

- Each section title is a real `<button>` inside an `<h2>`, with `aria-expanded="false"` or `"true"` and `aria-controls` pointing at the list's `id`. Toggle `hidden` on the list and swap the + and − (the signs are `aria-hidden="true"`, the button's state is what screen readers hear).
- **Without JavaScript, everything is visible.** Write the HTML with every list showing, and let the JavaScript close them when it starts. Then nobody gets stuck with links they can't open.
- **Above the breakpoint**, the same HTML shows as columns: the buttons behave as plain headings (or swap to the heading link), all lists are visible and the overview links are hidden. Bring me options for the breakpoint and for how to switch between the two (CSS only, or CSS plus a check in JavaScript).
- With reduced motion on, no opening animation. If you add one, keep it short and only on `prefers-reduced-motion: no-preference`.

## The social icons

- The icons are the free brand icons from Font Awesome (version 6.5.2, package `@fortawesome/free-brands-svg-icons`): `facebook-f`, `instagram`, `tiktok`, `youtube` (and `linkedin-in`, `x-twitter` if those return). Copy the SVG paths into the code. Don't load Font Awesome's CSS, JavaScript or CDN: that would be a third-party request on every page.
- Font Awesome's free icons are licensed CC BY 4.0, so add an entry to `credits.md`.
- Each icon link gets an accessible name, for example `aria-label="OAD on Instagram"`, and the SVG gets `aria-hidden="true"`.
- **The social URLs have not been checked.** Take them from the current astro4dev.org footer and show them to me before they go into Sanity. Don't guess any handle.
- Hover and focus: border and icon turn yellow.

## Links and states

- All footer links turn yellow `#f9c434` on hover (7.7:1 on brand navy).
- The link home also gets an underline on hover and focus, so the change isn't shown by colour alone.
- Keyboard focus: 3px white outline, offset 3px. On the light partners band, use navy `#1e3551` instead (11.2:1).
- The link home goes to another site, so it ends with ↗ (the arrow is `aria-hidden="true"`). It opens in the same tab.

## Accessibility

- A `<footer>` landmark. The contact block, each link group (`<nav aria-label="Footer, Resources">` or one `<nav aria-label="Footer">` with the groups inside, tell me which you'd pick and why), and the partners `<section aria-labelledby>`.
- Partner logos: `alt` is the organisation's full name (from Sanity's required alt field).
- Check the tab order runs top to bottom: email, icons, sections, link home, (partner links if any), Privacy.
- Test at 1440, 1280, 1024, 768, 390 and 320 wide, keyboard only, at 200% zoom, with JavaScript off, and with reduced motion on.

## Before this counts as done

- [ ] Desktop and 390px match the screenshots
- [ ] Fold-open works with mouse, touch and keyboard (Enter and Space), and screen readers announce "expanded" and "collapsed"
- [ ] With JavaScript off, every link is visible
- [ ] Missing `siteSettings` doesn't break the build
- [ ] No sideways scroll at 320px
- [ ] `credits.md` has Font Awesome and the source of each partner logo
- [ ] Nothing loads from a third-party server

## Decisions still open (bring me options)

1. The `siteSettings` schema above.
2. How the shared footer gets inserted into every page (same approach as the header).
3. The breakpoint between columns and fold-open, and how the switch works.
4. Whether partner logos link to the partners.
5. The Privacy page. It doesn't exist yet. Until it does, either leave the link out or let it 404 locally. Ram and Joy need to agree what it says.

## Still to check with Ram and Joy (not for you to decide)

- The partner logo says NRF and SARAO (South African Radio Astronomy Observatory). The current OAD footer may show SAAO (South African Astronomical Observatory) instead. Confirm which is right before it goes live.
- The social media URLs, and whether `info@astro4dev.org` is the address they want public.
