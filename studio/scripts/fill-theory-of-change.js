// One-off fill of the Theory of Change page (19 Nov 2026), so the editors start from the
// wording in the mock-up instead of an empty form (design in docs/theory-of-change/).
//
// The wording is the mock-up's (docs/theory-of-change/Desktop 1440 (tinted rows)@2x.png, and the
// screenshots of the open assumptions panel and of the three open pathway rows). The full wording
// of each stage is the mock-up's, a light rewording of OAD's diagram.
//
// It never overwrites: if the document already exists it stops. It only prints what it would do
// unless you start it with WRITE=1. It uses your own Sanity login (--with-user-token), so no token
// is ever put in a file. Run it from the studio folder:
//
//   npx sanity exec scripts/fill-theory-of-change.js --with-user-token            (dry run)
//   WRITE=1 npx sanity exec scripts/fill-theory-of-change.js --with-user-token    (does it)
//
// In PowerShell the second one is:  $env:WRITE=1; npx sanity exec scripts/fill-theory-of-change.js --with-user-token
//
// The diagram file is not set here: upload it in the Studio ("The diagram (for download)").
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

let n = 0
const key = () => `k${(++n).toString(36)}${Math.random().toString(36).slice(2, 6)}`
// Items that are objects need a _key; arrays of plain strings do not
const list = (items) => items.map((item) => ({...item, _key: key()}))
const strings = (items) => items

