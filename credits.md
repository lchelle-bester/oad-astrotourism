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

Which file to use where is in `site/assets/images/logos/README.md`. The logo is never recoloured, redrawn or stretched.
## Video

| File | Used for | Source | Licence |
|---|---|---|---|
| `site/assets/video/hero-1920.webm`, `hero-1920.mp4`, `hero-1280.webm`, `hero-1280.mp4` | Hero background (night sky over mountains) | Supplied by OAD. Filmed by: Astronomy for Livelihood Creation / IAU OAD | Supplied by OAD for use on this site. Credit confirmed by Joy (Oct 2026) |
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
