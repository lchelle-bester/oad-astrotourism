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
