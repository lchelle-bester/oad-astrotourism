// OAD Astrotourism: main.js


// NAV
// Dropdowns (desktop) and sections of the phone menu are buttons with
// aria-expanded; the CSS shows the list after a button whose value is "true".
// The phone menu button opens the whole nav as a full-screen panel.

const header = document.querySelector('.site-header')
const nav = document.querySelector('.site-nav')
const menuButton = document.querySelector('.menu-button')
const navToggles = document.querySelectorAll('.site-nav__toggle')
const main = document.querySelector('main')

function isOpen(button) {
  return button.getAttribute('aria-expanded') === 'true'
}

// Closes every open section, apart from the one passed in (if any)
function closeSections(except) {
  navToggles.forEach((toggle) => {
    if (toggle !== except) toggle.setAttribute('aria-expanded', 'false')
  })
}

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open))
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Menu')
  header.classList.toggle('is-menu-open', open)
  document.documentElement.classList.toggle('no-scroll', open)
  // inert: while the menu covers the page, nothing behind it can get focus
  main.inert = open
  if (!open) closeSections()
}

if (header && nav && menuButton && main) {
  // One section open at a time
  navToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const wasOpen = isOpen(toggle)
      closeSections(toggle)
      toggle.setAttribute('aria-expanded', String(!wasOpen))
    })
  })

  menuButton.addEventListener('click', () => setMenu(!isOpen(menuButton)))

  // Escape closes the menu, or else the open dropdown, and puts focus back
  // on the button that opened it
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    const openToggle = [...navToggles].find(isOpen)
    if (isOpen(menuButton)) {
      setMenu(false)
      menuButton.focus()
    } else if (openToggle) {
      closeSections()
      openToggle.focus()
    }
  })

  // A click outside the nav closes any open dropdown
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) closeSections()
  })

  // Tabbing out of the nav closes any open dropdown
  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget)) closeSections()
  })

  // Widening the window to the desktop header resets the phone menu
  window.matchMedia('(min-width: 77.5em)').addEventListener('change', () => setMenu(false))
}


// HERO VIDEO
// The video has no autoplay attribute and preload="none", so it downloads nothing
// until this code starts it. It only plays when the visitor has not asked their
// device to reduce motion and the current layout shows the video. Otherwise the
// poster image underneath stays visible.
// No pause button, by decision (see decisions log): this fails WCAG 2.2.2.

const heroVideo = document.querySelector('.hero__video')

if (heroVideo) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function updateHeroVideo() {
    const shown = getComputedStyle(heroVideo).display !== 'none'

    if (shown && !reduceMotion.matches) {
      // play() can be refused, for example in a phone's low power mode.
      // Then the poster simply stays.
      heroVideo.play().catch(() => {})
    } else {
      heroVideo.pause()
    }
  }

  reduceMotion.addEventListener('change', updateHeroVideo)
  window.addEventListener('resize', updateHeroVideo) // the layout decides whether the video is shown
  updateHeroVideo()
}


// THE CASE: TRAIL AND STATS MOTION
// The trail draws itself as the section scrolls past, and each waypoint dot lights
// up when the line reaches it. Once drawn it stays, also when scrolling back up. On desktop the heading and each stat also fade up once (CSS does the
// fade; IntersectionObserver says when). On phones only the trail moves.
// Nothing is hidden until this code runs, and it does nothing with reduced motion.

const caseSection = document.querySelector('.case')

