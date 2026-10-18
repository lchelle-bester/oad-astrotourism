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
| `site/assets/video/hero-1920.webm`, `hero-1920.mp4`, `hero-1280.webm`, `hero-1280.mp4` | Hero background (night sky over mountains) | Supplied by OAD. Filmed by: to confirm with Joy | To confirm with Joy |
| `site/assets/video/hero-poster.jpg` | Hero poster image, also shown when reduced motion is on | First frame of the hero video above | Same as the hero video |

How the hero files were made from OAD's original clip (8.7 s, 4K, HEVC):

1. Trimmed to 0.7 s to 7.9 s, cutting the blue dusk at the start and the fade to black at the end.
2. Removed the duplicate frames (every second frame in the original was a copy), leaving 104 real frames.
3. Slowed to half speed with motion interpolation, so the stars move smoothly.
4. Crossfaded the last 3 seconds into the start so the loop has no visible jump (10.6 s loop).
5. Gentle sharpening to restore the crispness lost in steps 3 and 4.
6. Encoded as WebM (VP9) and MP4 (H.264) at 1920 and 1280 wide, with the silent sound track removed.
