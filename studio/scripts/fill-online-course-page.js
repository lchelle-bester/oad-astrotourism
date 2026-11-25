// One-off fill of the Online course page (25 Nov 2026), so the editors start from the wording in
// L'chelle's mock-ups instead of an empty form (design in docs/online-course/).
//
// The wording is the mock-up's, with ten modules (L'chelle chose to add "Introduction to Astronomy",
// 25 Nov 2026, because the real course on OpenLearn Create has it) and the fourth fact tile called
// "Statement of Participation" instead of "Certificate" (L'chelle's choice, the real name). The facts were
// checked on 25 Nov 2026 against the real course (https://www.open.edu/openlearncreate/course/view.php?id=16594,
// updated 12/11/2025) and OAD's own page (https://astrotourism.astro4dev.org/?p=31151): 24 hours of
// study, "Level 1: Introductory", free with a free account, a free Statement of Participation, hosted by
// The Open University on OpenLearn Create, five outcomes, a quiz that unlocks the next module.
// NOT found on either page, kept from the mock-up for Ram and Joy to confirm: "at your own pace" and
// "start at any time", "no fees", the part names "Foundations" and "Finishing the course", and the
// sentence about the assignment (step 4 says completing the course earns the Statement, as the real page
// does, instead of the mock-up's "after the assignment").
//
// Not set here: the photo (add it in the Studio with alt text and credit) and the preview video (no video
// exists on either real page; paste its YouTube link in the Studio when L'chelle has it).
//
// It never overwrites: if the document already exists it stops. It only prints what it would do
// unless you start it with WRITE=1. It uses your own Sanity login (--with-user-token), so no token
// is ever put in a file. Run it from the studio folder:
//
//   npx sanity exec scripts/fill-online-course-page.js --with-user-token            (dry run)
//   WRITE=1 npx sanity exec scripts/fill-online-course-page.js --with-user-token    (does it)
//
// In PowerShell the second one is:  $env:WRITE=1; npx sanity exec scripts/fill-online-course-page.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

let n = 0
const key = () => `k${(++n).toString(36)}${Math.random().toString(36).slice(2, 6)}`
const list = (items) => items.map((item) => ({...item, _key: key()}))
const module = (title, topics) => ({_type: 'module', title, topics})

const doc = {
  _id: 'onlineCoursePage',
  _type: 'onlineCoursePage',

  intro: 'A free online course for guides, individuals and tourism businesses who want to share the night sky.',
  courseUrl: 'https://www.open.edu/openlearncreate/course/view.php?id=16594',
  buttonLabel: 'Start the free course',
  hostedLine: 'Hosted by The Open University on OpenLearn Create.',
  facts: list([
    {_type: 'fact', strong: '24 hours', small: 'of study, at your own pace'},
    {_type: 'fact', strong: 'Free', small: 'no fees, a free account'},
    {_type: 'fact', strong: 'Introductory', small: 'no science background needed'},
    {_type: 'fact', strong: 'Statement of Participation', small: 'free, on completion'},
  ]),

  outcomes: [
    'Read the night sky and understand foundational astronomy',
    'Share the cultural stories people tell about the stars',
    'Run eco-friendly astrotourism that protects dark skies',
    'Plan and run safe, engaging night sky tours',
    'Bring it together and show what you can do',
  ],

  parts: list([
    {
      _type: 'part',
      title: 'Foundations',
      modules: list([
        module('Office of Astronomy for Development', ['Global footprint', 'Impact and scale', 'Astronomy and the SDGs', 'Key themes']),
        module('Introduction to Astronomy', ['The large-scale universe', 'The local universe', 'The solar system', 'Basic astronomical definitions', 'Telescopes and the electromagnetic spectrum']),
        module('Introduction to Astrotourism', ['What astrotourism is', 'Astrotourism pillars', 'How astronomy enriches tourism', 'Famous destinations', 'Key words']),
      ]),
    },
    {
      _type: 'part',
      title: 'Reading the night sky',
      modules: list([
        module('Stars, constellations and navigation', ['What stars are', 'Recognising major constellations', 'Finding your way', 'Seasonal changes', 'Indigenous star patterns', 'Celestial events']),
        module('Stargazing tools and techniques', ['Naked-eye astronomy', 'Smartphone apps', 'Binoculars', 'Telescopes']),
        module('Cultural and mythological astronomy', ['Myths and legends', 'Indigenous astronomical knowledge', 'Using stories in tours, ethically']),
      ]),
    },
    {
      _type: 'part',
      title: 'Designing an astrotourism experience',
      modules: list([
        module('Light pollution and responsible tourism', ['Light pollution and its impacts', 'Dark-sky-friendly lighting', 'Eco-friendly tourism']),
        module('Planning and running a night sky tour', ['Assessing conditions', 'Watching the weather', 'Choosing an activity', 'Logistics', 'Safety at night']),
      ]),
    },
    {
      _type: 'part',
      title: 'Finishing the course',
      modules: list([
        module('Monitoring and evaluation', ['Key terms', 'Types of evaluation', 'Why evaluate', 'Constraints']),
        module('Course assignment', ['Design a mock astrotourism initiative of your own']),
      ]),
    },
  ]),

  steps: list([
    {_type: 'step', title: 'Create a free account', text: "Sign up on OpenLearn Create, The Open University's free learning site."},
    {_type: 'step', title: 'Enrol and start', text: 'Press Enrol on the course page. You can start at any time.'},
    {_type: 'step', title: 'Work through the modules', text: 'Each module ends with a short quiz that opens the next one.'},
    {_type: 'step', title: 'Finish the assignment', text: 'Design a mock initiative. Completing the course earns your free Statement of Participation.'},
  ]),

  sourceText: "OpenLearn Create course page (open.edu/openlearncreate/course/view.php?id=16594, updated 12/11/2025) and OAD's own course page (astrotourism.astro4dev.org/?p=31151), read on 25 Nov 2026",
  checkedOn: '2026-11-25',
}

const existing = await client.fetch('*[_id in ["onlineCoursePage", "drafts.onlineCoursePage"]]{_id}')
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}`)
if (existing.length) {
  console.log(`The Online course page document already exists (${existing.map((d) => d._id).join(', ')}). Nothing to do: this script never overwrites.`)
} else {
  const modules = doc.parts.flatMap((p) => p.modules)
  console.log(`Would create: ${doc.facts.length} facts, ${doc.outcomes.length} outcomes, ${doc.parts.length} parts with ${modules.length} modules, ${doc.steps.length} steps.`)
  for (const p of doc.parts) console.log(`  ${p.title}: ${p.modules.map((m) => m.title).join(' | ')}`)
  if (write) {
    await client.createIfNotExists(doc)
    console.log('Created and published. Open Online course page in the Studio, add the photo (alt text and credit) and the YouTube link of the preview video.')
  } else {
    console.log('To do it, run again with WRITE=1.')
  }
}
