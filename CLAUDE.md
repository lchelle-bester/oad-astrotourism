# OAD Astrotourism site

The astrotourism subdomain of the IAU Office of Astronomy for Development (OAD): https://astrotourism.astro4dev.org.
It is a proof of concept for rebuilding the main OAD site (https://astro4dev.org), so everything is built as a reusable template.
The full plan is the "Astrotourism Site Plan" Google Doc (shared with Ram and Joy, who are commenting on it). Brand rules come from `Corporate_Identity_2021.pdf`.

## About me and how to work with me

- I'm L'chelle, an engineering student. I know C and Java and I'm new to web development. I'm doing this unpaid, alongside exams (finished mid-November).
- **Teach me as we go.** Explain what you change and why, in plain language. Introduce new concepts one at a time.
- **I make the design decisions.** When there is a real choice, give me 2 or 3 options with trade-offs and let me choose. Never decide for me and then present it as done.
- **Verify before you state.** Check claims against the live site, the real documents or the actual file before saying them as fact. If you haven't checked, say so. Never invent figures, links, quotes or project details.
- **Work in small steps.** One section or fix at a time. Don't rewrite files wholesale.
- **Respect my edits.** I edit files myself. Always read the current file before changing it.
- **Debug by elimination.** Confirm the cause before fixing, and change one thing at a time.
- After each change, tell me what to check in the browser and suggest a commit message. Check what is really in a commit (`git show`) rather than trusting the message.
- Writing style: no em dashes (or en dashes), and nothing that reads as AI-written. This applies to the site copy, comments in code, commit messages and anything I might send to Ram or Joy.
- I'm on Windows, using VS Code, PowerShell, Live Server and Git.

## CURRENT

- **Ram (Ramasamy Venugopal) and Joy (Joyful Mdhluli)** run OAD's comms and website. They are the content owners and sign off on structure, design and what content stays.
- Current OAD site: self-hosted WordPress, updated by hand by Ram and Joy. Domain from Network Solutions, DNS/hosting through IntelyHost.

## Tech setup

**Stack: plain HTML, CSS and JavaScript.** No front-end framework. A small Node script for build tasks is allowed if it is needed to pull content from Sanity (see below), but I must agree to it first and have it explained. What is already decided:

- A custom-built static site, not WordPress. No plugins, no database on the public server.
- **Sanity is a hard requirement.** It is the CMS, so Ram and Joy can edit content without touching code. Every piece of content that OAD staff may need to change must live in Sanity, never be hard-coded into the HTML. Reviews before publishing by the other person are wanted. I have never used sanity before.
- **MapLibre GL JS** with **OpenFreeMap** tiles for the map (open source, no account, no API key, no usage cap). Do not use Mapbox or Google Maps.
- Hosting and deploy: Netlify via GitHub is the expected route. Confirm with OAD how the subdomain will point to it.

### Sanity rules

- **Account timing.** Create the Sanity account and project in Phase 0, before any hero code is written, so that the hero's text and image are designed as Sanity fields from the start instead of being hard-coded and moved later. Creating a project needs a free account (I'll sign up myself, with my own login, and then invite Ram and Joy as editors).
- **Free plan limits** : 20 seats, 2 datasets (public only), 250k API requests a month, 1 million CDN requests a month, 100 GB asset storage, 100 GB bandwidth a month, and no way to buy extra on Free.
- **Public dataset.** Because free datasets are public, treat everything in Sanity as readable by anyone. Never store private data there (for example personal details of survey respondents).
- **Content model first.** Before building a section, agree its Sanity schema with me (which fields, which are required, what the editor sees). Typical types: hero, project or initiative (with location, country, year, category), resource card (with who it is for), news post, impact figure, case study, partner logo, site settings (contact details, social links).
- **Digital assets.** Everything an editor may swap goes through Sanity: photos, resource downloads (PDFs), partner logos. Use the Sanity image type with a **required alt text field**, and load images through Sanity's image CDN URLs with width and format parameters so pages stay light. Fixed brand and design files live in the repo instead: the OAD logo files, decorative SVG motifs and icons. The hero video location is an open decision (see below).
- **Never commit secrets.** Sanity project ID and dataset name are not secret. API tokens are. Tokens go in a `.env` file that `.gitignore` excludes. Read-only public content needs no token.
- **How content reaches the page** is an open decision (see below). Whatever is chosen must still pass the performance and accessibility rules, so content can't depend on slow client-side loading with no fallback.

