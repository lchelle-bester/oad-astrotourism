// The rules for the links editors paste into the YouTube and Spotify blocks of a news
// post: one file, so the Studio (which checks the link) and the build (which makes the
// embed address) always agree (moved here from post.js on 6 Nov 2026, so the build can
// load it: it is a .mjs file with no imports).

// The video id (11 letters, numbers, - or _) from a YouTube link, or null if
// the link is not a YouTube video. Accepts youtube.com/watch?v=..., youtu.be/...,
// youtube.com/shorts/..., youtube.com/embed/... and youtube.com/live/....
// The build will use the same rule to find the video.
export function youtubeId(url) {
  const match = String(url).match(
    /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})(?:[?&#/].*)?$/,
  )
  // "videoseries" (youtube.com/embed/videoseries?list=...) is the playlist player,
  // and is also exactly 11 letters, so it must not be taken for a video id
  return match && match[1] !== 'videoseries' ? match[1] : null
}

// A YouTube playlist link (added 30 Oct 2026): youtube.com/playlist?list=...,
// youtube.com/watch?list=... with no video in it, or youtube.com/embed/videoseries?list=....
// Returns the playlist id, or null. A link to one video that also carries a list=
// (youtube.com/watch?v=...&list=...) is treated as the single video, not the playlist:
// to embed the playlist, paste the address of the playlist page itself.
export function youtubePlaylistId(url) {
  if (youtubeId(url)) return null
  const match = String(url).match(
    /^https?:\/\/(?:www\.|m\.)?youtube\.com\/(?:playlist|watch|embed\/videoseries)\?(?:.*&)?list=([\w-]{13,64})(?:&.*)?$/,
  )
  return match ? match[1] : null
}

// What a YouTube link points to: {kind: 'video' or 'playlist', id}, or null.
export function youtubeSource(url) {
  const video = youtubeId(url)
  if (video) return {kind: 'video', id: video}
  const playlist = youtubePlaylistId(url)
  return playlist ? {kind: 'playlist', id: playlist} : null
}

// The part of a Spotify link the player needs, such as "episode/4rOoJ6Egrf8K2IrywzwOMk",
// or null if the link is not a Spotify one. Accepts open.spotify.com links for an
// episode, show, track, album or playlist, also with a language prefix such as
// /intl-de/ and with ?si=... on the end.
export function spotifyPath(url) {
  const match = String(url).match(
    /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(episode|show|track|album|playlist)\/([A-Za-z0-9]{22})(?:[?#/].*)?$/,
  )
  return match ? `${match[1]}/${match[2]}` : null
}
