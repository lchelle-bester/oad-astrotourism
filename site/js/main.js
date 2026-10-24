// OAD Astrotourism: main.js


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