if (caseSection) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const stage = caseSection.querySelector('.case__stage')
  const trail = caseSection.querySelector('#case-trail')
  const trailMask = caseSection.querySelector('.case__trail-mask')
  const waypoints = [...caseSection.querySelectorAll('.case__waypoint')]
  const intro = caseSection.querySelector('.case__intro')
  const stats = [...caseSection.querySelectorAll('.case__stat')]

  // Points along the trail, used to find how far along the path each dot is
  const length = trail.getTotalLength()
  const samples = []
  for (let i = 0; i <= 200; i++) {
    const p = trail.getPointAtLength((length * i) / 200)
    samples.push({at: i / 200, y: p.y})
  }
  const waypointAt = waypoints.map((g) => {
    const cy = +g.querySelector('circle').getAttribute('cy')
    return samples.reduce((best, s) => (Math.abs(s.y - cy) < Math.abs(best.y - cy) ? s : best)).at
  })

  // The page scrolled to the very bottom: draw everything (otherwise the end of the
  // trail could never be reached)
  function atBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  }

  const clamp = (n) => Math.min(1, Math.max(0, n))

  // The trail only ever grows: once drawn, scrolling back up leaves it there.
  let drawnDesktop = 0

  // Desktop: one SVG trail, drawn through its mask. The amount drawn follows
  // distance along the trail, not height on screen, so an even amount of
  // scrolling draws an even length of line (the first stretch is almost flat).
  // Drawing starts when the stage's top passes 85% down the screen and ends
  // when its bottom does.
  function drawDesktop() {
    const box = stage.getBoundingClientRect()
    const start = window.innerHeight * 0.85
    const progress = atBottom() ? 1 : clamp((start - box.top) / box.height)
    drawnDesktop = Math.max(drawnDesktop, progress)
    trailMask.style.strokeDashoffset = String(1 - drawnDesktop)
    waypoints.forEach((g, i) => {
      if (drawnDesktop >= waypointAt[i] - 0.005) g.classList.add('is-lit')
    })
  }

  // Single column: one trail piece per gap between dots, each clipped by --reveal.
  // The dots are 36px below the top of each stat (the middle of the number).
  // The tip follows a line 70% down the screen; pieces only ever grow.
  const revealed = new Map()

  function grow(el, value) {
    const v = Math.max(revealed.get(el) || 0, value)
    revealed.set(el, v)
    el.style.setProperty('--reveal', v)
  }

  function drawColumn() {
    const line = atBottom() ? Infinity : window.innerHeight * 0.7
    const top = caseSection.getBoundingClientRect().top
    const dots = stats.map((li) => li.getBoundingClientRect().top + 36)
    grow(intro, clamp((line - top) / (dots[0] - top)))
    stats.forEach((li, i) => {
      const end = i < stats.length - 1 ? dots[i + 1] : caseSection.getBoundingClientRect().bottom
      grow(li, clamp((line - dots[i]) / (end - dots[i])))
      if (line >= dots[i]) li.classList.add('is-lit')
    })
  }

  const isDesktop = window.matchMedia('(min-width: 78em)')
  let queued = false

  function update() {
    queued = false
    if (isDesktop.matches) drawDesktop()
    else drawColumn()
  }

  // A passive listener promises not to block scrolling; requestAnimationFrame
  // waits for the next frame, so the work is done at most once per frame
  function onScroll() {
    if (!queued) {
      queued = true
      requestAnimationFrame(update)
    }
  }

  // IntersectionObserver: the browser reports when each block comes into view.
  // It is revealed once, then no longer watched.
  const revealer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          revealer.unobserve(entry.target)
        }
      }
    },
    {rootMargin: '0px 0px -10% 0px'},
  )

  function start() {
    caseSection.classList.add('case--animated')
    trail.setAttribute('mask', 'url(#case-trail-reveal)')
    for (const el of [intro, ...stats]) {
      el.classList.add('will-reveal')
      revealer.observe(el)
    }
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onScroll)
    update()
  }

  // Reduced motion (also if it is switched on later): everything drawn and shown
  function stop() {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    revealer.disconnect()
    caseSection.classList.remove('case--animated')
    trail.removeAttribute('mask')
    trailMask.style.strokeDashoffset = '0'
    for (const el of [intro, ...stats]) {
      el.classList.remove('will-reveal')
      el.style.removeProperty('--reveal')
    }
  }

  if (!reduceMotion.matches) start()
  reduceMotion.addEventListener('change', () => (reduceMotion.matches ? stop() : start()))
}


