// Makes the map on the Impact page ("Where the change happened"): one drawing of the world's land
// and the position of every country's dot. Run by hand, only when the frame or the data changes:
//
//   node build/make-world-map.js
//
// It writes two small files that are committed, so the site build needs no download and no map
// library (decided 21 Nov 2026, L'chelle: a plain SVG map, not MapLibre):
//   site/assets/images/map/world.svg   the land, as one path, in the mock-up's cream
//   build/map-positions.json           where each country's dot goes, as a percentage of the map
//
// Data: Natural Earth (naturalearthdata.com), public domain, no credit required (it is credited in
// credits.md anyway). Land: ne_110m_land. Dot positions: the label point of each country in
// ne_50m_admin_0_countries (the 50m file has the small islands, such as Saint Lucia and the US
// Virgin Islands, that the 110m one leaves out). The files are downloaded once into .cache/.
//
// The map is a Mercator projection of the whole world, cut only at the poles (frame below). It was
// cropped to the mock-up's shape at first (lon -118 to 140, lat -42 to 58), which left 37 countries
// off the map, such as Canada, Russia, the Nordic countries and New Zealand; on 21 Nov 2026
// L'chelle asked for it uncropped so every country fits. Only Antarctica itself is left out. The
// frame, the picture size and the sea colour are repeated in the CSS (section 22b), so change them
// in both places.

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const CACHE = path.join(ROOT, '.cache', 'world-map')
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'

// The frame: west, east, south and north edges in degrees
// North: Greenland's label point is at 74N. South: the South Sandwich Islands are at 55.7S.
const FRAME = {west: -180, east: 180, south: -58, north: 78}
const WIDTH = 2000 // the drawing is 2000 units wide
const LAND = '#ece2d3' // the mock-up's land colour

// Dots that Natural Earth's label point puts in the wrong place for us: Malaysia's label point is
// in Borneo, but the mock-up puts the dot on the peninsula, where Langkawi is. Australia's label point is
// the Ashmore and Cartier Islands off its north-west coast (they share the code), so its dot is put on the
// mainland (27 Nov 2026, found when the survey page drew one in the sea).
const OVERRIDES = {MY: {lon: 101.9, lat: 4.2}, AU: {lon: 134, lat: -25}}

// Countries and territories in the Studio's list (studio/schemaTypes/countries.mjs) that Natural
// Earth's country file has no ISO code for (Taiwan, the French overseas departments) or leaves out
// (Gibraltar): a point near the middle of each, so a project there still gets a dot. A few tiny
// territories with no one living there (Bouvet Island, and so on) are left without a position.
const EXTRA = {
  TW: {name: 'Taiwan', lon: 121.0, lat: 23.7},
  GF: {name: 'French Guiana', lon: -53.2, lat: 3.9},
  GP: {name: 'Guadeloupe', lon: -61.55, lat: 16.25},
  MQ: {name: 'Martinique', lon: -61.0, lat: 14.65},
  RE: {name: 'Reunion', lon: 55.5, lat: -21.1},
  YT: {name: 'Mayotte', lon: 45.15, lat: -12.8},
  GI: {name: 'Gibraltar', lon: -5.35, lat: 36.14},
}

const mercator = (lat) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))
const Y_NORTH = mercator(FRAME.north)
const Y_SOUTH = mercator(FRAME.south)
const X_SPAN = ((FRAME.east - FRAME.west) * Math.PI) / 180
const HEIGHT = Math.round((WIDTH * (Y_NORTH - Y_SOUTH)) / X_SPAN)

// Degrees to drawing units
const project = (lon, lat) => [
  ((lon - FRAME.west) / (FRAME.east - FRAME.west)) * WIDTH,
  ((Y_NORTH - mercator(lat)) / (Y_NORTH - Y_SOUTH)) * HEIGHT,
]

