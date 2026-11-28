import {defineField, defineType} from 'sanity'

// The Global Survey Report page (/projects/survey-report/), Phase 12, 27 Nov 2026 (design in
// docs/survey-report/, from L'chelle's two mock-ups). There is only one, so it is a single document.
//
// The NUMBERS are not here: the page counts the "Survey response" documents (studio/schemaTypes/
// surveyResponse.js) and works out the totals, shares, charts and map itself, so a new response is
// just a new document. What is here is the wording an editor may want to change, and the link to the
// survey form. Fixed in the page: the title, the section headings and their small labels, and the
// sentences that name the biggest groups (they are worked out from the counts, so they can never say
// something the numbers do not, which OAD's own report page warns can happen).

const required = (what) => (Rule) => Rule.required().error(`Add ${what}.`)

export const surveyReportPage = defineType({
  name: 'surveyReportPage',
  title: 'Global Survey Report page',
  type: 'document',
  groups: [
    {name: 'top', title: 'Top of the page', default: true},
    {name: 'notes', title: 'Notes under the charts'},
    {name: 'end', title: 'End of the page'},
  ],
  fields: [
    // ---- Top
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      group: 'top',
      description: 'Under the page title, for example "What astrotourism initiatives around the world told us about who they are, what they offer and how they keep going."',
      validation: (Rule) => [required('the introduction')(Rule), Rule.max(220).warning('A shorter introduction fits the layout better.')],
    }),
    defineField({
      name: 'statusLine',
      title: 'Line above the survey button',
      type: 'text',
      rows: 2,
      group: 'top',
      description: 'For example "The survey is still open, and the results update as new answers come in. Thank you to everyone who has taken part."',
      validation: required('the line'),
    }),
    defineField({
      name: 'surveyUrl',
      title: 'Survey form address',
      type: 'url',
      group: 'top',
      description: 'Where "Take the survey" goes: the address of the survey form. Both buttons use it.',
      validation: (Rule) => Rule.required().uri({scheme: ['https']}).error('Add the full address, starting with https://.'),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button words',
      type: 'string',
      group: 'top',
      description: 'For example "Take the survey". The page adds the arrow.',
      validation: (Rule) => [required('the button words')(Rule), Rule.max(30).warning('Shorter button words fit better.')],
    }),

    // ---- Notes under the charts
    defineField({
      name: 'responsesNote',
      title: 'Where the answers come from: note',
      type: 'text',
      rows: 4,
      group: 'notes',
      description: 'Under the sentence the page writes itself ("Most answers so far come from ..."). For example "This shows where the people who found the survey are, not where astrotourism exists. Taking part was voluntary, so the results depend on how far the survey reached and who chose to answer."',
      validation: required('the note'),
    }),
    defineField({
      name: 'groupingNote',
      title: 'Who runs them: "How we grouped the answers"',
      type: 'text',
      rows: 6,
      group: 'notes',
      description: 'The text that opens under "How we grouped the answers".',
      validation: required('the text'),
    }),
    defineField({
      name: 'offersNote',
      title: 'What they offer: note',
      type: 'text',
      rows: 3,
      group: 'notes',
      description: 'Under the sentence the page writes itself. For example "Each initiative could choose more than one, so each bar shows the share of them."',
      validation: required('the note'),
    }),
    defineField({
      name: 'sustainabilityIntro',
      title: 'Can they pay their own way: first paragraph',
      type: 'text',
      rows: 4,
      group: 'notes',
      description: 'For example "Astrotourism is still a niche form of tourism. Many initiatives are self-funded or depend on outside funding, so we asked whether they are financially self-sustaining."',
      validation: required('the paragraph'),
    }),
    defineField({
      name: 'sustainabilityNote',
      title: 'Can they pay their own way: note after the sentence the page writes',
      type: 'text',
      rows: 3,
      group: 'notes',
      description: 'The page writes "Most already are, or hope to be soon." from the counts; this comes after it, for example "That fits a group made up largely of tourism businesses, observatories and planetariums." Leave it empty if the numbers change and it is no longer true.',
    }),
    defineField({
      name: 'partnersText',
      title: 'Who they work with',
      type: 'text',
      rows: 5,
      group: 'notes',
      description: 'The paragraph under "Who they work with" (this is not counted from the responses, so it is written here). For example "Partnerships, local or international, give support, share knowledge and let projects learn from each other. The most common partners are other tourism businesses, then NGOs, then local governments or municipalities."',
      validation: required('the paragraph'),
    }),

    // ---- End
    defineField({
      name: 'ctaHeading',
      title: 'Last section: heading',
      type: 'string',
      group: 'end',
      description: 'For example "Run an astrotourism initiative?"',
      validation: (Rule) => [required('the heading')(Rule), Rule.max(60).warning('A shorter heading fits better.')],
    }),
    defineField({
      name: 'ctaText',
      title: 'Last section: sentence',
      type: 'string',
      group: 'end',
      description: 'For example "Take the short survey to be counted here."',
      validation: required('the sentence'),
    }),
    defineField({
      name: 'sourceText',
      title: 'Where the responses come from',
      type: 'string',
      group: 'end',
      description: 'Never shown. Who validated the responses and where they were collected, for example "Responses validated by Joy from the astrotourism initiatives survey, imported on 27 Nov 2026".',
      validation: required('where the responses come from'),
    }),
    defineField({
      name: 'checkedOn',
      title: 'Responses last checked on',
      type: 'date',
      group: 'end',
      description: 'Never shown. The date someone last compared the responses here with the survey. Update it whenever you add responses.',
      validation: required('the date'),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Global Survey Report page'}
    },
  },
})
