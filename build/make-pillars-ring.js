// Draws the ring of pillar segments (build/pillars-ring.svg). Not part of the
// normal build: run it by hand only to remake the drawing
// (node build/make-pillars-ring.js [number of segments, default 4]).
//
// Written 6 Nov 2026 when the ring went from six pillars to four. It reproduces
// the six-segment drawing exactly (checked point by point before the switch), so
// the four-segment ring has the same look: inner radius 140, outer radius 304,
// centre (320,320) on a 640 x 640 grid. Segments run clockwise from the top; each
// one is centred on its angle (360 / count degrees apart), leaves a 1.6 degree gap
// at each end, has a pointed tip at its clockwise end and a matching notch at its
// start (5 degrees deep, at the middle radius).

const fs = require('node:fs')
const path = require('node:path')

const CENTRE = 320
const INNER = 140
const OUTER = 304
const MIDDLE = (INNER + OUTER) / 2 // 222
const GAP = 1.6 // degrees left free at each end of a segment
const TIP = 5 // degrees the tip and the notch reach along the ring
const STEP = 1.42 // degrees between points on the arcs

// A point on the grid: radius and angle in degrees clockwise from the top
function at(radius, degrees) {
  const a = (degrees * Math.PI) / 180
  return [CENTRE + radius * Math.sin(a), CENTRE - radius * Math.cos(a)]
}

const fmt = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`

function segmentPoints(count, index) {
  const span = 360 / count
  const start = index * span - span / 2 + GAP
  const end = index * span + span / 2 - GAP
  const steps = Math.round((end - start) / STEP)
  const along = (i) => start + ((end - start) * i) / steps
  const points = []
  for (let i = 0; i <= steps; i++) points.push(at(OUTER, along(i))) // outer arc, start to end
  points.push(at(MIDDLE, end + TIP)) // the tip
  for (let i = steps; i >= 0; i--) points.push(at(INNER, along(i))) // inner arc, back to the start
  points.push(at(MIDDLE, start + TIP)) // the notch
  return points
}

function drawRing(count, names) {
  const span = 360 / count
  const polygons = Array.from({length: count}, (_, i) =>
    `<polygon id="segment-${i + 1}" data-pillar="${names[i] || ''}" points="${segmentPoints(count, i).map(fmt).join(' ')}"/>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="640" height="640">
<!-- The ${count} pillar segments at desktop size: inner radius ${INNER}, outer radius ${OUTER}, centre (${CENTRE},${CENTRE}). Order clockwise from the top. Each segment spans ${span} degrees with a ${GAP} degree gap at each end, a pointed tip at its clockwise end and a matching notch at its start (${TIP} degrees deep, at the middle radius). Made by build/make-pillars-ring.js. -->
${polygons.join('\n')}
</svg>
`
}

module.exports = {drawRing, segmentPoints}

if (require.main === module) {
  const count = Number(process.argv[2] || 4)
  const names = {
    4: ['Resources', 'Training', 'Implementation', 'Community'],
    6: ['Promotion and Awareness', 'Resources', 'Training', 'Implementation', 'Community', 'Publications'],
  }[count] || []
  const target = path.join(__dirname, 'pillars-ring.svg')
  fs.writeFileSync(target, drawRing(count, names))
  console.log(`Wrote ${count} segments to ${target}`)
}