### Repo and GitHub

- Code lives in a GitHub repository, with Netlify deploying from it. Keep `.gitignore` for `node_modules`, `.env`, and the full-size originals folder.
- Public repo

Keep `credits.md` listing the source and licence of every image, video and font. Full-size originals live outside the site folder and out of git. Resize photos to about 1200px wide and under 250 KB before use.

## Design brief

**Brand palette** (from the 2021 Corporate Identity document, hex values checked against the PDF). Define all of them as CSS variables in `:root`. Contrast ratios were calculated, not guessed.

| Colour | Hex | Contrast | Role |
|---|---|---|---|
| Deep navy | `#1e3551` | white on it 12.5:1 | Primary dark background |
| Sand | `#d9b487` | 6.4:1 on navy | Accent, OK as text on navy |
| Yellow | `#f9c434` | 7.7:1 on navy | Accent, buttons, key figures |
| Terracotta | `#af5a4c` | white on it 4.8:1 | Blocks and panels. As text on navy only 2.6:1, so never |
| Sage | `#72896b` | white on it **3.8:1** | Large text and graphics only. Fails AA for normal text |
| Deep teal | `#1a524b` | white on it 8.9:1 | Blocks and panels. As text on navy only 1.4:1, so never |

- The identity document allows screening each colour to 75%, 50% and 25% for tints, backgrounds and dividers.
- Navy text on sand is 6.4:1 and on yellow 7.7:1, so those work for buttons.
- The site plan says white text on terracotta, sage and teal blocks. Sage fails for normal text, so that needs a decision (see Open decisions).
- Re-check contrast whenever a new colour pairing is introduced. Minimum 4.5:1 for normal text, 3:1 for large text and UI components.

