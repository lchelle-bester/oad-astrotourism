// One-off clean-up, 11 Nov 2026: the project's plain "summary" field was removed from the Studio
// (the page content is now the only text of a project). The 20 projects still hold the old text, which
// the Studio would show as an "unknown field". This removes it.
//
//   - A project whose page content has text: the summary is simply removed.
//   - A project with NO page content but a summary: the summary is first turned into page content
//     (one paragraph per blank-line-separated block), then removed. No text is ever lost.
//   - Drafts (the copy someone is editing in the Studio) get the same treatment, so publishing a draft
//     later cannot bring the summary back.
//
// It does nothing but print what it WOULD do, unless you start it with WRITE=1. It uses your own
// Sanity login (--with-user-token), so no token is ever put in a file. Run it from the studio folder:
//
//   npx sanity exec scripts/remove-project-summaries.js --with-user-token            (dry run)
//   WRITE=1 npx sanity exec scripts/remove-project-summaries.js --with-user-token    (does it)
//
// In PowerShell the second one is:  $env:WRITE=1; npx sanity exec scripts/remove-project-summaries.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

const key = () => Math.random().toString(36).slice(2, 10)
const toBlocks = (summary) =>
  summary
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({_type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{_type: 'span', _key: key(), text, marks: []}]}))

const docs = await client.fetch(
  '*[_type == "project" && defined(summary)]{_id, title, summary, "bodyBlocks": count(body[_type == "block"]), "hasBody": count(body) > 0}',
)
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}: ${docs.length} project document(s) still have a summary\n`)

let moved = 0
let removed = 0
for (const doc of docs) {
  const kind = doc._id.startsWith('drafts.') ? 'draft    ' : 'published'
  if (doc.hasBody) {
    console.log(`${kind} | remove summary           | ${doc.title}`)
    if (write) await client.patch(doc._id).unset(['summary']).commit()
    removed++
  } else {
    const blocks = toBlocks(doc.summary || '')
    if (!blocks.length) {
      console.log(`${kind} | no page content and an empty summary, only removing the summary | ${doc.title}`)
      if (write) await client.patch(doc._id).unset(['summary']).commit()
      removed++
      continue
    }
    console.log(`${kind} | MOVE summary into page content (${blocks.length} paragraphs), then remove it | ${doc.title}`)
    if (write) await client.patch(doc._id).set({body: blocks}).unset(['summary']).commit()
    moved++
  }
}

console.log(`\n${write ? 'Done' : 'Would do'}: ${removed} removed, ${moved} moved into page content first.`)
if (write) {
  const left = await client.fetch('count(*[_type == "project" && defined(summary)])')
  console.log(`Project documents still holding a summary: ${left}`)
} else {
  console.log('Nothing was changed. To do it, run again with WRITE=1.')
}
