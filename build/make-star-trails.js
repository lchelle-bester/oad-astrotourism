// Draws the star trails behind the news section, like a long-exposure photo of
// the night sky. Not part of the normal build: run it by hand only to remake the
// drawings (node build/make-star-trails.js). It writes two partials,
// site/partials/news-sky-desktop.html and news-sky-phone.html.
//
// How a real star-trail photo works, and so how this is drawn:
// - every star turns round the same point, the pole (here just above the
//   section, near the right, as in the designer's drawing)
// - every star was exposed for the same time, so every trail covers the same
//   angle round the pole: trails near the pole are short, far ones long
// - stars are scattered evenly over the sky, most faint, a few bright
// The random numbers come from a fixed seed, so the drawing is the same every
// time the script is run.

const fs = require('node:fs')
const path = require('node:path')

// A small seeded random number generator (mulberry32): the same seed always
// gives the same "random" numbers
function random(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SWEEP = 30 // degrees each trail covers (the "exposure time")

function draw({width, height, poleX, poleY, stars, seed}) {
  const rand = random(seed)
  const paths = []
  while (paths.length < stars) {
    // A star anywhere in the sky, also a little beyond the edges so trails can
    // enter from outside
    const x = -0.15 * width + rand() * 1.3 * width
    const y = rand() * 1.1 * height
    const r = Math.hypot(x - poleX, y - poleY)
    if (r < 40) continue
    const end = Math.atan2(y - poleY, x - poleX)
    const start = end - (SWEEP * Math.PI) / 180 // the star moves clockwise on screen
    const sx = poleX + r * Math.cos(start)
    const sy = poleY + r * Math.sin(start)
    // Most stars faint, a few bright: brightness skewed towards 0
    const b = rand() ** 3
    const opacity = (0.1 + 0.4 * b).toFixed(2)
    const strokeWidth = (0.8 + 1.1 * b).toFixed(1)
    const tint = rand()
    const colour = tint < 0.7 ? '#ffffff' : tint < 0.9 ? '#cfe3ff' : '#d9b487'
    paths.push(
      `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}" ` +
        `stroke="${colour}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" pathLength="1"/>`,
    )
  }
  return paths.join('\n          ')
}

const layouts = {
  desktop: {width: 1440, height: 680, poleX: 1260, poleY: -140, stars: 110, seed: 11},
  phone: {width: 390, height: 830, poleX: 380, poleY: -80, stars: 60, seed: 7},
}

for (const [name, layout] of Object.entries(layouts)) {
  const file = path.join(__dirname, '..', 'site', 'partials', `news-sky-${name}.html`)
  fs.writeFileSync(file,
    `      <!-- Star trails (${name}), made by build/make-star-trails.js. Do not edit by hand. -->\n` +
    `      <svg class="news__sky news__sky--${name}" viewBox="0 0 ${layout.width} ${layout.height}" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">\n` +
    `        <g fill="none" stroke-linecap="round">\n          ${draw(layout)}\n        </g>\n` +
    `      </svg>\n`)
  console.log('wrote', path.relative(process.cwd(), file))
}
