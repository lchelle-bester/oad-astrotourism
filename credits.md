# Credits

Source and licence of every image, video and font used on the site. Add a line whenever something new goes in.

## Fonts

| Font | Used for | Source | Licence |
|---|---|---|---|
| Space Grotesk 600 | Headings | @fontsource/space-grotesk 5.3.0 (npm), from github.com/floriankarsten/space-grotesk | SIL Open Font License 1.1, see `site/assets/fonts/OFL-SpaceGrotesk.txt` |
| Barlow 400, 600 | Body text | @fontsource/barlow 5.3.0 (npm), from github.com/jpt/barlow | SIL Open Font License 1.1, see `site/assets/fonts/OFL-Barlow.txt` |

The fonts are served from this site, not from Google, so visitors' browsers make no request to a third party. Latin and Latin Extended subsets only.

## Images

| File | Used for | Source | Licence |
|---|---|---|---|
| `site/assets/images/logos/oad-*` (9 files) | OAD logo and symbol, header, footer and partner band | Official files from the "OAD Logo" folder, supplied by OAD. Renamed only, otherwise unaltered | OAD brand assets. To confirm with Ram or Joy |
| `site/assets/images/case/` (contours-desktop.svg, contours-phone.svg, trail-phone-start/mid/end.svg), and the trail and waypoint drawing inside `site/index.html` | The case: contour lines, dotted trail, waypoint dots | Drawn for this site, from the approved design files `docs/case/case-trail-desktop.svg` and `case-trail-phone.svg` | Made for this project |
| Partner logos in the footer (National Research Foundation with SARAO, Department of Science, Technology and Innovation, International Astronomical Union), uploaded in Sanity (Site settings) and downloaded at build time into `dist/assets/images/partners/` | The footer's "Our partners" band | Uploaded by L'chelle. **Original source of each file still to be recorded here** (the live astro4dev.org footer shows the same three partners). Never redrawn or recoloured | The partners' own logos, used with OAD's agreement. To confirm with Ram or Joy |
| `site/favicon.ico`, `site/assets/images/favicon/icon-192.png` and `apple-touch-icon.png` | Tab icon in browsers, and on a phone's home screen | The official OAD symbol on its black square (`oad-symbol-colour-on-black-300.jpg` in the logo folder), only scaled down with `build/make-favicon.py` (never recoloured, redrawn or cropped) | OAD brand asset, as the logo files |
| News photos (cards, article main photos, photos in articles), uploaded in Sanity with each post and downloaded at build time into `dist/assets/images/news/` | News section: homepage cards, the News page and the article pages | Supplied by OAD with the articles (originally on OAD's blog). The photographer or organisation is in each photo's Credit field in Sanity and is shown with the photo; the original web address of each image was recorded when the posts were imported | Used with OAD's agreement. Not CC unless the credit says so; confirm with Ram and Joy before launch, as with the pillar photos |
| Impact page photos: the banner (not yet published in Sanity) and one for each of the four chapters, uploaded in Sanity (Impact page) and downloaded at build time into `dist/assets/images/impact/`. Originals in `originals/impact/` (outside git), notes in `docs/impact/photo-details.csv` | The Impact page (`/projects/impact/`) | Supplied by L'chelle (20 Nov 2026) from OAD-funded projects: the banner and chapter 3 from Langkawians Guide Malaysians to the Stars (Malaysia, 2023), chapter 1 from Astronomy for Himalayan Livelihood Creation (India, 2018), chapter 2 from Starry Safaris (Tanzania, 2026), chapter 4 from Astrostays (India). **The photographer of each is still unknown**: the Credit field in Sanity is optional, so fill it in as it is found (ask Joy) | L'chelle confirmed on 20 Nov 2026 that all five can be shown (chapter 3 shows a child). Not CC. Confirm with Ram and Joy before launch, as with the other photos |
| Impact page banner photo, "Telescopes on La Palma under the Milky Way" (replaces the Langkawi banner from 25 Nov 2026): to be uploaded in Sanity (Impact page, Top of the page) and downloaded at build time into `dist/assets/images/impact/`. Original `evgeni-tcherkasski-Xsva3kxJ6mw-unsplash.jpg` (6016 x 4016) and the 2400 px copy `originals/impact/06-hero-la-palma-milky-way.jpg` (outside git) | The Impact page banner (`/projects/impact/`) | Evgeni Tcherkasski, on Unsplash. The photo's own Unsplash page was not opened to copy the exact address: add it here | Unsplash licence (free to use, credit not required but shown on the page as "Photo: Evgeni Tcherkasski on Unsplash"). Claude has not re-read the licence text for this photo: check its Unsplash page before launch |
| `site/assets/images/map/world.svg` and `build/map-positions.json` | The map "Where the change happened" on the Impact page | Made by `build/make-world-map.js` from Natural Earth (naturalearthdata.com, ne_110m_land for the land and ne_50m_admin_0_countries for the dot positions), cut to a frame and projected to a flat map | Natural Earth is in the public domain: no credit or licence is required (it is credited here anyway) |
| YouTube video stills in articles (`youtube-<video id>-<size>.webp` in `dist/assets/images/news/`) | The picture shown before a video is played | The video's own thumbnail from YouTube's image server (i.ytimg.com), downloaded at build time. The videos are OAD's or its partners' own | Belongs to the video's owner; shown only as the preview of that video, linking to it |
| `site/assets/images/sdg/sdg-01.png` to `sdg-17.png` (17 files) | The Sustainable Development Goals icons on the Theory of Change page (goals section) | The United Nations' official English web icons (`E_WEB_NN.png` from the per-goal downloads at https://www.un.org/sustainabledevelopment/news/communications-material/, 1500 px square), only scaled down proportionally to 192 px. Not recoloured, cropped, redrawn or reshaped, as the UN guidelines require | Used under the UN's "Guidelines for the use of the SDG logo, including the colour wheel, and 17 icons" (Sept 2023): informational, non-commercial use needs no permission. The use does not imply UN endorsement of OAD or this site. Fundraising or commercial use would need the UN's written permission |

Which file to use where is in `site/assets/images/logos/README.md`. The logo is never recoloured, redrawn or stretched.
## Video

| File | Used for | Source | Licence |
|---|---|---|---|
| `site/assets/video/hero-1920.webm`, `hero-1920.mp4`, `hero-1280.webm`, `hero-1280.mp4` | Hero background (night sky over mountains) | Supplied by OAD. Filmed by: Astronomy for Livelihood Creation / IAU OAD | Supplied by OAD for use on this site. Credit confirmed by Joy (Oct 2026) |
| `site/assets/video/hero-phone.webm`, `hero-phone.mp4` | Hero background on phones up to 448px wide | Same clip and steps as above, from a slice of the 4K original (26% to 85% across, full height) at 1356 x 1296, so phones get a sharper picture. Brightening mask scaled to the new size (y 1018 to 1186) | Same as the hero video |
| `site/assets/video/hero-poster.jpg` | Hero poster image, also shown when reduced motion is on | First frame of the hero video above | Same as the hero video |
| `site/assets/video/hero-cutout.webp` | Mountains laid over the large word on desktop, so the peaks cut into it | First frame of the hero video above, with the sky made transparent (`docs/hero/make-mountain-cutout.py`), saved as WebP quality 92 | Same as the hero video |

How the hero files were made from OAD's original clip (8.7 s, 3832 x 2160, HEVC). The original is kept in `originals/`, outside git.

1. Trimmed to 0.7 s to 7.9 s, cutting the blue dusk at the start and the fade to black at the end.
2. Removed the duplicate frames (every second frame in the original was a copy), leaving 104 real frames.
3. Slowed to half speed with motion interpolation, so the stars move smoothly.
4. Brightened the mountains (added 24 Oct 2026): from y 850 to y 990 of the 1920 x 1082 frame a mask fades in, and under it each colour channel becomes `min(1, 1.12 * value^0.62)`. The sky and stars are unchanged. Done before the crossfade, so the loop join blends frames that are already brightened.
5. Crossfaded the last 3 seconds into the start so the loop has no visible jump (10.6 s loop).
6. Gentle sharpening to restore the crispness lost in steps 3 and 5.
7. Encoded as WebM (VP9) and MP4 (H.264) at 1920 and 1280 wide, with the silent sound track removed.

## Icons

| Icon | Used for | Source | Licence |
|---|---|---|---|
| Facebook (`facebook-f`), Instagram, TikTok, YouTube, LinkedIn (`linkedin-in`) and X (`x-twitter`) brand icons | Social links in the footer | Font Awesome Free 6.5.2 (`@fortawesome/free-brands-svg-icons`), https://fontawesome.com. The SVG paths are copied into `build/social-icons.js`; nothing is loaded from Font Awesome's servers | Icons: CC BY 4.0, https://fontawesome.com/license/free. Credit given here |

## Data

| Data | Used for | Source | Licence |
|---|---|---|---|
| Country names and ISO codes (250) | The country list for projects, in `studio/schemaTypes/countries.mjs` | `i18n-iso-countries` 7.14.0, https://github.com/michaelwittig/node-i18n-iso-countries. Copied into the file (generated once); not a dependency. A few short names set by hand | MIT, copyright 2016 widdix GmbH |
