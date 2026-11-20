// One-off fill of the Impact page (20 Nov 2026), so the editors start from the wording in the
// mock-up instead of an empty form (design in docs/impact/).
//
// The wording is the mock-up's (docs/impact/impact-desktop-1440.png). Every figure carries a source
// that was checked on 20 Nov 2026:
//   - "OAD page": https://astrotourism.astro4dev.org/astrotourism-impact/ (read through a page
//     summary, not word for word, so Joy should check the wording before launch);
//   - "project page": the figure also appears in the project's own text in Sanity, and the figure
//     is linked to that project. A figure is only linked where its project text says it.
// Figures that could not be found in any project text are left unlinked on purpose.
//
// Not set here: the photos. Add them in the Studio (the five files are in originals/impact/, with
// alt text and captions in docs/impact/photo-details.csv). The credits are still unknown; the
// credit field is optional, so leave it empty until they are found.
//
// It never overwrites: if the document already exists it stops. It only prints what it would do
// unless you start it with WRITE=1. It uses your own Sanity login (--with-user-token), so no token
// is ever put in a file. Run it from the studio folder:
//
//   npx sanity exec scripts/fill-impact-page.js --with-user-token            (dry run)
//   WRITE=1 npx sanity exec scripts/fill-impact-page.js --with-user-token    (does it)
//
// In PowerShell the second one is:  $env:WRITE=1; npx sanity exec scripts/fill-impact-page.js --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

let n = 0
const key = () => `k${(++n).toString(36)}${Math.random().toString(36).slice(2, 6)}`
const list = (items) => items.map((item) => ({...item, _key: key()}))

const CHECKED = '2026-11-20'
const OAD_PAGE = 'https://astrotourism.astro4dev.org/astrotourism-impact/'

// The projects a figure can be linked to (their own text says the figure)
const PROJECTS = {
  langkawians: 'project-langkawians-guide-malaysians-to-the-stars',
  workshop2022: 'project-guide-training-workshop-for-tribal-students',
  tatacoa: 'project-the-small-corner-of-the-stars-an-initiative-for-development-of-local-communities-in-la-tatacoa',
}

const projects = await client.fetch('*[_id in $ids]{_id, title, originalUrl}', {ids: Object.values(PROJECTS)})
const byId = Object.fromEntries(projects.map((p) => [p._id, p]))
for (const id of Object.values(PROJECTS)) {
  if (!byId[id]) throw new Error(`The project ${id} is not in Sanity, so its figures cannot be linked.`)
  if (!byId[id].originalUrl) throw new Error(`The project "${byId[id].title}" has no original astro4dev.org page address to use as a source link.`)
}

// A figure that comes from OAD's Impact page
const fromOadPage = (fig, note) => ({
  _type: 'impactStat',
  ...fig,
  sourceText: `OAD, "Impact of Our Astrotourism Projects", astro4dev.org${note ? `. ${note}` : ''}`,
  sourceUrl: OAD_PAGE,
  checkedOn: CHECKED,
})

// A figure that is also in a project's own text: linked to that project, sourced to its page
const fromProject = (fig, projectKey, what) => {
  const p = byId[PROJECTS[projectKey]]
  return {
    _type: 'impactStat',
    ...fig,
    project: {_type: 'reference', _ref: p._id, _weak: true},
    sourceText: `${p.title}, project page on astro4dev.org: ${what}`,
    sourceUrl: p.originalUrl,
    checkedOn: CHECKED,
  }
}

const block = (parts) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: parts.map(([text, highlight]) => ({_type: 'span', _key: key(), text, marks: highlight ? ['highlight'] : []})),
})

