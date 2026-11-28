// One-off fill of the Global Survey Report page (Phase 12, 28 Nov 2026), so the editors start from the wording in
// L'chelle's mock-ups instead of an empty form (design in docs/survey-report/).
//
// The NUMBERS are not here: the page counts the "Survey response" documents (import them first with
// scripts/import-survey-responses.js, or type them in the Studio). This only fills the wording.
//
// The wording is the mock-up's, with three differences:
//  - the sentence under the last heading has no "interactive map" (L'chelle, 27 Nov 2026: that page is not in the sitemap);
//  - the sustainability note ("That fits a group made up largely of tourism businesses, observatories and
//    planetariums.") is left OUT: it is a claim about the counts that nobody has checked against the real
//    responses, and the page already writes "Most already are, or hope to be soon." from the counts. Add it in the
//    Studio if it is true of the real numbers;
//  - the survey form address is not in any OAD page I could find, so YOU give it: SURVEY_URL (see below).
// The "Who they work with" paragraph is not counted from the responses (the import has no partner column), so it is
// the mock-up's wording, which matches OAD's own current report page ("the main partners"). Joy should confirm it.
//
// It never overwrites: if the document already exists it stops. It only prints what it would do unless you start
// it with WRITE=1. It uses your own Sanity login (--with-user-token), so no token is ever put in a file. Run it from
// the studio folder. In PowerShell:
//
//   $env:SURVEY_URL="https://forms.gle/the-real-address"
//   npx sanity exec scripts/fill-survey-report-page.js --with-user-token            (dry run)
//   $env:WRITE=1; npx sanity exec scripts/fill-survey-report-page.js --with-user-token    (does it)
//
// The address is needed because the page's button goes there and the build stops if it is missing, so this script
// will not create the page without it.
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})
const write = process.env.WRITE === '1'

const surveyUrl = (process.env.SURVEY_URL || '').trim()
if (!/^https:\/\/\S+$/.test(surveyUrl)) {
  console.log('I need the address of the survey form, starting with https://. In PowerShell:  $env:SURVEY_URL="https://..."   and run again.')
  process.exit(1)
}

const doc = {
  _id: 'surveyReportPage',
  _type: 'surveyReportPage',

  intro: 'What astrotourism initiatives around the world told us about who they are, what they offer and how they keep going.',
  statusLine: 'The survey is still open, and the results update as new answers come in. Thank you to everyone who has taken part.',
  surveyUrl,
  buttonLabel: 'Take the survey',

  responsesNote:
    'This shows where the people who found the survey are, not where astrotourism exists. Taking part was voluntary, so the results depend on how far the survey reached and who chose to answer.',
  groupingNote:
    'Astrotourism brings together tourism and science, so we sorted the answers into groups. Observatories and planetariums are common in astronomy. Tourism businesses lead the tourism side. National astrotourism strategies capture efforts driven by governments, and passion projects are run by people who love the sky and want to share it.',
  offersNote: 'Each initiative could choose more than one, so each bar shows the share of them.',
  sustainabilityIntro:
    'Astrotourism is still a niche form of tourism. Many initiatives are self-funded or depend on outside funding, so we asked whether they are financially self-sustaining.',
  partnersText:
    'Partnerships, local or international, give support, share knowledge and let projects learn from each other. The most common partners are other tourism businesses, then NGOs, then local governments or municipalities.',

  ctaHeading: 'Run an astrotourism initiative?',
  ctaText: 'Take the short survey to be counted here.',

  sourceText: 'Responses to the astrotourism initiatives survey, validated before being entered, imported from the survey sheet on 28 Nov 2026',
  checkedOn: '2026-11-28',
}

const existing = await client.fetch('*[_id in ["surveyReportPage", "drafts.surveyReportPage"]]{_id}')
console.log(`${write ? 'WRITING' : 'DRY RUN (nothing is changed)'}`)
if (existing.length) {
  console.log(`The Global Survey Report page document already exists (${existing.map((d) => d._id).join(', ')}). Nothing to do: this script never overwrites.`)
} else {
  console.log(`Would create the page with the survey form address ${surveyUrl} and ${Object.keys(doc).length - 2} fields of wording.`)
  if (write) {
    await client.createIfNotExists(doc)
    console.log('Created and published. Open Pages, Global Survey Report page in the Studio to read it over. Add the sustainability note there only if it is true of the real counts.')
  } else {
    console.log('To do it, run again with WRITE=1.')
  }
}
