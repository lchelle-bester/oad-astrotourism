// One-off clean-up, 25 Nov 2026: the "Place" and "Project it came from" fields were removed from the
// figures of the Impact page (the page shows only the number and the sentence). The 14 figures
// still hold the old values, which the Studio would show as "unknown fields". This removes them.
//
// Only those two fields are removed, from every figure of the published page and of any draft.
// The figure's number, sentence and source are not touched. (Some sources name a project page, for
// example "..., project page on astro4dev.org"; they are never shown, so they stay as they are.)
//
// It does nothing but print what it WOULD do, unless you start it with WRITE=1. It uses your own
// Sanity login (--with-user-token), so no token is ever put in a file. Run it from the studio folder:
//
//   npx sanity exec scripts/remove-impact-figure-places.js --with-user-token            (dry run)
//   WRITE=1 npx sanity exec scripts/remove-impact-figure-places.js --with-user-token    (does it)
//
// In PowerShell the second one is:  $env:WRITE=1; npx sanity exec scripts/remove-impact-figure-places.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

const docs = await client.fetch(
  '*[_type == "impactPage"]{_id, chapters[]{_key, figures[]{_key, label, place, "hasProject": defined(project)}}}',
)
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}: ${docs.length} Impact page document(s) (published and drafts)\n`)

let figures = 0
for (const doc of docs) {
  const kind = doc._id.startsWith('drafts.') ? 'draft    ' : 'published'
  const paths = []
  for (const chapter of doc.chapters || []) {
    for (const figure of chapter.figures || []) {
      const has = []
      if (figure.place !== undefined && figure.place !== null) {
        paths.push(`chapters[_key=="${chapter._key}"].figures[_key=="${figure._key}"].place`)
        has.push(`place "${figure.place}"`)
      }
      if (figure.hasProject) {
        paths.push(`chapters[_key=="${chapter._key}"].figures[_key=="${figure._key}"].project`)
        has.push('project link')
      }
      if (has.length) {
        figures++
        console.log(`${kind} | ${has.join(' + ')} | ${figure.label}`)
      }
    }
  }
  if (write && paths.length) await client.patch(doc._id).unset(paths).commit()
}

console.log(`\n${write ? 'Done' : 'Would do'}: place and project removed from ${figures} figure(s).`)
if (write) {
  const left = await client.fetch('count(*[_type == "impactPage"].chapters[].figures[defined(place) || defined(project)])')
  console.log(`Figures still holding a place or a project: ${left}`)
} else {
  console.log('Nothing was changed. To do it, run again with WRITE=1.')
}