const doc = {
  _id: 'theoryOfChange',
  _type: 'theoryOfChange',
  intro:
    'How OAD expects its astrotourism work to create jobs, new businesses and darker skies, in five steps from the problem to the impact.',

  problemFigure: '4.9%',
  problemText: 'is the projected global unemployment rate for 2026, about 186 million people out of work.',
  sourceName: 'International Labour Organization, Employment and Social Trends 2026',
  sourceUrl: 'https://www.ilo.org/publications/flagship-reports/employment-and-social-trends-2026',
  sourceDate: 'January 2026',
  checkedOn: '2026-11-19',
  peopleTotal: 20,
  peopleHighlighted: 1,
  peopleLineBefore: 'That is nearly',
  peopleLineBold: '1 in every 20',
  peopleLineAfter: "people in the world's labour force.",

  audience: {
    items: strings([
      'Unemployed people in rural, semi-urban and urban areas with astrotourism potential',
      'Under-employed tourism workers',
      'Existing tourism businesses and tourism companies',
    ]),
    assumes:
      'Existing tourism businesses want to add to what they offer, and unemployed people in these areas want to start businesses.',
  },
  stakeholders: {
    items: strings([
      'Observatories, ROADs, IAU offices, and the wider astronomy and dark sky conservation community',
      'Tourism ministries and government institutions',
      'NGOs working with rural communities, and capacity-building programmes',
      'Funders and investors',
      'Trainers and programme facilitators',
      'Tourism aggregators and promoters, such as Booking.com',
    ]),
    assumes:
      'Observatories are interested in community development, astrotourism policies and strategies exist or will be developed, and the astronomy and dark sky community will champion astrotourism.',
  },

  pathways: list([
    {
      _type: 'pathway',
      name: 'Train the trainers',
      activityShort: 'Train people who will teach astrotourism in their communities',
      activityFull:
        'Provide training to trainers who can then pass the knowledge on to communities, and/or recorded training, for example testing online resources.',
      outputShort: 'Number of trainers trained',
      outputFull: 'Number of trainers trained.',
      outcomeShort: 'More awareness, and more capacity to teach astrotourism skills',
      outcomeFull: 'Widespread awareness, and a larger capacity to upskill people in astrotourism around the world.',
    },
    {
      _type: 'pathway',
      name: 'Resources for businesses',
      activityShort: 'Develop and share resources, funding and workshops',
      activityFull: 'Develop and share resources (funding, support, workshops and more) that make astrotourism businesses possible.',
      outputShort: 'Number of resources used and workshops held',
      outputFull: 'Number of resources developed and used, and number of training workshops held around the world.',
      outcomeShort: 'New astrotourism businesses',
      outcomeFull: 'New astrotourism businesses in rural, semi-urban and urban areas.',
    },
    {
      _type: 'pathway',
      name: 'A global network',
      activityShort: 'Build a global network, including observatories and ambassadors',
      activityFull:
        'Establish and nurture a global astrotourism network (including observatories) and a network of trained astrotourism ambassadors.',
      outputShort: 'Number of active members',
      outputFull:
        'Number of active members from different communities (funders, ambassadors, observatories, the astrotourism community and others).',
      outcomeShort: 'New opportunities through the finance and tourism sectors',
      outcomeFull:
        'New opportunities for astrotourism businesses through collaboration with the financial and tourism sectors, and wider awareness of astrotourism as a viable business.',
    },
  ]),
  // From the mock-up's open "assumptions behind each stage" panel (19 Nov 2026)
  activitiesAssumptions: strings([
    "Trainers will be able to run high-quality, effective trainings for the target audience using OAD's resources and support.",
    'Funders and investors will be interested in funding such initiatives.',
    'An astrotourism network will help the industry share best practice.',
  ]),
  outputsAssumptions: strings([
    'More trained trainers will lead to wider reach and spread of astrotourism skills.',
    'Lack of funding is a barrier to starting an astrotourism business.',
    'A database of funders and investors will help match people to the right opportunities.',
  ]),
  outcomesAssumptions: strings([
    'The resources and trainings will help build astrotourism and business skills.',
    'Working across disciplines will make astrotourism more effective and reach further.',
    'New businesses will lead to economic growth and development.',
  ]),

  goals: list([
    {
      _type: 'goal',
      sdg: 8,
      target: 9,
      main: true,
      text: 'By 2030, devise and implement policies to promote sustainable tourism that creates jobs and promotes local culture and products.',
      indicatorCode: '8.9.1',
      indicatorText: 'tourism direct GDP as a proportion of total GDP and in growth rate',
    },
    {
      _type: 'goal',
      sdg: 10,
      target: 2,
      main: false,
      text: 'By 2030, empower and promote the social, economic and political inclusion of all, irrespective of age, sex, disability, race, ethnicity, origin, religion or economic or other status.',
      indicatorCode: '10.2.1',
      indicatorText: 'proportion of people living below 50 per cent of median income, by sex, age and persons with disabilities',
    },
    {
      _type: 'goal',
      sdg: 15,
      main: false,
      text: 'Astrotourism promotes reducing light pollution to access dark skies, which safeguards nocturnal wildlife and natural habitats. By fostering responsible stargazing and minimising artificial light, it helps preserve local ecosystems and biodiversity.',
    },
  ]),

  impactText:
    'Increased entrepreneurship and employment opportunities, along with a growing awareness of sustainable practices, are driving positive change, including improvements in light management, reducing light pollution and promoting more efficient use of resources.',
  impactButton: {
    label: 'See the results so far on the Impact page',
    page: '/projects/impact/',
  },
}

const existing = await client.fetch('*[_id in ["theoryOfChange", "drafts.theoryOfChange"]]{_id}')
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}`)
if (existing.length) {
  console.log(`The Theory of Change document already exists (${existing.map((d) => d._id).join(', ')}). Nothing to do: this script never overwrites.`)
} else {
  console.log(
    `Would create: ${doc.pathways.length} pathways, ${doc.audience.items.length} audience items, ${doc.stakeholders.items.length} partners, ${doc.goals.length} goals.`,
  )
  if (write) {
    await client.createIfNotExists(doc)
    console.log('Created and published. Open Theory of Change page in the Studio, and upload the diagram file.')
  } else {
    console.log('To do it, run again with WRITE=1.')
  }
}
