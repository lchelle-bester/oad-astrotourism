// The colours an editor can give an article button (decided 30 Oct 2026): the
// site's brand colours only, each with a text colour that is readable on it,
// so an editor can never make unreadable text. Contrast (checked against the
// palette in CLAUDE.md): dark navy #0f1b2b on yellow 10.7:1, on sand 8.9:1, on
// white 17.3:1; white on teal 8.9:1, on terracotta 4.8:1.
// The article pages (next phase) must use the same table: value to hex and ink.
export const buttonColours = [
  {title: 'Yellow', value: 'yellow', hex: '#f9c434', ink: '#0f1b2b'},
  {title: 'Sand', value: 'sand', hex: '#d9b487', ink: '#0f1b2b'},
  {title: 'White', value: 'white', hex: '#ffffff', ink: '#0f1b2b'},
  {title: 'Teal', value: 'teal', hex: '#1a524b', ink: '#ffffff'},
  {title: 'Terracotta', value: 'terracotta', hex: '#af5a4c', ink: '#ffffff'},
]

export const buttonAlignments = [
  {title: 'Left', value: 'left'},
  {title: 'Centre', value: 'center'},
  {title: 'Right', value: 'right'},
]