// THE SIX PILLARS
// The page arrives as a plain list of six cards (what visitors without JavaScript
// see). This turns it into the ring: six segments acting as tabs, and one card
// beside the ring (below it on phones) showing the open pillar.
// Tabs: only the open segment is a Tab stop; the arrow keys move round the circle
// (wrapping at the ends), Home and End go to the first and last.

const pillarsSection = document.querySelector('.pillars')

if (pillarsSection) {
  const stage = pillarsSection.querySelector('.pillars__stage')
  const ring = pillarsSection.querySelector('.pillars__ring')
  const tablist = pillarsSection.querySelector('.pillars__tabs')
  const tabs = [...pillarsSection.querySelectorAll('.pillar-tab')]
  const cards = [...pillarsSection.querySelectorAll('.pillar-card')]
  const cardsBox = pillarsSection.querySelector('.pillars__cards')
  const pager = pillarsSection.querySelector('.pillars__pager')
  const dots = [...pillarsSection.querySelectorAll('.pillars__dots i')]
  const steps = [...pillarsSection.querySelectorAll('.pillars__step')]
  const drawing = pillarsSection.querySelector('.pillars__drawing')
  const drawingScale = pillarsSection.querySelector('.pillars__drawing-scale')
  const trailPath = pillarsSection.querySelector('.pillars__trail')
  const connector = pillarsSection.querySelector('.pillars__connector')
  const isDesktop = window.matchMedia('(min-width: 57.5em)')
  const names = tabs.map((tab) => tab.textContent.trim())
  let open = 0

  // Switch on ring mode
  pillarsSection.classList.add('pillars--ring')
  ring.hidden = false
  pager.hidden = false
  pillarsSection.querySelectorAll('.pillars__helper').forEach((p) => (p.hidden = false))
  cards.forEach((card, i) => {
    card.setAttribute('role', 'tabpanel')
    card.setAttribute('aria-labelledby', tabs[i].id)
  })

  function select(i, moveFocus = false) {
    open = (i + tabs.length) % tabs.length
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(j === open))
      tab.tabIndex = j === open ? 0 : -1
    })
    cards.forEach((card, j) => card.classList.toggle('is-open', j === open))
    pillarsSection.dataset.open = String(open) // the colour bar on desktop follows it
    dots.forEach((dot, j) => dot.classList.toggle('is-open', j === open))
    steps[0].setAttribute('aria-label', `Previous pillar: ${names[(open + 5) % 6]}`)
    steps[1].setAttribute('aria-label', `Next pillar: ${names[(open + 1) % 6]}`)
    if (moveFocus) tabs[open].focus()
    draw()
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)))
  steps.forEach((step) => step.addEventListener('click', () => select(open + Number(step.dataset.step))))

  tablist.addEventListener('keydown', (event) => {
    const moves = {ArrowRight: open + 1, ArrowDown: open + 1, ArrowLeft: open - 1, ArrowUp: open - 1, Home: 0, End: tabs.length - 1}
    if (event.key in moves) {
      event.preventDefault()
      select(moves[event.key], true)
    }
  })

  // DRAWING: the incoming trail and, on desktop, the connector from the open
  // segment to the card. Desktop works in mock-up units (1440 wide), scaled to
  // the stage; phones work in screen pixels.
  // Sizes on the 640-unit ring drawing (the ring box is scaled to fit the screen,
  // so the code measures where the ring actually is)
  const OUTER = 304 // outer radius of the ring
  const POP = 12 // how far the open segment moves out
  const AROUND = 328 // the connector's path round the far side of the ring
  const BAR_GAP = 48 // the connector stops this far (mock-up px) before the text
  const toUnits = (px, box, r) => ({
    left: (r.left - box.left) / px, right: (r.right - box.left) / px,
    top: (r.top - box.top) / px, bottom: (r.bottom - box.top) / px,
  })

  function connectorPath(px, box) {
    const ringBox = toUnits(px, box, ring.getBoundingClientRect())
    const k = (ringBox.right - ringBox.left) / 640 // ring drawing units to mock-up units
    const centre = {x: (ringBox.left + ringBox.right) / 2, y: (ringBox.top + ringBox.bottom) / 2}
    const at = (r, deg) => {
      const a = (deg * Math.PI) / 180
      return {x: centre.x + r * k * Math.sin(a), y: centre.y - r * k * Math.cos(a)}
    }
    const xy = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    const card = toUnits(px, box, cards[open].parentElement.getBoundingClientRect())
    const cardLeft = card.left - BAR_GAP
    const clampY = (y) => Math.min(card.bottom - 40, Math.max(card.top + 40, y))
    const angle = open * 60
    const start = at(OUTER + POP, angle)
    // Segments facing the text (top, upper right, lower right): straight across
    if (angle <= 120) {
      return `M${xy(start)} L${cardLeft.toFixed(1)},${clampY(start.y).toFixed(1)}`
    }
    // The far side: out a little, round the outside of the ring to the 60 or
    // 120 degree point, then straight across, so the line never crosses the ring
    const target = angle === 300 ? 60 : 120
    const clockwise = angle === 300 ? 1 : 0
    const out = at(AROUND, angle)
    const end = at(AROUND, target)
    const r = (AROUND * k).toFixed(1)
    return `M${xy(start)} L${xy(out)} A${r},${r} 0 0 ${clockwise} ${xy(end)} L${cardLeft.toFixed(1)},${clampY(end.y).toFixed(1)}`
  }

  // The trail: from the top centre, where The case's trail leaves, curving left to
  // end just after the heading "What we do". The case's trail arrives heading down
  // and to the left (its last control point is 40 left and 35 up from its end), so
  // this one starts in that same direction (80 left, 70 down) and the two read as
  // one continuous line.
  function desktopTrail(px, box) {
    const h = toUnits(px, box, pillarsSection.querySelector('.pillars__heading').getBoundingClientRect())
    const r = document.createRange()
    r.selectNodeContents(pillarsSection.querySelector('.pillars__heading'))
    const text = toUnits(px, box, r.getBoundingClientRect())
    const endX = text.right + 27
    const endY = (h.top + h.bottom) / 2
    return `M720,0 C 640,70 ${(endX + 190).toFixed(1)},${endY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`
  }

  // Straight down the left, in line with The case's trail when that is a single
  // column (the side margin plus 16px, so x 36 on a 390 screen), ending level
  // with the middle of the heading. In drawing units (screen px / scale).
  const caseIsColumn = window.matchMedia('not all and (min-width: 78em)')
  function columnTrail(box, scale) {
    const heading = pillarsSection.querySelector('.pillars__heading').getBoundingClientRect()
    // The case's column trail runs 36px left of its text column, so measure that
    const caseText = document.querySelector('.case__intro')
    const lineX = caseText
      ? caseText.getBoundingClientRect().left - 36
      : pillarsSection.getBoundingClientRect().left + parseFloat(getComputedStyle(pillarsSection).paddingLeft) + 16
    const x = (lineX - box.left) / scale
    const top = (pillarsSection.getBoundingClientRect().top - box.top) / scale
    const end = (heading.top + heading.height / 2 - box.top) / scale
    return `M${x.toFixed(1)},${top.toFixed(1)} L${x.toFixed(1)},${end.toFixed(1)}`
  }

  function draw() {
    const box = stage.getBoundingClientRect()
    drawing.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)
    let d
    if (isDesktop.matches) {
      const px = box.width / 1440
      drawingScale.setAttribute('transform', `scale(${px})`)
      // The open pillar's text block runs from the top of the helper line
      // ("Six pillars that feed into each other...") to the bottom of the ring
      // (its outer edge is 16 of the ring box's 640 above the box's bottom)
      const helper = pillarsSection.querySelector('.pillars__helper--wide').getBoundingClientRect()
      const ringRect = ring.getBoundingClientRect()
      const blockTop = helper.top - box.top
      const blockBottom = ringRect.bottom - (ringRect.width * 16) / 640 - box.top
      cardsBox.style.top = `${blockTop}px`
      cardsBox.style.height = `${blockBottom - blockTop}px`
      // Below 1248px The case is a single column with its trail down the left,
      // so this trail carries straight on down the left, as on phones
      d = caseIsColumn.matches ? columnTrail(box, px) : desktopTrail(px, box)
      // One dot pattern across both sections (a 2-unit dot every 14 units): The
      // case's pattern is shifted so its trail ends in the middle of a gap (8
      // units into the pattern), and this trail starts at that same point. No
      // half dot at the join, and the spacing carries on evenly.
      if (caseTrail) {
        caseTrail.style.strokeDashoffset = String((8 - (caseTrail.getTotalLength() % 14) + 14) % 14)
        trailPath.style.strokeDashoffset = '8'
      }
      connector.setAttribute('d', connectorPath(px, box))
    } else {
      drawingScale.removeAttribute('transform')
      cardsBox.style.top = ''
      cardsBox.style.height = ''
      trailPath.style.strokeDashoffset = ''
      d = columnTrail(box, 1)
      connector.setAttribute('d', '')
    }
    trailPath.setAttribute('d', d)
    trailMask.setAttribute('d', d)
    revealTrail()
  }

  // THE TRAIL DRAWS ITSELF, carrying on from The case's trail at the same pace,
  // and stays drawn once drawn. Nothing is hidden without JavaScript or with
  // reduced motion.
  const trailMask = pillarsSection.querySelector('.pillars__trail-mask')
  const caseTrail = document.getElementById('case-trail')
  const reduceMotionPillars = window.matchMedia('(prefers-reduced-motion: reduce)')
  let trailDrawn = 0

  function revealTrail() {
    if (reduceMotionPillars.matches) {
      trailPath.removeAttribute('mask')
      return
    }
    trailPath.setAttribute('mask', 'url(#pillars-trail-reveal)')
    const box = stage.getBoundingClientRect()
    const length = trailPath.getTotalLength()
    let progress
    if (isDesktop.matches) {
      // The case's trail finishes when its stage's bottom (this stage's top)
      // passes 85% down the screen; this one starts there. The case draws its
      // whole length over its 800-unit-tall stage: use the same length per unit.
      const px = box.width / 1440
      const pace = caseTrail ? caseTrail.getTotalLength() / 800 : 2
      const scrolled = (window.innerHeight * 0.85 - box.top) / px
      progress = (scrolled * pace) / length
    } else {
      // Phones: the tip follows a line 70% down the screen, as in The case
      const top = pillarsSection.getBoundingClientRect().top
      progress = (window.innerHeight * 0.7 - top) / length
    }
    trailDrawn = Math.max(trailDrawn, Math.min(1, Math.max(0, progress)))
    trailMask.style.strokeDashoffset = String(1 - trailDrawn)
  }

  let trailQueued = false
  window.addEventListener('scroll', () => {
    if (!trailQueued) {
      trailQueued = true
      requestAnimationFrame(() => {
        trailQueued = false
        revealTrail()
      })
    }
  }, {passive: true})
  reduceMotionPillars.addEventListener('change', revealTrail)

  // Redraw when anything changes size (screen, fonts loading, text wrapping)
  new ResizeObserver(draw).observe(stage)
  isDesktop.addEventListener('change', draw)

  select(0)
}


// BACK TO TOP
// The arrow fades in once the hero has scrolled completely out of view (its
// bottom edge above the top of the screen). On pages without a hero, such as the
// 404 page, it appears once the page has scrolled one screen down.

const toTop = document.querySelector('.to-top')

if (toTop) {
  const hero = document.querySelector('.hero')

  function updateToTop() {
    const past = hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > window.innerHeight
    toTop.classList.toggle('is-visible', past)
  }

  window.addEventListener('scroll', updateToTop, {passive: true})
  window.addEventListener('resize', updateToTop)
  updateToTop()
}
