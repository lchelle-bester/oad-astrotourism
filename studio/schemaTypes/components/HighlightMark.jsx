// How the "Highlight" mark looks inside the Studio's editor (added 25 Nov 2026, L'chelle): the words
// that will show in yellow on the Impact page banner are drawn like a highlighter pen, so an editor
// sees at once which words are marked. On the site the words are yellow text (#f9c434) on the dark
// banner; here the yellow is the background and the text is dark navy (#0f1b2b, 10.7:1 on it), because
// yellow text would be unreadable on the Studio's light background (and the highlighter look works in
// the dark theme too). It is only a picture in the editor: the stored data is unchanged.
export const HighlightMark = (props) => (
  <span
    style={{
      backgroundColor: '#f9c434',
      color: '#0f1b2b',
      borderRadius: '3px',
      padding: '0.05em 0.2em',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
    }}
  >
    {props.children}
  </span>
)
