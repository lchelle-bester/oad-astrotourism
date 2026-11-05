// How the two subheading styles look inside the Studio's editor. Sanity's
// default is large; these are a little smaller. The site's own styling of
// subheadings comes with the article pages.
export const SubheadingH2 = (props) => <span style={{fontSize: '1.2em', fontWeight: 600}}>{props.children}</span>
export const SubheadingH3 = (props) => <span style={{fontSize: '1.05em', fontWeight: 600}}>{props.children}</span>

// How the Quote style looks in the editor (added 30 Oct 2026): indented, italic,
// with a yellow bar down the left, so an editor sees at once which paragraphs
// are quotes. The site's own styling comes with the article pages.
export const QuoteStyle = (props) => (
  <span
    style={{
      display: 'block',
      padding: '0.15em 0 0.15em 1em',
      borderLeft: '4px solid #f9c434',
      fontSize: '1.1em',
      fontStyle: 'italic',
    }}
  >
    {props.children}
  </span>
)
