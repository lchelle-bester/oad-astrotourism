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
