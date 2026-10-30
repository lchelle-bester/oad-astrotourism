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
- **Check the site plan, not just the live site.** When deciding what to link to or build, evaluate against the site plan's structure (the pages that will exist), not only the pages on the current live site.
- **Debug by elimination.** Confirm the cause before fixing, and change one thing at a time.
- After each change, tell me what to check in the browser and suggest a commit message. Check what is really in a commit (`git show`) rather than trusting the message.
- Writing style: no em dashes (or en dashes), and nothing that reads as AI-written. This applies to the site copy, comments in code, commit messages and anything I might send to Ram or Joy.
- I'm on Windows, using VS Code, PowerShell, Live Server and Git.

## People and timeline

- **Ram (Ramasamy Venugopal) and Joy (Joyful Mdhluli)** run OAD's comms and website. They are the content owners and sign off on structure, design and what content stays. Joy is the astrotourism contact. Their comments on the site plan doc are the record of what they have agreed.
- The sitemap was signed off by Ram and Joy (about 17 Oct 2026). There is no mood board. Nothing structural gets built that they haven't seen.
- Exams end mid-November. Target: finished by the end of the year, live by January.
- OAD's office is closed about 21 December to 4 January, so anything needing their input or review must be done before then.
- OAD's big event is 15 February at NEX.
- Current OAD site: self-hosted WordPress, updated by hand by Ram and Joy. Domain from Network Solutions, DNS/hosting through IntelyHost.

## Tech setup

**Stack: plain HTML, CSS and JavaScript.** No front-end framework. A small Node script pulls content from Sanity at build time (agreed 12 Oct 2026, see Sanity rules). What is already decided:

- A custom-built static site, not WordPress. No plugins, no database on the public server.
- **Sanity is a hard requirement.** It is the CMS, so Ram and Joy can edit content without touching code. Every piece of content that OAD staff may need to change must live in Sanity, never be hard-coded into the HTML. Reviews before publishing by the other person are wanted.
- **MapLibre GL JS** with **OpenFreeMap** tiles for the map (open source, no account, no API key, no usage cap). Do not use Mapbox or Google Maps.
- The concept homepage (plain HTML/CSS/JS, deployed on Netlify at oad-iau.netlify.app, code on GitHub) is the starting point for look and feel.
- Hosting and deploy: Netlify via GitHub. Netlify runs the build script and publishes `dist/`. Pin the Node version in `netlify.toml`. Confirm with OAD how the subdomain will point to it.

### Sanity rules

- **Account timing.** Create the Sanity account and project in Phase 0, before any hero code is written, so that the hero's text and image are designed as Sanity fields from the start instead of being hard-coded and moved later. Creating a project needs a free account (I'll sign up myself, with my own login, and then invite Ram and Joy as editors). Node.js must be installed on my machine for the Sanity tooling, so check with `node -v` first.
- **Free plan limits** (read from sanity.io/pricing on 10 Oct 2026, recheck before relying on them): 20 seats, 2 datasets (public only), 250k API requests a month, 1 million CDN requests a month, 100 GB asset storage, 100 GB bandwidth a month, and no way to buy extra on Free.
- **Public dataset.** Because free datasets are public, treat everything in Sanity as readable by anyone. Never store private data there (for example personal details of survey respondents).
- **Content model first.** Before building a section, agree its Sanity schema with me (which fields, which are required, what the editor sees). Typical types: hero, project or initiative (with location, country, year, category), resource card (with who it is for), news post, impact figure, case study, partner logo, site settings (contact details, social links).
- **Digital assets.** Everything an editor may swap goes through Sanity: photos, resource downloads (PDFs), partner logos. Use the Sanity image type with a **required alt text field**, and load images through Sanity's image CDN URLs with width and format parameters so pages stay light. Fixed brand and design files live in the repo instead: the OAD logo files, decorative SVG motifs and icons. The hero video lives in the repo (decided, see decisions log), not in Sanity.
- **Never commit secrets.** Sanity project ID and dataset name are not secret. API tokens are. Tokens go in a `.env` file that `.gitignore` excludes. Read-only public content needs no token.
- **How content reaches the page: at build time (decided 12 Oct 2026).** `build/build.js` fetches published content from Sanity's query API (public dataset, no token) and writes it into the HTML before anyone visits. When an editor publishes, a Sanity webhook POSTs to a Netlify build hook, which rebuilds and redeploys. Free Sanity plan allows 2 webhooks, so use at most one for this. Chosen for speed, search and screen readers, and because the hero must never be blank on a slow connection.
- **Escape everything** that comes from Sanity before it goes into HTML, even though editors are trusted.
- **Browser loading is only for interactive parts** (map, filterable directory), where JavaScript is needed anyway. Add the site's addresses to Sanity's CORS origins when that starts.
- **Review gate.** The plan wants a second person to review before updates go live. Build-time deploys give a place to add that gate. What Sanity's free plan offers for review workflows has not been checked.
- **Images from Sanity.** Downloaded at build time and served from this site, not linked to Sanity's image CDN (decided 27 Oct 2026, first used for the pillar photos).

### Repo and GitHub

