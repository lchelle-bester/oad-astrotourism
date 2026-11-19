// One-off fix, 19 Nov 2026: the first fill of the Theory of Change page used OAD's diagram wording for
// the "full wording" of each pathway stage and for the "assumptions behind each stage". The mock-up
// has its own, lightly reworded text for both (screenshots of the open rows and the open panel).
// This replaces ONLY those: the nine full wordings of the three pathways and the three assumption
// lists. Names, short wordings, goals, the figure and everything else are left alone.
//
// It does nothing but print what it would do, unless you start it with WRITE=1:
//
//   npx sanity exec scripts/update-toc-wording.js --with-user-token            (dry run)
//   $env:WRITE=1; npx sanity exec scripts/update-toc-wording.js --with-user-token    (does it, PowerShell)
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

const pathwayFull = [
  {
    activityFull:
      'Provide training to trainers who can then pass the knowledge on to communities, and/or recorded training, for example testing online resources.',
    outputFull: 'Number of trainers trained.',
    outcomeFull: 'Widespread awareness, and a larger capacity to upskill people in astrotourism around the world.',
  },
  {
    activityFull: 'Develop and share resources (funding, support, workshops and more) that make astrotourism businesses possible.',
    outputFull: 'Number of resources developed and used, and number of training workshops held around the world.',
    outcomeFull: 'New astrotourism businesses in rural, semi-urban and urban areas.',
  },
  {
    activityFull:
      'Establish and nurture a global astrotourism network (including observatories) and a network of trained astrotourism ambassadors.',
    outputFull:
      'Number of active members from different communities (funders, ambassadors, observatories, the astrotourism community and others).',
    outcomeFull:
      'New opportunities for astrotourism businesses through collaboration with the financial and tourism sectors, and wider awareness of astrotourism as a viable business.',
  },
]

const assumptions = {
  activitiesAssumptions: [
    "Trainers will be able to run high-quality, effective trainings for the target audience using OAD's resources and support.",
    'Funders and investors will be interested in funding such initiatives.',
    'An astrotourism network will help the industry share best practice.',
  ],
  outputsAssumptions: [
    'More trained trainers will lead to wider reach and spread of astrotourism skills.',
    'Lack of funding is a barrier to starting an astrotourism business.',
    'A database of funders and investors will help match people to the right opportunities.',
  ],
  outcomesAssumptions: [
    'The resources and trainings will help build astrotourism and business skills.',
    'Working across disciplines will make astrotourism more effective and reach further.',
    'New businesses will lead to economic growth and development.',
  ],
}

// Both the published page and a draft (someone editing in the Studio), if there is one
const docs = await client.fetch('*[_id in ["theoryOfChange", "drafts.theoryOfChange"]]{_id, "paths": count(pathways)}')
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}: ${docs.length} document(s) found`)
if (!docs.length) console.log('No Theory of Change document found: run fill-theory-of-change.js first.')

for (const doc of docs) {
  if (doc.paths !== 3) {
    console.log(`${doc._id}: has ${doc.paths} pathways instead of 3, so it was left alone. Edit it in the Studio.`)
    continue
  }
  const set = {...assumptions}
  pathwayFull.forEach((p, i) => {
    for (const [field, value] of Object.entries(p)) set[`pathways[${i}].${field}`] = value
  })
  console.log(`${doc._id}: replace ${Object.keys(set).length} fields (9 full wordings, 3 assumption lists)`)
  if (write) await client.patch(doc._id).set(set).commit()
}
if (docs.length) console.log(write ? 'Done.' : 'To do it, run again with WRITE=1.')
