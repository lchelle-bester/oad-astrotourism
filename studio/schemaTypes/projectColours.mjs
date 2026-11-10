// The solid colours a directory card can have when its project has no photo (decided
// 10 Nov 2026: the editor picks one of the six brand colours, so a project's colour
// never changes). The card's dark fade on the left stays in both cases, so the white
// title and sand text always sit on navy and their contrast does not depend on the
// colour. The values are the brand colours in CLAUDE.md. The directory page (built
// later in this phase) must use the same table: value to hex.
export const projectColours = [
  {title: 'Deep teal', value: 'teal', hex: '#1a524b'},
  {title: 'Terracotta', value: 'terracotta', hex: '#af5a4c'},
  {title: 'Sand', value: 'sand', hex: '#d9b487'},
  {title: 'Sage', value: 'sage', hex: '#72896b'},
  {title: 'Yellow', value: 'yellow', hex: '#f9c434'},
  {title: 'Deep navy', value: 'navy', hex: '#1e3551'},
]