- Code lives in a GitHub repository, with Netlify deploying from it. Keep `.gitignore` for `node_modules`, `.env`, `dist/` and the full-size originals folder.
- Commit small, one change per commit, with a message that says what changed and why.
- The repo is public, so nothing secret is ever committed, not even briefly.
- Netlify free plan: 300 credits a month, 15 per production deploy (every push to main), hard limit that pauses all sites when used up (checked in Netlify's docs, 24 Oct 2026). Commit freely, preview locally, and push to main as rarely as possible: only when the live site needs updating. Never push without me asking.

### Folder structure

The website and the Sanity Studio are kept apart. `site/` is the source we edit. The build script turns it into `dist/`, and Netlify publishes only `dist/` (set in `netlify.toml`), so the Studio is never part of the public site.

```
oad-astrotourism/
├── CLAUDE.md
├── .gitignore
├── netlify.toml          build command runs build/build.js, publish = "dist", Node version pinned
├── credits.md            source and licence of every image, video and font
├── build/
│   └── build.js          fetches content from Sanity, fills the templates, copies site/ to dist/
├── studio/               Sanity Studio (JavaScript)
├── site/                 source for the public website (templates with placeholders)
│   ├── index.html
│   ├── 404.html          shown by Netlify at any address with no page
│   ├── partials/         shared pieces inserted with {{> name}}, e.g. header.html (not copied to dist/)
│   ├── css/styles.css    design tokens at the top, sections numbered in comments
│   ├── js/main.js
│   └── assets/           images/, video/, fonts/ (fixed brand files, hero video and poster)
└── dist/                 generated by the build, never edited, git-ignored
```

To preview locally: run `node build/build.js`, then start Live Server ("Go Live"). `.vscode/settings.json` makes Live Server serve `dist/` as the site root, so paths starting with `/` work. All paths in pages start with `/` so they work at any address. Live Server does not show `404.html` for missing addresses; Netlify does.

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

**Typography.** Headings in Space Grotesk 600, body in Barlow 400 and 600. Both are open-licence (SIL OFL) and self-hosted in `site/assets/fonts/`, so visitors' browsers never contact Google. Only load weights that are used. The brand font, DIN 2014, is available to OAD through its Adobe Fonts kit, but we are not using it for now (see decisions log). The live OAD sites actually render headings in Lato, checked in the browser on 11 Oct 2026.

**Look and feel.** Same sky-and-awe spirit as the concept homepage (spacex.com style simplicity, charity: water's real people), with night-sky video in the hero. Restraint: one idea per screen, minimal text, lots of space. Motion only when it helps tell the story. At most one video.

**Relationship to the main OAD site.** This site should feel like an extension of the main OAD site, but visitors must be able to tell it is a different site and not get confused between the two. Until the main site is rebuilt, the concept homepage (oad-iau.netlify.app) is the reference. Share the skeleton: Space Grotesk headings, left-aligned hero, sky video, the same header and card patterns, restraint and space. Distinguish through three things, all agreed on 12 Oct 2026: the astrotourism palette, the imagery (a different video clip, which I am sourcing), and an "Astrotourism" name beside the OAD logo.

**Brand constraints**
- The OAD logo is never changed, recoloured or redrawn. Official files only.
- Show the "Part of the IAU Office of Astronomy for Development" link home in the header and the footer, both linking to astro4dev.org. (The plan's third place, the About section, no longer exists.)
- Logo source files are in the Google Drive folder "OAD Logo" (inside the astro-tourism photos drive). They are PNG and JPG only, no SVG. Use the official files unaltered, and confirm which one has light text for dark backgrounds before using it. The "04_OAD_full_transparent" file also contains partner logos (DSI, NRF, SAAO), so it suits a footer partner band, not the header.
- Same typefaces and logo treatment as the main OAD site. Astrotourism takes its own emphasis from within the official palette.

## Structure (from the signed-off site plan, see docs/)

A PDF copy of the site plan is kept in `docs/` but not committed, because it contains Ram's and Joy's email addresses and the repo is public.

Organised by audience, not department. Nothing important more than two clicks deep.

- **Audiences:** A) people starting an initiative, B) the tourism industry, C) funders, policymakers and partners.
- **Sections:** Home, Resources, Projects and impact, Get Funding, News. There is no About page (removed 29 Oct 2026, see decisions log).
- **Homepage order:** hero, the case (statistics), the six pillars as clickable cards, proof, news and updates, get involved, footer. "Three paths" was cut on 29 Oct 2026 (see decisions log).
- **Interactive pieces:** map of funded projects and surveyed initiatives, searchable and filterable project directory (country, category, year), resource chooser, clickable pillars.
- **Removed:** the Team page (one OAD-wide team page instead, Joy's details go on the contact page).
- **Theory of Change:** rebuilt as a real page, with the diagram downloadable and a text equivalent.

## Content and data rules

- The site holds only relevant, current content. It is not a Drive for everything OAD has ever done. When in doubt, ask Ram and Joy whether something stays.
- Every project and initiative is structured data with a location, stored in Sanity, so the map, directory and any later ideas all read from one source.
- Statistics must trace to a source. Checked so far (see decisions log): 8 in 10 under light-polluted skies (Falchi et al. 2016), 62% of travellers considering darker sky destinations (Booking.com, 2024), $2.2bn astro tourism market in 2025 (Growth Market Reports, a commercial estimate; Joy to see before launch). Proof headline figure: shown as "€111,000+ across 17 countries" (L'chelle's choice, 29 Oct 2026), which no single source says: OAD's Impact page (copied 28 Oct 2026) says around €111,000 across 14 countries, Joy's June 2026 paper says over €100,000 across 17 countries. Joy to confirm once the homepage is built. Still to verify: five case studies, seven guidelines. Check each one before it goes on a page and record the source.
- `Astrotourism Funded Projects 1.xlsx` is the funded-projects data, but each row is a single comma-separated text cell, some text has encoding damage (for example `√Ç`), and the link column contains raw HTML. It has to be cleaned and parsed before it goes into Sanity. Never import it as is.
- Project copy from OAD's existing site is their writing. Don't paraphrase it in ways that change meaning. Text does not need approval before it is written into the site: flag what changed and Ram and Joy review it afterwards (decided 12 Oct 2026).
- Consent: get OAD's confirmation before using named people or photos.

## Accessibility, performance, privacy

- Standard: **WCAG 2.2 Level AA**, built into the markup. No accessibility overlay widget. One known exception: the hero video has no pause control (see decisions log).
- Semantic HTML (real headings, lists, buttons, landmarks). Full keyboard use with a visible focus indicator. Skip-to-content link. Works at 200% zoom.
- Alt text on every meaningful image, decorative images marked so screen readers skip them. Text rather than pictures of text.
- Respect `prefers-reduced-motion`. Forms have proper labels and announce errors, not only with colour.
- Performance is an accessibility issue: much of the audience is on slow or expensive mobile data. Compress images, keep page weight and scripts minimal, test on a throttled connection. Set a page-weight budget once the stack is chosen.
- Test every change at desktop width and 390px (phone).
- Privacy (GDPR and POPIA): no reCAPTCHA. Use a honeypot field plus rate limiting for forms. Keep third-party scripts to a minimum and say what each one is before adding it.

## Open decisions (mine to make, bring options when we reach them)

1. **White text on sage.** Fails AA at normal size. Options: use large text only, darken sage, or put navy text on a light sage tint.
2. **Resource chooser.** Planned but needs Ram and Joy to say who each resource is for.
3. **Scope.** Whether to narrow the scope or take on the content restructure fully, now the job includes moving project data out of Drive folders and spreadsheets into Sanity.
4. **Order of the phases after the hero.** See Build phases.
5. **Hero button.** None for now. Add one once the rest of the site exists and we know what to link to, judged against the site plan structure. Note: the live fund page has no application route or deadline yet, so no "Apply" label until there is one.
6. **Rebuild cost of Sanity edits.** Each Sanity publish triggers a Netlify deploy (15 credits), so the free plan allows only about 20 deploys a month in total. Must be solved before Ram and Joy edit regularly: a paid Netlify plan, OAD paying, batching rebuilds, or another host (limits not yet checked). When the webhook is made, it must fire for every document type, including news posts (no type filter).
7. **Landscape phone layout.** Phones held sideways show only sky on the first screen. Left as is for now (24 Oct 2026); a compact desktop-style layout sized by height is the likely fix.

## Build phases

**One phase at a time.** Finish, review and commit a phase before starting the next. Don't start building ahead, and don't touch sections that belong to a later phase. At the start of each phase: state what it includes, what Sanity content it needs, and what decisions I need to make. At the end: a checklist of what to test (desktop, 390px, keyboard, reduced motion, contrast) before it counts as done.

- **Phase 0, setup.** Git repo on GitHub, folder structure, `.gitignore`, `credits.md`, design tokens (colours and fonts) in CSS, Sanity account and project, Netlify connected.
- **Phase 1, hero.** Header with the ‘Part of OAD’ link home, night-sky video, headline, subheading and affiliation line. No hero button for now.
- **Phase 2 onwards.** Order to be agreed with me one phase at a time, following the homepage order in the structure above (the case, the six pillars, proof, news, get involved, footer), then the inner pages.

## Current state

Phase 0 (setup) is complete. The placeholder page is live at https://astrotourism.netlify.app (checked in the browser on 11 Oct 2026: Space Grotesk and Barlow load, navy background, no sideways scroll). The Sanity Studio runs locally. 

Phase 1 (hero) is in progress. Done: the hero content type with the headline in two fields, build.js, netlify.toml, the hero HTML, the desktop layout (header from 1240px, hero from 720px wide and 512px tall), the hero video with brightened mountains and the mountain cut-out, the phone layout (header below 1240px, hero below 720px wide or 512px tall), the phone video file, the nav with desktop dropdowns and the phone menu, and the 404 page with the header as a shared partial (24 Oct 2026). Phase 1 checklist given and run by L'chelle on 24 Oct 2026; Phase 1 counts as done, apart from the Sanity webhook (waiting on open decision 6). Not pushed yet (to save Netlify credits); when it is, check the 404 page works on Netlify.

Phase 2 ("The case", design "Trail", spec in docs/case/case-design.md) is done: all six steps built and the phase-end checklist passed (26 Oct 2026). Not pushed yet. Before launch: Joy sees stat 3 (commercial estimate).

Phase 3 is the six pillars (design in docs/pillars/pillars-design.md), started 27 Oct 2026. Schema written and content entered 27 Oct. Built and tested 27 Oct in Chrome at 1440, 1248 and 390 (no errors, no sideways scroll); the last change (phone card fits the open pillar) is not yet screenshotted. build.js renders the cards and tabs, HTML in index.html, CSS section 8, JavaScript in main.js. Still open: decision 4 (connector route for the far side; built as "round the outside to the 60 or 120 degree point", L'chelle to confirm after seeing Publications open), decisions 5 and 6 for Ram and Joy.

Phase 4 is proof (design in docs/proof/proof-design.md), started 29 Oct 2026. Step a, the schema (studio/schemaTypes/impactFigure.js and impactSection.js), written and validated 29 Oct, content entered. Step b (build.js writes the section, index.html) and step c (teal band with the ridge, desktop layout, CSS section 9; ridge drawings in site/assets/images/proof/) done 29 Oct. Step d (phone layout, breakpoint 920px), step e (the button, with hover only on devices that hover) and step f (the count-up, main.js) done 29 Oct: all six steps built. Phase-end checklist given 29 Oct; Phase 4 counts as done (L'chelle, 29 Oct). Not pushed yet. Before launch: Joy confirms the headline figure, approves the 7 and 37 totals and says which project each result came from; Ram and Joy hear that three paths was cut.

Phase 5 is news and updates (design in docs/news/news-design.md), started 29 Oct 2026. The `post` schema is written and validated, three test posts entered. "About" in the nav is replaced by "News". build.js fetches the three newest published posts and downloads their photos (dist/assets/images/news/); the section is the partial site/partials/news.html, left out of the page when there are no posts (tested). CSS section 10, desktop and phone (version C) built and checked at 1440, 1024, 920, 768, 390 and 320 (no sideways scroll, no errors). The proof button is now the shared .pill-button. Open: the tablet layout (920 breakpoint provisional), card hover extras. The three test posts have no entry in credits.md yet. The card links go to /news/slug/, which 404 until the next phase: do not push before then.

Still to do in Phase 1: the Netlify build hook and the Sanity webhook (neither exists yet; see open decision 6 on rebuild cost).

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
- Project folder is `C:\dev\oad-astrotourism`, outside OneDrive, backed up through GitHub (10 Oct 2026).
- GitHub repo is public (10 Oct 2026).
- Folder structure B: website in `site/`, Sanity Studio in `studio/`, Netlify publishes only `site/` (11 Oct 2026).
- Fonts: Space Grotesk headings and Barlow body, self-hosted (11 Oct 2026). Chosen over Barlow only and over the concept pairing. DIN 2014 via OAD's Adobe Fonts kit is a possible later upgrade (needs Ram or Joy to allow our domain, and adds a third-party request). The fonts in the shared "Document fonts" Drive folder are not used: they look like commercial desktop fonts and the repo is public.
- Hero video lives in the repo and is served by Netlify, not uploaded to Sanity, because OAD is unlikely to want to change it (11 Oct 2026).
- Content reaches pages at build time: a Node script fetches from Sanity and a Sanity webhook triggers a Netlify rebuild. Browser loading only for the map and directory (12 Oct 2026). Chosen over browser-side loading for speed, search and screen readers, and so the hero is never blank on a slow connection.
- Hero poster image stays in the repo with the video, not in Sanity, so it always matches the video's first frame (12 Oct 2026).
- Hero headline: "Astrotourism for a better world." (12 Oct 2026).
- Hero subheading: "Using the night sky to bring economic growth and opportunities to communities." with a second line, the affiliation: "A Flagship Initiative of the IAU Office of Astronomy for Development" (12 Oct 2026). I chose to keep "Flagship Initiative" after weighing plainer alternatives ("A project of", "Part of"). Both lines stay editable in Sanity.
- No button in the hero for now; add one after the rest of the site is built (12 Oct 2026).
- Wording does not need approval before it is written: Ram and Joy review text afterwards (12 Oct 2026).
- "Astrotourism" name beside the OAD logo in the header, as one of three ways to distinguish the site from the main OAD site, with the palette and the imagery (12 Oct 2026).
- Design intent: an extension of the main OAD site that is still clearly a different site (12 Oct 2026).
- Studio written in JavaScript, not TypeScript (11 Oct 2026).
- Signing in to Sanity with my GitHub login (10 Oct 2026). Ram and Joy are invited as editors by email later.
- Hero video is a seamless crossfade loop, chosen over a plain loop (visible jump) and playing once then holding the last frame (18 Oct 2026).
- Hero video slowed to half speed with motion interpolation, after removing the duplicate frames in OAD's original clip, so the stars move smoothly (18 Oct 2026).
- Gentle sharpening on the hero video, chosen for crispness over smaller files. Strong sharpening was too much (18 Oct 2026).
- Four hero video files: WebM and MP4 at 1920 and 1280 wide, so phones get the lighter version and older browsers get MP4 (18 Oct 2026).
- Hero headline stored as two Sanity fields, the large word and the rest of the headline (24 Oct 2026). Chosen over one field split by build.js (a hidden rule editors can't see) and over hard-coding "Astrotourism". Two fields let the Studio check that the large word fits the layout.
- Sitemap signed off by Ram and Joy (about 17 Oct 2026). The site plan PDF is kept locally in docs/, not committed.
- Nav built in Phase 1 from the signed-off site plan (24 Oct 2026). Every dropdown item is its own page, at a folder-style address such as /resources/online-course/. Items with a dropdown are buttons that open it, not links. Addresses are provisional and may change as the pages are built.
- Until a page exists, its nav link goes to the final address and a custom 404.html catches it (24 Oct 2026). Chosen over placeholder pages so nothing throwaway goes live.
- Funding nav label stays "Get funding", as in the signed-off plan (24 Oct 2026). The funding page should say clearly when the next call opens.
- Hero affiliation line is plain text, not a link (24 Oct 2026). The header link to astro4dev.org sits just above it, so a second link would be a duplicate.
- Darker navy #0f1b2b used in the hero only, for the phone strip and ground, as a named token (24 Oct 2026). It matches the bottom of the video, but is outside the CI palette. Ram and Joy are not strict on brand colours. Colours for later sections, including where they meet the hero, are decided when those sections are built.
- Hero video credit: Astronomy for Livelihood Creation / IAU OAD, confirmed by Joy (Oct 2026).
- Desktop header from 1240px wide; narrower screens get the phone header with the menu button (24 Oct 2026). Chosen over a middle version with the OAD link in the top strip, and over shortening the link to "Part of OAD".
- Desktop hero only on screens at least 720px wide and 512px tall; shorter screens, such as a phone on its side, get the phone layout (24 Oct 2026). Chosen over shrinking the text by screen height.
- Hero video rebuilt from OAD's 4K original with the mountains brightened before the crossfade (24 Oct 2026). The original is kept in originals/, outside git. It was committed and pushed once by mistake; it is no longer tracked but stays in the repo history (chosen over rewriting history).
- Mountain cut-out saved as WebP (26 KB) instead of PNG (1.37 MB), with no visible difference (24 Oct 2026).
- No pause button on the hero video (24 Oct 2026). Chosen over a quiet pause control and over a video that stops within 5 seconds. This fails WCAG 2.2.2 (Pause, Stop, Hide, Level A); Ram and Joy should be told, since the site plan promises WCAG 2.2 AA. The video still does not play when reduced motion is on.
- Hero video speed and smoothness kept as they are (24 Oct 2026), after comparing one-third and one-quarter speed with crossfaded in-between frames. Those were smoother, but made the files 3 to 4 times bigger.
- Phone hero fits on one screen on short phones; the picture and spacing scale by height too, while the large word always fills the width (24 Oct 2026).
- On desktop, the word's height follows the ridge, so the peaks always cover 17.6% of the capital letters, as in the 1440 design (24 Oct 2026). Fixes the word sinking behind the mountains on portrait tablets.
- Phone video: a slice of the 4K original (26% to 85% across, 1356 x 1296) for screens up to 448px, chosen over keeping the 1280 file and over the 1920 file (24 Oct 2026). The gain in sharpness is small because the source is soft.
- Stay on main and push as rarely as possible, rather than working on a free dev branch (24 Oct 2026).
- Claude updates CLAUDE.md (decisions log, open decisions, current state) directly, without asking first (24 Oct 2026).
- Phone menu (below 1240px): full-screen navy panel with Resources and Projects and impact as collapsed sections, chosen over all links shown at once and over a short drop-down panel (24 Oct 2026). Desktop dropdowns open on click, not hover. Escape closes, the page behind the open menu is inert. Menus use the darker navy #0f1b2b, like the phone strip.
- Nav links are soft white (78%) turning white on hover, focus and when open, with no underline, as on the concept site; the sand Part of OAD link keeps its underline on hover (24 Oct 2026).
- Header is a shared partial (site/partials/header.html) inserted by build.js with {{> header}}, so every page uses the same one (24 Oct 2026). All page paths start with /. Live Server serves dist/ as its root through .vscode/settings.json.
- The case, light pollution figure: "More than 8 in 10 people live under light-polluted skies", source Falchi et al., "The new world atlas of artificial night sky brightness", Science Advances, 2016 (abstract checked 24 Oct 2026: "more than 80% of the world ... live under light-polluted skies"). The plan's wording "8 in 10 can't see the Milky Way" is wrong: the paper says the Milky Way is hidden from more than one third of humanity. Tell Ram and Joy.
- The case (Phase 2, design "Trail", 25 Oct 2026): approved design in docs/case/case-design.md. Sanity: one caseSection document with a heading and exactly three stats (the eyebrow was removed 26 Oct) (value, label, source line, source link, checked-on date), chosen over reusable impact figures that the section references, and over a hybrid. The three stats are context about the world, not OAD results, so reuse adds little; the plan's impact figures stay for the Proof section and Impact page.
- The case source lines are plain text, not links (25 Oct 2026). The source link stays in Sanity, required, so editors know where to check each number.
- Where the case trail goes next is decided when the six pillars are designed (25 Oct 2026). It is built leaving the bottom centre, as drawn.
- The case breakpoint: zigzag from 1248px (78em), single column below (26 Oct 2026). Measured from 1024 to 1440: below 1088 the second stat touches the trail, and below 1248 the third stat's text is cut off at the bottom of the stage. Close to the header's switch at 1240px.
- Hero bottom fade lengthened for The case (26 Oct 2026): desktop 210px eased fade ending in #0f1b2b (was 105px), phone ground fade 112 mock-up px (y 550 to 662) with the same stops. On desktop the fade is drawn twice so "Astrotourism" stays fully white: once over the video under the word, and once on the mountain cut-out only, through a CSS mask made from the cut-out image.
- The case: no eyebrow ("Why astrotourism" removed as unnecessary), and on desktop the trail starts just after the end of the heading instead of at the top centre (26 Oct 2026). The phone trail is unchanged. The trail therefore no longer enters from the hero at the top centre.
- The case heading on desktop: Barlow 400, white at 70%, 40 mock-up px, one line (26 Oct 2026), chosen over Barlow in sand and Space Grotesk in sand, because in white Space Grotesk it looked odd straight under the hero's "for a better world.". Phones keep Space Grotesk white. The desktop trail now starts just after the end of this one-line heading (path start 642,206).
- The case trail only ever grows: once drawn it stays when scrolling back up, and lit dots stay lit (26 Oct 2026). On desktop the amount drawn follows distance along the trail, evenly over the section's scroll (start when the stage top is 85% down the screen, finish when its bottom is), with a 0.2s ease, instead of following screen height, which drew the almost flat first stretch in one chunk.
- The case desktop compressed to fit on one screen (27 Oct 2026): the stage is 1440 x 800 (was 900), and never taller than the window (max-width min(1920px, (100svh - 2rem) x 1440/800); on short or very wide screens it stops growing and is centred, so the heading moves in from the hero's margin there). Heading at 40, stats at 120 / 360 / 566 (stat 2 moved right to x 600), dots at 188 / 430 / 620 (section coordinates), trail redrawn to match, with the curve under the 62% dipping lower to keep clear of its text. Measured at 8 screen sizes: fits, stat 3 stays inside, every stat at least 19px from the trail. The pillars trail continues at the case's new pace (length / 800).
- The case motion (26 Oct 2026): plain JavaScript (passive scroll listener with requestAnimationFrame), not CSS scroll-driven animations, so it works in every browser without checking support. The trail's tip follows a line 70% down the screen (or is drawn fully when the page is scrolled to the bottom); dots light from 30% to full when reached. Desktop draws the SVG trail through a mask (a solid copy with pathLength 1); the single column clips each trail piece with --reveal. Desktop only: heading and stats fade up 16px once (IntersectionObserver, 600ms). Nothing is hidden without JavaScript; with reduced motion everything is drawn and shown.
- The case single column: stats in normal flow; the trail is split into stretched pieces (start, between dots, end) attached to the intro and each stat, always starting and ending at the dots, with the dots as CSS pseudo-elements level with the middle of each number (26 Oct 2026). Chosen over one stretched trail (the drawn wiggle would put dots beside the line) and over placing dots with JavaScript (the page must look finished without it).
- The case desktop stage grows with the screen up to 1920px (26 Oct 2026), chosen over keeping it at 1440 centred (heading out of line with the hero on wide screens), pinning it to the left, or capping at 1680 or 1600 (still out of line on 1920 monitors). At 1920 the numbers are about 139px. The heading uses the hero's side margin (--gutter), so the two line up exactly.
- The case stat 3 wording uses "an estimated": "$2.2bn an estimated global astro tourism market in 2025" (25 Oct 2026). Commercial estimate: Joy must see it before launch.
- The case sources, checked 25 Oct 2026: Falchi et al., Science Advances, 2016 ("more than 80% of the world" under light-polluted skies; open copy https://pmc.ncbi.nlm.nih.gov/articles/PMC4928945/). Booking.com "Nine Predictions for Travel in 2025", newsroom, 16 Oct 2024 ("nearly two thirds (62%) are considering visiting darker sky destinations"; 27,713 respondents, 33 countries, July to August 2024; https://news.booking.com/defying-convention-to-deepen-connections-bookingcoms-nine-predictions-for-travel-in-2025/). Growth Market Reports, Astro Tourism Market, updated 11 Oct 2026 (USD 2.2 billion in 2025, range USD 1.9 to 2.5 billion; https://growthmarketreports.com/report/astro-tourism-market).
- Pillars in Sanity (27 Oct 2026): one pillarsSection document (eyebrow, heading, helper lines for computer and phone, exactly six pillars in circle order), chosen over six separate pillar documents (count and order hard to enforce) and pillar documents picked by a section (two places to edit). Colours belong to the positions, in CSS. Each pillar: name, sentence, optional photo (hotspot; alt text and credit required once there is a photo), one to three links.
- Pillar links pick from a dropdown of the site's pages (studio/schemaTypes/sitePages.js, kept in step with the nav), or an outside web address, chosen over free-text paths and over page documents in Sanity (27 Oct 2026).
- No consent checkbox on pillar photos (27 Oct 2026); consent is handled by our own process with OAD before a photo is added.
- Pillars use the tabs pattern (tablist, tab, tabpanel; one Tab stop, arrow keys round the circle, Home and End), chosen over six buttons with aria-pressed (27 Oct 2026).
- Pillar segments are real HTML buttons (27 Oct 2026). Each button holds its own SVG segment shape and label; the button ignores the pointer and only the painted shape reacts, so the hit area is exactly the segment. This replaces the clip-path idea agreed first, because clip-path would cut off the outlines and the focus ring. The focus ring is drawn on the shape (wide white outline with a yellow glow).
- The first pillar (Promotion & Awareness) is open when the page loads (27 Oct 2026), chosen over none with a prompt and over Resources.
- Pillars trail (27 Oct 2026, changed from the spec): it continues from The case's trail and ends beside the heading "What we do" instead of curling into the ring. Desktop path M720,0 C 640,70 520,125 330,125, starting in the same direction as The case's trail ends, so the join has no kink; one dot pattern runs across both (main.js shifts The case's dash pattern so its trail ends mid-gap, and this trail starts at that point); phones straight down the left (side margin + 16px) to the middle of the heading. It draws itself on scroll through an SVG mask, starting when The case's trail finishes and at the same pace (length per unit of scroll), and stays drawn. Whenever The case is a single column (below 1248px) the pillars trail follows the same line 70% down the screen as The case's; until 29 Oct 2026 it used the desktop rule from 920px, so between 920 and 1247px it started while The case's trail was only 15 to 22% drawn. On desktop it also waits, frame by frame, until The case's trail has actually finished drawing on screen (its 0.2s ease), so a fast scroll never draws both at once (fixed 29 Oct 2026).
- Pillars desktop (27 Oct 2026, changed from the spec): segment labels 22px (was 18) and 28% of the ring wide; the card is 500 x 520 (made smaller on 27 Oct from 586 x 608, which matched the ring's height), centred on the ring's middle (top y 320), and its photo takes whatever height the text leaves. Card text: name 32, sentence 17, links 16. Breakpoint 1248px, like the header and The case (checked: Publications fits at 1248).
- Pillars desktop: no card (27 Oct 2026). L'chelle felt the card looked generic. After trying a faint colour field (too dull) and a full-colour field with faded edges (rejected), the open pillar sits directly on the dark page with its colour only as an accent: an 8px bar down the left of the text block in the open segment's colour, with no outline (L'chelle removed the sand edge; teal and navy are faint, 1.9:1 and 1.4:1, which is acceptable as the bar is decoration only). The pillar name stays white (teal, navy and terracotta are too dark as text). Text and links keep their normal colours. The connector ends just before the bar. Phones keep the card.
- Pillars desktop fits on one screen (27 Oct 2026): the heading, helper line and ring fit in the screen height. Horizontal positions use --px (width / 1440); heights, the ring size and the text use --s, which is --px capped by the screen height (section 860 units: heading at 40, ring box 210 to 850, text block from the top of the helper line to the bottom of the ring, measured by main.js; the helper line wraps before the colour bar). The connector and trail measure the ring and heading in the browser instead of fixed mock-up coordinates. On short screens the photo shrinks first, never the text. Checked at 1440x800, 1280x680, 1920x950, 1366x650 and 1536x730.
- Pillars desktop (27 Oct 2026): the ring and the text block are centred as a pair on the stage (ring, 150 gap, 500-wide text), equal space either side; the heading stays on the page margin and the helper line stays on one line. The pager dots are small four-point twinkle stars (CSS mask), all upright (no tilt), the open one bigger and yellow, on desktop and phone.
- Pillar photos (27 Oct 2026): uploaded as originals in Sanity (with hotspot, alt text and credit) and downloaded at build time by build.js into dist/assets/images/pillars/ (600 and 1100 wide, WebP and JPG), so visitors never contact Sanity. Chosen over linking to Sanity's image CDN. This settles the "Images from Sanity" open question in the Sanity rules for the whole site. Shown with object-fit: cover around the hotspot, credit as a small caption in the photo's corner. Photos come from OAD-funded projects; OAD has agreed they can be shown. The originals and prepared crops are in originals/pillars/ (outside git). They had been committed by mistake; on 27 Oct 2026, before any push, they were removed from all 20 unpushed commits (git filter-branch). A local backup branch, backup-before-photo-removal, and .git/refs/original still hold the old commits; delete both once the rewritten history is pushed and checked. The Publications photo (DATSWA) is only 670px wide, soft on sharp screens.
- Pillar colours changed (27 Oct 2026, from the spec): Promotion & Awareness terracotta, Resources yellow, Training sand, Implementation teal, Community navy, Publications sage. The colour bar follows the same positions. Label text colours follow the colour, so contrast is unchanged.
- Pillars switch to the phone layout below 920px (57.5em), not 1248px like the header and The case (27 Oct 2026). Measured: side by side works without overflow from 920px at heights 600 to 1000; below that the text gets cramped and the photo collapses. Between 920 and 1248px The case is a single column, so the pillars trail carries straight on down the left and the heading moves 52px in beside it. The helper line wraps before the colour bar when there is no room for one line.
- Pillars phone (27 Oct 2026, changed from the spec): shorter card (photo 96px, tighter padding, name 24px, sentence 15px), 16px below the ring, and the card fits the open pillar instead of the tallest one, so the page below moves a little when switching. The section clips sideways overflow, since the open segment pops past the edge of a 390 screen.
- Back-to-top arrow (27 Oct 2026): desktop only (from 1248px), styled as on the concept site, bottom right. Appears once the hero has scrolled completely out of view (on pages without a hero, after one screen of scrolling). A shared partial, site/partials/to-top.html, on every page.
- Donate added to the main nav (28 Oct 2026): last item, an outlined button (thin sand outline, text in the same soft white and weight as the other nav links, yellow on hover and focus; solid yellow was tried and rejected; on phones a full-width outlined button at the bottom of the menu), linking to https://iau.org/Iau/Fundraising/Donate_Now.aspx?WebsiteKey=9e4eaea2-b0d6-4c4b-bd18-913a208b91be. NOT YET CONFIRMED: iau.org blocks automated checks, so L'chelle to open it and check it is an OAD or astrotourism donation page, and Ram and Joy to agree to the nav change. To make room, the desktop header link is shortened to "Part of the IAU OAD ↗" (full name in its title and for screen readers; the phone strip keeps the full wording), chosen over switching to the menu button below about 1320px and over smaller nav text. The full header still fits from 1248px.
- "Three paths" cut from the homepage (29 Oct 2026). The order is now hero, the case, the six pillars, proof, news and updates, get involved, footer. Phase 4 is proof, design in docs/proof/proof-design.md. Ram and Joy signed off a sitemap that included three paths, so they need to be told.
- Proof in Sanity (29 Oct 2026): one impactSection document (eyebrow, heading, headline figure, exactly three results, button with page or outside address), chosen over sharing one figure type with The case (its values are text such as "8 in 10" and never count up, and Phase 2 would change) and over separate figure documents (two places to edit). The figure shape lives in its own file (impactFigure.js) so the Impact page can reuse it. Each figure: optional text before and after, a whole number (the site adds the comma), sentence, and a required source, source link and checked-on date that are never shown. Results add a tag and a place. No editor note field.
- Proof button goes to the new site's Impact page, /projects/impact/, chosen over the current live Impact page, which disappears when this site takes over the address at launch (29 Oct 2026). Until the page is built it shows the 404 page. It is a Sanity setting, so it can change without code.
- Proof breakpoint: two columns from 920px (57.5em), stacked below, the same switch as the pillars (29 Oct 2026). Chosen over 768px (the figure would shrink from 68 to 60px at the switch) and 1024px. Measured 640 to 1440: below 768 the result sentences go to three lines.
- Proof phone layout (29 Oct 2026): the button comes after the results in the HTML, so the reading order matches the phone layout; the desktop grid places it under the headline figure. Side margin is the page gutter (20px at 390, not the mock-up's 24) so it lines up with the pillars. The phone ridge is capped at 96px tall; the headline figure shrinks on narrow phones so it always fits.
- Proof count-up (29 Oct 2026, changed from the spec): only the headline figure moves, once 60% of it is on screen. L'chelle found the big figure raced while 7, 37 and 3 crawled when all four counted for 1.2s. It rolls like an odometer instead of counting: each digit is a window onto a strip of digits (1.25em apart) that spins upwards and lands on its final digit, left digits first (1.4s, then 0.14s more per digit to the right, about 2.1s in all), with an up-and-down motion blur (an SVG filter per digit, set each frame from the strip's speed, at most 0.08 of the text size) and soft top and bottom edges. Chosen over a soft all-round blur on a counting number (rejected) and vertical streaks on a counting number. Numbers already on screen when the page loads are not counted, so nothing jumps back to zero. While counting, screen readers get a hidden copy of the final number and the number keeps its final width. The final numbers are always in the HTML; nothing happens with reduced motion or without JavaScript.
- Proof button (29 Oct 2026, changed from the spec): smaller on desktop (17px text, 42px circle, 56px tall at 1440, instead of 20, 48 and 66). On phones a compact pill as wide as its text, left-aligned under the results (16px text, 40px circle), chosen over full width (too long), a text link with the circle, and the pill placed above the results.
- No About page; "About" in the main nav replaced by "News" (/news/), which will list every news post (29 Oct 2026). The homepage already does an About page's job. Nothing in Sanity linked to /about/. Ram and Joy need to hear this, as it changes the signed-off sitemap.
- Phase 5 is news and updates (design in docs/news/news-design.md): the `post` type in Sanity and the homepage section with the three newest posts (29 Oct 2026). All news posts live in one News list in the Studio; the homepage and the News page both read from it. The /news/ page and article pages are the next phase.
- News `post` type (29 Oct 2026, studio/schemaTypes/post.js): title (warning over 100 characters), web address (slug generated from the title, locked as soon as it is generated so links never break; editors cannot type in it, only a Generate button that works once the title has text, via a custom Studio input, studio/schemaTypes/components/GenerateOnlySlugInput.jsx), published-on date (shown, and the order; same date: created later first), category, main photo with hotspot (alt text required, credit optional, as in the spec), and the article (paragraphs, two subheading levels, bold, italic, links, bulleted and numbered lists, photos with required alt text and optional caption). The Studio's News list sorts newest first and shows photo, title, date and category. No short summary (excerpt) field: removed 29 Oct 2026, not used on the News page. Search engines' description for article pages is to be decided in the next phase.
- News categories are a fixed list: News, Events, OAD projects, stored as the codes news, events, oad-projects (29 Oct 2026). Chosen over a category list editors manage (near-duplicates possible). Adding one needs a schema change.
- News section wording ("News and updates", "Latest from OAD", "See all updates") is fixed in the HTML, not in Sanity (29 Oct 2026, L'chelle's choice). An exception to the rule that all wording lives in Sanity: Ram and Joy cannot change it without a code change.
- News photos (29 Oct 2026): downloaded at build time like the pillar photos, in two shapes cut around the editor's hotspot inside their crop: wide 15 by 8 (480, 820, 1240 wide) for desktop cards and the first phone card, and square (192, 288) for the two phone rows, WebP with JPG fallback, never enlarged past the original. Card photos have empty alt text (the title names the post); alt text stays required in Sanity for article pages.
- Pill button shared (29 Oct 2026): the proof button's look moved into one .pill-button class used by proof ("See all outcomes") and news ("See all updates"); each section only places it. On phones the news button is the compact pill like proof's, not the spec's full width, to match L'chelle's earlier choice.
- News cards (29 Oct 2026): the title is the only link, stretched over the whole card; in the HTML the title comes before the category and date (screen readers hear the title first), CSS shows the date line above it. Hover and keyboard focus turn the title yellow and underline it; the focus ring goes round the whole card. Only the photos and text blocks, plus the eyebrow and heading, are solid navy, so the trails show in the gaps but not behind words.
- News star trails (30 Oct 2026, replacing a slowly turning ring that L'chelle found too subtle to see): a new star field drawn by build/make-star-trails.js (run by hand, fixed random seed) into site/partials/news-sky-desktop.html and news-sky-phone.html, inline SVG. Drawn like a real long exposure: every trail circles the same pole (desktop 1260,-140 in a 1440 x 680 drawing, phone 380,-80 in 390 x 830, as in the designer's files), every trail covers the same 30 degrees (same exposure time, so short near the pole, long far from it), mostly faint with a few bright, white, pale blue and some warm sand. 120 trails on desktop, 70 on phones. Spacing (changed 30 Oct 2026, the first even scatter piled lines into the far corner and none entered from the top): stars far from the pole are kept less often, stars are also placed beyond the edges and above the top, and the script tries 40 skies and keeps the most even (every twelfth of the section holds 6 to 12% of the line). Motion chosen by L'chelle over faster turning and over growing plus turning: the trails grow like an exposure being taken, all at the same rate, over 30 seconds, hold 4, then shorten from their tail until they vanish over 15 (a 3 second fade was tried first and was too obvious), 49 seconds in all; the page opens 12 seconds in. Paused while the section is off screen (main.js adds .news--paused); drawn in full and still with reduced motion. The designer's drawings stay in docs/news/ for reference.
- Proof bottom edge (30 Oct 2026, L'chelle): a wave like the top edge but not a mirror of it, gentler and with its own shape, teal above the line and the news section's dark navy below (site/assets/images/proof/ridge-bottom-desktop.svg, 1440 x 80, and ridge-bottom-phone.svg, 390 x 60, capped at 72px tall). Drawn by Claude, not from the designer's files. Replaces the straight edge the proof spec left open until news was designed. Proof made less tall on desktop at the same time (top padding 104 design px instead of 140, bottom 8 plus the wave instead of 28, result rows 18 instead of 24): 604px tall at 1440 instead of 660.
- News button on desktop a little smaller than the shared pill (29 Oct 2026): 15px text and a 36px circle at 1440 (proof keeps 17 and 42).
- build.js retries a failed download from Sanity up to three times (29 Oct 2026), after builds failed with "fetch failed" when the connection dropped.
- 404 page wording is fixed in the HTML, not in Sanity, as a system message: "This page isn't here yet", one line of explanation and a link home (24 Oct 2026). Marked noindex.

## Known gotchas (carried over from the concept build)

- Removing HTML that JS depends on breaks the JS silently. Check the browser Console (F12), and clean up the JS when you remove an element.
- `overflow: hidden` on any ancestor silently stops `position: sticky` working.
- A solid `background-color` on a section hides a shared background behind it.
- Chrome effects that blur or blend over playing video (such as `backdrop-filter`) can cause jitter on Windows.
- Headless browsers may not play H.264, so test video in real Chrome. Headless Chrome can't go narrower than about 504px, so test 390px inside a 390px `<iframe>`.
- `vector-effect` is not inherited in SVG, so put it on each `<path>`.
- To find what makes a page too wide, compare `document.documentElement.scrollWidth` with `clientWidth`, then look for elements whose `getBoundingClientRect().right` exceeds the window.

## Keeping this file current

Keep Current state, Decisions log and Open decisions up to date as decisions are made. Write the changes directly, without asking first, and tell me what changed (decided 24 Oct 2026).