async function download(name) {
  const file = path.join(CACHE, name)
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'))
  console.log(`Downloading ${name} ...`)
  const response = await fetch(BASE + name)
  if (!response.ok) throw new Error(`Could not download ${name} (${response.status}).`)
  const text = await response.text()
  fs.mkdirSync(CACHE, {recursive: true})
  fs.writeFileSync(file, text)
  return JSON.parse(text)
}

// One ring of the land as path commands: the first point absolute, the rest relative, in whole
// units. Rings that lie wholly outside the frame (Antarctica, the Arctic islands) are left out.
function ring(points) {
  const projected = points.map(([lon, lat]) => project(lon, lat))
  const xs = projected.map((p) => p[0])
  const ys = projected.map((p) => p[1])
  const margin = 4
  if (Math.max(...xs) < -margin || Math.min(...xs) > WIDTH + margin || Math.max(...ys) < -margin || Math.min(...ys) > HEIGHT + margin) return ''
  const rounded = []
  for (const [x, y] of projected) {
    const point = [Math.round(x), Math.round(y)]
    const last = rounded[rounded.length - 1]
    if (!last || last[0] !== point[0] || last[1] !== point[1]) rounded.push(point)
  }
  if (rounded.length > 1 && rounded[0][0] === rounded.at(-1)[0] && rounded[0][1] === rounded.at(-1)[1]) rounded.pop()
  if (rounded.length < 3) return ''
  let d = `M${rounded[0][0]} ${rounded[0][1]}l`
  const steps = []
  for (let i = 1; i < rounded.length; i++) steps.push(`${rounded[i][0] - rounded[i - 1][0]} ${rounded[i][1] - rounded[i - 1][1]}`)
  return d + steps.join(' ') + 'z'
}

async function main() {
  const land = await download('ne_110m_land.geojson')
  let d = ''
  for (const feature of land.features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
    for (const polygon of polygons) for (const points of polygon) d += ring(points)
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="none"><path fill="${LAND}" fill-rule="evenodd" d="${d}"/></svg>\n`
  const svgFile = path.join(ROOT, 'site', 'assets', 'images', 'map', 'world.svg')
  fs.mkdirSync(path.dirname(svgFile), {recursive: true})
  fs.writeFileSync(svgFile, svg)

  const countries = await download('ne_50m_admin_0_countries.geojson')
  const positions = {}
  for (const feature of countries.features) {
    const p = feature.properties
    const code = p.ISO_A2 && p.ISO_A2 !== '-99' ? p.ISO_A2 : p.ISO_A2_EH
    if (!code || code === '-99' || typeof p.LABEL_X !== 'number') continue
    const at = OVERRIDES[code] || {lon: p.LABEL_X, lat: p.LABEL_Y}
    const [x, y] = project(at.lon, at.lat)
    positions[code] = {name: p.NAME_EN || p.NAME, x: Math.round((x / WIDTH) * 10000) / 100, y: Math.round((y / HEIGHT) * 10000) / 100}
  }
  for (const [code, at] of Object.entries(EXTRA)) {
    if (positions[code]) continue
    const [x, y] = project(at.lon, at.lat)
    positions[code] = {name: at.name, x: Math.round((x / WIDTH) * 10000) / 100, y: Math.round((y / HEIGHT) * 10000) / 100}
  }
  const out = {
    note: 'Made by build/make-world-map.js from Natural Earth (public domain). x and y are percentages of the map; a dot outside 0 to 100 is outside the frame.',
    frame: FRAME, width: WIDTH, height: HEIGHT, positions,
  }
  fs.writeFileSync(path.join(__dirname, 'map-positions.json'), JSON.stringify(out, null, 1) + '\n')
  console.log(`world.svg: ${WIDTH} x ${HEIGHT}, ${(svg.length / 1024).toFixed(1)} KB. Positions for ${Object.keys(positions).length} countries.`)
}

main().catch((error) => {
  console.error('Failed:', error.message)
  process.exit(1)
})
