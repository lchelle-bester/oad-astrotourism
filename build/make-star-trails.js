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
// - stars are scattered over the sky, most faint, a few bright
// Because far trails are long, a plain even scatter piles lines up in the
// corner furthest from the pole, so far stars are kept less often. Stars are
// also placed beyond the edges (above the top too), so trails enter from every
// side. The script tries 40 skies and keeps the one whose lines are spread most
// evenly over the section (it prints the spread). The random numbers come from
// fixed seeds, so the drawing is the same every time the script is run.

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

// How much of an arc lies inside the drawing, as a share of the arc (0 to 1)
function shareInside(poleX, poleY, r, start, end, width, height) {
  let inside = 0
  for (let i = 0; i <= 20; i++) {
    const a = start + ((end - start) * i) / 20
    const x = poleX + r * Math.cos(a)
    const y = poleY + r * Math.sin(a)
    if (x >= 0 && x <= width && y >= 0 && y <= height) inside++
  }
  return inside / 21
}

// sweep: degrees each trail covers (the exposure time) for this layout.
// gap: the least distance, in design px, between the middles of two trails, so
// stars are scattered evenly instead of clumping (0 for none). Gives up after
// many tries if the section is full.
// stack: two trails closer than this (px) to the same circle may not overlap,
// so trails never pile up side by side into one bright band (0 for no check).
// faint: multiplies every trail's opacity (1 as drawn, lower for a fainter sky).
// grid: rows and columns the section is split into to measure the spread.
function draw({width, height, poleX, poleY, stars, seed, even, sweep = SWEEP, gap = 0, stack = 0, faint = 1, grid: [rows, cols] = [3, 4]}) {
  const rand = random(seed)
  const paths = []
  const arcs = []
  const middles = []
  let tries = 0
  while (paths.length < stars && tries++ < 50000) {
    // A star anywhere around the section, also well beyond its edges (above
    // the top too), so trails enter from every side
    const x = -0.3 * width + rand() * 1.6 * width
    const y = -0.5 * height + rand() * 1.6 * height
    const r = Math.hypot(x - poleX, y - poleY)
    if (r < 30) continue
    // Far from the pole every trail is long, so stars there are kept less
    // often (chance falls with distance): this spreads the lines evenly over
    // the section instead of piling them up in the far corner
    if (rand() > Math.min(1, even / r)) continue
    const end = Math.atan2(y - poleY, x - poleX)
    const start = end - (sweep * Math.PI) / 180 // the star moves clockwise on screen
    // Only trails that are mostly on the section are worth drawing
    if (shareInside(poleX, poleY, r, start, end, width, height) < 0.3) continue
    // Keep trails apart: skip this one if its middle is too near another's
    const middle = {x: poleX + r * Math.cos((start + end) / 2), y: poleY + r * Math.sin((start + end) / 2)}
    if (middles.some((m) => Math.hypot(m.x - middle.x, m.y - middle.y) < gap)) continue
    // and skip it if it would run alongside another trail on almost the same circle
    // (both cover the same angle, so they overlap when their middles are less
    // than one sweep apart; measured the short way round the circle)
    const mid = (start + end) / 2
    const apart = (o) => Math.abs(Math.atan2(Math.sin(mid - o.mid), Math.cos(mid - o.mid)))
    if (arcs.some((o) => Math.abs(o.r - r) < stack && apart(o) < end - start)) continue
    middles.push(middle)
    arcs.push({r, start, end, mid})
    const sx = poleX + r * Math.cos(start)
    const sy = poleY + r * Math.sin(start)
    // Most stars faint, a few bright: brightness skewed towards 0
    const b = rand() ** 3
    const opacity = ((0.1 + 0.4 * b) * faint).toFixed(2)
    const strokeWidth = (0.8 + 1.1 * b).toFixed(1)
    const tint = rand()
    const colour = tint < 0.7 ? '#ffffff' : tint < 0.9 ? '#cfe3ff' : '#d9b487'
    paths.push(
      `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}" ` +
        `stroke="${colour}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" pathLength="1"/>`,
    )
  }
  // Measure how much line falls in each part of the section, to check the spread
  const grid = Array.from({length: rows}, () => Array(cols).fill(0))
  for (const {r, start, end} of arcs) {
    for (let i = 0; i < 60; i++) {
      const a = start + ((end - start) * i) / 60
      const x = poleX + r * Math.cos(a)
      const y = poleY + r * Math.sin(a)
      if (x >= 0 && x < width && y >= 0 && y < height) grid[Math.floor((y / height) * rows)][Math.floor((x / width) * cols)] += (r * (end - start)) / 60
    }
  }
  const total = grid.flat().reduce((s, v) => s + v, 0)
  const shares = grid.map((row) => row.map((v) => (v / total) * 100))
  // Unevenness: how far the emptiest and fullest parts are from a fair share
  const fair = 100 / (rows * cols)
  const uneven = Math.max(...shares.flat().map((s) => Math.abs(s - fair)))
  return {markup: paths.join('\n          '), shares, uneven}
}

// Tries many skies (seeds) and keeps the most evenly spread one
function bestSky(layout) {
  let best = null
  for (let seed = 1; seed <= (layout.seeds || 40); seed++) {
    const sky = draw({...layout, seed})
    if (!best || sky.uneven < best.uneven) best = {...sky, seed}
  }
  console.log(best.shares.map((row) => row.map((v) => String(Math.round(v)).padStart(3)).join(' ')).join('\n'),
    `(% of the line in each part, seed ${best.seed})`)
  return best.markup
}

// even: the distance from the pole beyond which stars start being kept less
// often (see draw). Phones (30 Oct 2026): many faint trails (140, at 70% of the
// opacity), like the desktop's web of overlapping arcs. Fewer trails, shorter
// ones and spaced ones were tried and looked like random strokes. Then trails
// on almost the same circle were kept from overlapping (stack 9, gap 14) and
// the spread measured in 24 parts instead of 12 (best of 120 skies), after
// one band of stacked trails with a gap below it.
const layouts = {
  // The drawings include the strip under proof's bottom wave (80 desktop, 60
  // phone design px), so trails reach the green edge. The pole (the centre the
  // trails circle) was moved a little down and slightly left on 30 Oct 2026:
  // desktop from 1260,-60 to 1230,0, phone from 380,-20 to 372,20, then further down the same day to 1230,80 and 372,60; the phone then down and left again to 335,110 (in these
  // drawings' coordinates, which start at the top of the wave strip).
  desktop: {width: 1440, height: 760, poleX: 1230, poleY: 80, stars: 130, even: 500},
  phone: {width: 390, height: 890, poleX: 335, poleY: 110, stars: 140, even: 250, faint: 0.7, stack: 9, gap: 14, grid: [8, 3], seeds: 120},
}

for (const [name, layout] of Object.entries(layouts)) {
  const file = path.join(__dirname, '..', 'site', 'partials', `news-sky-${name}.html`)
  fs.writeFileSync(file,
    `      <!-- Star trails (${name}), made by build/make-star-trails.js. Do not edit by hand. -->\n` +
    `      <svg class="news__sky news__sky--${name}" viewBox="0 0 ${layout.width} ${layout.height}" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">\n` +
    `        <g fill="none" stroke-linecap="round">\n          ${bestSky(layout)}\n        </g>\n` +
    `      </svg>\n`)
  console.log('wrote', path.relative(process.cwd(), file))
}