const doc = {
  _id: 'impactPage',
  _type: 'impactPage',

  headline: [
    block([
      ['Through OAD’s annual call for proposals, the IAU has invested ', false],
      ['€111,000', true],
      [' in astrotourism projects across ', false],
      ['14 countries', true],
      ['.', false],
    ]),
  ],
  sourceText:
    'OAD, "Impact of Our Astrotourism Projects", astro4dev.org (about 111,000 euros, 14 countries). The homepage says 17 countries, from the June 2026 paper: Joy to confirm which to use.',
  sourceUrl: OAD_PAGE,
  checkedOn: CHECKED,

  chapters: list([
    {
      _type: 'chapter',
      label: 'Tourism',
      heading: 'Night skies became something to offer visitors',
      intro: 'Homestays, resorts and tour companies added stargazing to what they sell.',
      figures: list([
        fromOadPage({value: 680, label: 'travellers took part in astronomy and local culture', place: 'India'}),
        fromProject(
          {value: 7, label: 'tour companies and five-star resorts added astrotourism packages', place: 'Malaysia'},
          'langkawians',
          'outcomes (1) 4 tour companies and (4) 3 five-star resorts, added together by us',
        ),
        fromOadPage({value: 5, label: 'resorts work with astroguides on stargazing packages', place: 'India'}),
      ]),
    },
    {
      _type: 'chapter',
      label: 'Work',
      heading: 'Guiding the night became paid work',
      intro: 'Newly trained guides took visitors to observatories, resorts and village skies, and were paid for it.',
      figures: list([
        fromProject(
          {
            prefix: '₹',
            value: 30000,
            label: "earned at five stargazing events, shared out as tribal students' first income",
            place: 'India · AstroTribe',
          },
          'workshop2022',
          '5 stargazing events raised 30000 INR in revenue, distributed among the tribal students as their first income (the Impact page does not have this figure)',
        ),
        fromProject(
          {value: 5, label: 'observatories partnered with newly trained astroguides to bring in tourists', place: 'Malaysia'},
          'langkawians',
          'outcome (2) 5 observatories partnering with astroguides',
        ),
        fromOadPage({prefix: '$', value: 5200, label: 'in revenue from astrotourism', place: 'India'}),
      ]),
    },
    {
      _type: 'chapter',
      label: 'Skills',
      heading: 'People who learned to share the sky',
      intro: 'Guides, teachers and mentors: the people who keep astrotourism going after a project ends.',
      figures: list([
        fromOadPage(
          {value: 37, label: 'village women and disabled persons trained as astroguides', place: 'India'},
          'The Impact page says 30 village women and 7 disabled persons: added together by us',
        ),
        fromOadPage(
          {value: 17, label: 'students from tribal communities trained as astroguides', place: 'India'},
          "The 2022 workshop's own report says 16 astroguides: Joy to confirm",
        ),
        fromProject(
          {value: 23, label: 'teachers trained to run science clubs around their desert sky', place: 'Colombia'},
          'tatacoa',
          'A total of 23 teachers attended the teacher training sessions in March 2023 (the Impact page does not have this figure)',
        ),
        fromProject(
          {value: 2, label: 'tourism institutes added astronomy to their tourism certificate', place: 'Malaysia'},
          'langkawians',
          'outcome (3) 2 tourism institute/organization introducing astronomy education and tourism syllabus',
        ),
        fromOadPage(
          {value: 72, label: 'mentors from 14 countries supporting the new guides', place: 'India'},
          "The 2022 workshop's own text says 28 mentors from 14 countries: Joy to confirm",
        ),
      ]),
    },
    {
      _type: 'chapter',
      label: 'Places',
      heading: 'Councils and parks are planning for darkness',
      intro: 'Results that outlast a project: local governments and protected areas building astrotourism into their plans.',
      figures: list([
        fromProject(
          {value: 3, label: 'city councils adopted astrotourism', place: 'Malaysia'},
          'langkawians',
          'outcome (5) adoption of astrotourism by 3 city councils (the project text says the third was in progress)',
        ),
        fromProject(
          {value: 2, label: 'astroparks in development', place: 'Malaysia'},
          'langkawians',
          'outcome (6) development of 2 astroparks',
        ),
        fromOadPage({value: 1, label: "observatory now hosts a farmers' market", place: 'US Virgin Islands'}),
      ]),
    },
  ]),
  note: 'All figures as reported by the funded projects to OAD.',

  mapEyebrow: 'Funded projects',
  mapHeading: 'Where the change happened',
}

const existing = await client.fetch('*[_id in ["impactPage", "drafts.impactPage"]]{_id}')
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}`)
if (existing.length) {
  console.log(`The Impact page document already exists (${existing.map((d) => d._id).join(', ')}). Nothing to do: this script never overwrites.`)
} else {
  const figures = doc.chapters.flatMap((c) => c.figures)
  console.log(`Would create: ${doc.chapters.length} chapters, ${figures.length} figures (${figures.filter((f) => f.project).length} linked to a project, ${figures.filter((f) => !f.project).length} not).`)
  for (const c of doc.chapters) {
    console.log(`  Chapter "${c.label}":`)
    for (const f of c.figures) {
      console.log(`    ${f.prefix || ''}${f.value} ${f.label} | ${f.place} | ${f.project ? 'linked: ' + byId[f.project._ref].title : 'no project link'}`)
    }
  }
  if (write) {
    await client.createIfNotExists(doc)
    console.log('Created and published. Open Impact page in the Studio and add the five photos (alt text, caption and credit).')
  } else {
    console.log('To do it, run again with WRITE=1.')
  }
}
