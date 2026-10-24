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
- **Images from Sanity.** Open question for when we reach the first Sanity image: link to Sanity's image CDN, or download images at build time and self-host them (fewer third-party requests).

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
│   ├── css/styles.css    design tokens at the top, sections numbered in comments
│   ├── js/main.js
│   └── assets/           images/, video/, fonts/ (fixed brand files, hero video and poster)
└── dist/                 generated by the build, never edited, git-ignored
```

To preview locally: run `node build/build.js`, then open `dist/` with Live Server.

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
- Show the "Part of the IAU Office of Astronomy for Development" link home in three places: the header, the About section and the footer. All link to astro4dev.org.
- Logo source files are in the Google Drive folder "OAD Logo" (inside the astro-tourism photos drive). They are PNG and JPG only, no SVG. Use the official files unaltered, and confirm which one has light text for dark backgrounds before using it. The "04_OAD_full_transparent" file also contains partner logos (DSI, NRF, SAAO), so it suits a footer partner band, not the header.
- Same typefaces and logo treatment as the main OAD site. Astrotourism takes its own emphasis from within the official palette.

## Structure (from the signed-off site plan, see docs/)

A PDF copy of the site plan is kept in `docs/` but not committed, because it contains Ram's and Joy's email addresses and the repo is public.

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
- Statistics must trace to a source. The plan's figures (ecotourism market $172.4bn in 2022 and $374.2bn by 2028, 8 in 10 people affected by light pollution, EUR 111,000 across 14 countries, five case studies, seven guidelines) have **not yet been verified by me against sources**. Check each one before it goes on a page and record the source.
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
6. **Rebuild cost of Sanity edits.** Each Sanity publish triggers a Netlify deploy (15 credits), so the free plan allows only about 20 deploys a month in total. Must be solved before Ram and Joy edit regularly: a paid Netlify plan, OAD paying, batching rebuilds, or another host (limits not yet checked).
7. **Landscape phone layout.** Phones held sideways show only sky on the first screen. Left as is for now (24 Oct 2026); a compact desktop-style layout sized by height is the likely fix.

## Build phases

**One phase at a time.** Finish, review and commit a phase before starting the next. Don't start building ahead, and don't touch sections that belong to a later phase. At the start of each phase: state what it includes, what Sanity content it needs, and what decisions I need to make. At the end: a checklist of what to test (desktop, 390px, keyboard, reduced motion, contrast) before it counts as done.

- **Phase 0, setup.** Git repo on GitHub, folder structure, `.gitignore`, `credits.md`, design tokens (colours and fonts) in CSS, Sanity account and project, Netlify connected.
- **Phase 1, hero.** Header with the ‘Part of OAD’ link home, night-sky video, headline, subheading and affiliation line. No hero button for now.
- **Phase 2 onwards.** Order to be agreed with me one phase at a time, following the homepage order in the structure above (the case, the six pillars, three paths, proof, news, get involved, footer), then the inner pages.

## Current state

Phase 0 (setup) is complete. The placeholder page is live at https://astrotourism.netlify.app (checked in the browser on 11 Oct 2026: Space Grotesk and Barlow load, navy background, no sideways scroll). The Sanity Studio runs locally. 

Phase 1 (hero) is in progress. Done: the hero content type with the headline in two fields, build.js, netlify.toml, the hero HTML, the desktop layout (header from 1240px, hero from 720px wide and 512px tall), the hero video with brightened mountains and the mountain cut-out, the phone layout (header below 1240px, hero below 720px wide or 512px tall) and the phone video file (24 Oct 2026). Next: the nav and menu JavaScript, then the 404 page. Still to do in Phase 1: the Netlify build hook and the Sanity webhook (neither exists yet; see open decision 6 on rebuild cost).

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