**Look and feel.** Same sky-and-awe spirit as the concept homepage (spacex.com style simplicity, charity: water's real people), with night-sky video in the hero. Restraint: one idea per screen, minimal text, lots of space. Motion only when it helps tell the story. At most one video.

**Brand constraints**
- The OAD logo is never changed, recoloured or redrawn. Official files only.
- Show the "Part of the IAU Office of Astronomy for Development" link home in three places: the header, the About section and the footer. All link to astro4dev.org.
- Same typefaces and logo treatment as the main OAD site. Astrotourism takes its own emphasis from within the official palette.

## Structure (from the site plan, subject to Ram and Joy's sign-off)

Organised by audience, not department. Nothing important more than two clicks deep.

- **Audiences:** A) people starting an initiative, B) the tourism industry, C) funders, policymakers and partners.
- **Sections:** Home, Resources, Projects and impact, Get Funding, About.
- **Homepage order:** hero, the case (statistics), the six pillars as clickable cards, three paths (one per audience), proof, news and updates, get involved, footer.
- **Interactive pieces:** map of funded projects and surveyed initiatives, searchable and filterable project directory (country, category, year), resource chooser, clickable pillars.
- **Removed:** the Team page (one OAD-wide team page instead, Joy's details go on the contact page).
- **Theory of Change:** rebuilt as a real page, with the diagram downloadable and a text equivalent.

## Content and data rules

- The site holds only relevant, current content. It is not a Drive for everything OAD has ever done. When in doubt, ask Ram and Joy whether something stays.
- Every project and initiative is structured data with a location, stored in Sanity, so the map, directory and any later ideas all read from one source.
- Statistics must trace to a source. The plan's figures (ecotourism market $172.4bn in 2022 and $374.2bn by 2028, 8 in 10 people affected by light pollution, EUR 111,000 across 14 countries, five case studies, seven guidelines) Record each ones source.
- `Astrotourism Funded Projects 1.xlsx` is the funded-projects data, but each row is a single comma-separated text cell, some text has encoding damage (for example `√Ç`), and the link column contains raw HTML. It has to be cleaned and parsed before it goes into Sanity. Never import it as is.
- Project copy from OAD's existing site is their writing. Don't paraphrase it in ways that change meaning. Flag edits for them to approve.

## Accessibility, performance, privacy

- Standard: **WCAG 2.2 Level AA**, built into the markup. No accessibility overlay widget.
- Semantic HTML (real headings, lists, buttons, landmarks). Full keyboard use with a visible focus indicator. Skip-to-content link. Works at 200% zoom.
- Alt text on every meaningful image, decorative images marked so screen readers skip them. Text rather than pictures of text.
- Respect `prefers-reduced-motion`. Forms have proper labels and announce errors, not only with colour.
- Performance is an accessibility issue: much of the audience is on slow or expensive mobile data. Compress images, keep page weight and scripts minimal, test on a throttled connection. Set a page-weight budget once the stack is chosen.
- Test every change at desktop width and 390px (phone).
- Privacy (GDPR and POPIA): no reCAPTCHA. Use a honeypot field plus rate limiting for forms. Keep third-party scripts to a minimum and say what each one is before adding it.

## Open decisions (mine to make, bring options when we reach them)

1. **How Sanity content reaches the pages.** Plain JS can do it two ways. (a) The browser fetches content from Sanity when the page loads: simplest to learn and edits show immediately, but content appears after the JS runs, search engines and slow phones see less, and each visit uses Sanity API requests. (b) A small Node script pulls the content when the site is built and writes it into static HTML, and a Sanity webhook asks Netlify to rebuild when someone publishes: fastest for visitors and best for accessibility and search, but it adds a build step and an edit takes a minute or two to go live. A mix is possible (for example build-time for text, client-side for the filterable directory). Bring me the options with a worked example when we reach the first Sanity-driven section.
2. **Hero video location.** In the repo and served by Netlify (not editable by OAD, no Sanity bandwidth used) vs uploaded as a Sanity file asset (OAD can swap it, but it counts against the 100 GB monthly bandwidth).

## Build phases

**One phase at a time.** Finish, review and commit a phase before starting the next. Don't start building ahead, and don't touch sections that belong to a later phase. At the start of each phase: state what it includes, what Sanity content it needs, and what decisions I need to make. At the end: a checklist of what to test (desktop, 390px, keyboard, reduced motion, contrast) before it counts as done.

- **Phase 0, setup.** Git repo on GitHub, folder structure, `.gitignore`, `credits.md`, design tokens (colours and fonts) in CSS, Sanity account and project, Netlify connected.
- **Phase 1, hero.** Header with the three "Part of OAD" link home, night-sky video, headline and subheading, buttons. Hero text and image as Sanity fields.
- **Phase 2 onwards.** Order to be agreed with me one phase at a time, following the homepage order in the structure above (the case, the six pillars, three paths, proof, news, get involved, footer), then the inner pages.

## Current state

Nothing built yet for the subdomain The connected project folder is empty. Phase 0 has not started.

## Decisions log

Add an entry (with the date) whenever I make a decision, including the reason. Move items out of Open decisions when they are settled.

- Subdomain first as a test bed, rather than the whole 35 GB main site.
- Custom static site over WordPress.
- Sanity as the CMS.
- MapLibre GL JS with OpenFreeMap over Mapbox.
- Team page removed.
- Plain HTML, CSS and JavaScript, no framework (10 Oct 2026).
- No "Further Reading" section. Ram asked for one for the extra resources, but we have decided to declutter, so only genuinely useful resources stay (10 Oct 2026).
- Sanity is mandatory, and the Sanity account and project are set up in Phase 0, before the hero (10 Oct 2026).
- Build one phase at a time, starting with the hero (10 Oct 2026).

## Known gotchas (carried over from the concept build)

- Removing HTML that JS depends on breaks the JS silently. Check the browser Console (F12), and clean up the JS when you remove an element.
- `overflow: hidden` on any ancestor silently stops `position: sticky` working.
- A solid `background-color` on a section hides a shared background behind it.
- Chrome effects that blur or blend over playing video (such as `backdrop-filter`) can cause jitter on Windows.
- Headless browsers may not play H.264, so test video in real Chrome. Headless Chrome can't go narrower than about 504px, so test 390px inside a 390px `<iframe>`.
- `vector-effect` is not inherited in SVG, so put it on each `<path>`.
- To find what makes a page too wide, compare `document.documentElement.scrollWidth` with `clientWidth`, then look for elements whose `getBoundingClientRect().right` exceeds the window.

## Keeping this file current

At the end of a working session, offer to update Current state, Decisions log and Open decisions. Show me the change before you write it, so the file stays accurate and mine.