import {defineField, defineType} from 'sanity'
import {sitePages} from './sitePages.mjs'
import {sdgs} from './sdgs.mjs'

// The Theory of Change page (/projects/theory-of-change/), design in docs/theory-of-change/.
// There is only one, so it is a single document. The five section headings, the column labels
// (Activity, Output, Outcome) and the button words "Read in full", "Show" and "Download the
// diagram" are fixed in the page, not here.

// A list of short items with a note under it ("Assumes: ...")
const itemsAndNote = (name, title, description) =>
  defineField({
    name,
    title,
    type: 'object',
    description,
    options: {collapsible: true, collapsed: false},
    fields: [
      defineField({
        name: 'items',
        title: 'List',
        type: 'array',
        of: [{type: 'string'}],
        description: 'One short line each. Drag to reorder.',
        validation: (Rule) => Rule.required().min(1).error('Add at least one item.'),
      }),
      defineField({
        name: 'assumes',
        title: 'What we assume',
        type: 'text',
        rows: 3,
        description: 'Shown under the list after the word "Assumes:". Leave empty to show nothing.',
      }),
    ],
    validation: (Rule) => Rule.required().error('Fill in this part.'),
  })

// The assumptions behind one stage, shown inside the fold-open panel
const stageAssumptions = (name, title) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [{type: 'text', rows: 2}],
    description: 'One sentence each. Shown in the "assumptions behind each stage" panel. Drag to reorder.',
  })

// One stage of a pathway: a short wording for the row, and OAD's full wording for "Read in full"
const stage = (name, title, shortHint) => [
  defineField({
    name: `${name}Short`,
    title: `${title}: short wording`,
    type: 'string',
    description: shortHint,
    validation: (Rule) => [
      Rule.required().error('Add the short wording.'),
      Rule.max(90).warning('Shorter wording fits the row better.'),
    ],
  }),
  defineField({
    name: `${name}Full`,
    title: `${title}: full wording`,
    type: 'text',
    rows: 3,
    description: 'OAD\'s full wording, shown when someone opens "Read in full". Leave empty if it is the same as the short one.',
  }),
]

export const theoryOfChange = defineType({
  name: 'theoryOfChange',
  title: 'Theory of Change',
  type: 'document',
  groups: [
    {name: 'top', title: 'Top and download', default: true},
    {name: 'problem', title: '1 The problem'},
    {name: 'who', title: '2 Who it serves'},
    {name: 'pathways', title: '3 How the change happens'},
    {name: 'goals', title: '4 The goals'},
    {name: 'impact', title: '5 The impact'},
  ],
  fields: [
    // ---- Top of the page and the download
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      group: 'top',
      description: 'The sentence under the page title. It is also the description search engines show.',
      validation: (Rule) => [
        Rule.required().error('Add the introduction.'),
        Rule.max(200).warning('Search engines cut descriptions at about 155 characters.'),
      ],
    }),
    defineField({
      name: 'diagramFile',
      title: 'The diagram (for download)',
      type: 'file',
      group: 'top',
      description:
        'The file behind the "Download the diagram" button: the original picture or a PDF. If you leave it empty the button is not shown.',
      options: {accept: 'application/pdf,image/png,image/jpeg'},
    }),

    // ---- 1 The problem
    defineField({
      name: 'problemFigure',
      title: 'Big figure',
      type: 'string',
      group: 'problem',
      description: 'The number shown large on a yellow highlight, for example "4.9%".',
      validation: (Rule) => [Rule.required().error('Add the figure.'), Rule.max(10).warning('Keep it short.')],
    }),
    defineField({
      name: 'problemText',
      title: 'What the figure means',
      type: 'string',
      group: 'problem',
      description: 'The sentence under the figure, for example "is the projected global unemployment rate for 2026, about 186 million people out of work."',
      validation: (Rule) => Rule.required().error('Add the sentence.'),
    }),
    defineField({
      name: 'sourceName',
      title: 'Source: name',
      type: 'string',
      group: 'problem',
      description: 'Shown as a link, for example "International Labour Organization, Employment and Social Trends 2026".',
      validation: (Rule) => Rule.required().error('A figure must name its source.'),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source: web address',
      type: 'url',
      group: 'problem',
      validation: (Rule) => Rule.required().uri({scheme: ['https', 'http']}).error('Add the source link (it must start with https://).'),
    }),
    defineField({
      name: 'sourceDate',
      title: 'Source: date shown',
      type: 'string',
      group: 'problem',
      description: 'Shown in brackets after the source, for example "January 2026".',
      validation: (Rule) => Rule.required().error('Add the date of the source.'),
    }),
    defineField({
      name: 'checkedOn',
      title: 'Checked on',
      type: 'date',
      group: 'problem',
      description: 'The day someone last checked the figure against the source. Never shown on the page.',
      validation: (Rule) => Rule.required().error('Say when the figure was checked.'),
    }),
    defineField({
      name: 'peopleTotal',
      title: 'Picture: how many people',
      type: 'number',
      group: 'problem',
      description: 'The little people drawn beside the figure, in rows of ten. The picture is decoration: the sentence below it carries the meaning.',
      initialValue: 20,
      validation: (Rule) => Rule.required().integer().min(10).max(40).error('Choose a whole number from 10 to 40.'),
    }),
    defineField({
      name: 'peopleHighlighted',
      title: 'Picture: how many are highlighted',
      type: 'number',
      group: 'problem',
      description: 'How many of those people are shown in red (4.9% is about 1 in 20, so 1 of 20).',
      initialValue: 1,
      validation: (Rule) => [
        Rule.required().integer().min(1).max(10).error('Choose a whole number from 1 to 10.'),
        Rule.custom((value, context) => {
          const total = context.document?.peopleTotal
          if (typeof value === 'number' && typeof total === 'number' && value > total) {
            return 'There cannot be more highlighted people than people.'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'peopleLineBefore',
      title: 'Line under the picture: start',
      type: 'string',
      group: 'problem',
      description: 'The line is written in three parts so the middle can be bold. For example "That is nearly".',
      validation: (Rule) => Rule.required().error('Add the start of the line.'),
    }),
    defineField({
      name: 'peopleLineBold',
      title: 'Line under the picture: bold part',
      type: 'string',
      group: 'problem',
      description: 'For example "1 in every 20". Keep it in step with the picture and the figure.',
      validation: (Rule) => Rule.required().error('Add the bold part.'),
    }),
    defineField({
      name: 'peopleLineAfter',
      title: 'Line under the picture: end',
      type: 'string',
      group: 'problem',
      description: 'For example "people in the world\'s labour force."',
      validation: (Rule) => Rule.required().error('Add the end of the line.'),
    }),

    // ---- 2 Who it serves
    itemsAndNote('audience', 'The people it is for', 'The groups the programme is for.'),
    itemsAndNote('stakeholders', 'The partners who make it possible', 'The organisations the work depends on.'),

    // ---- 3 How the change happens
    defineField({
      name: 'pathways',
      title: 'Pathways',
      type: 'array',
      group: 'pathways',
      description: 'Exactly three, each one coloured row (yellow, terracotta, teal in this order). Drag to reorder.',
      of: [
        {
          type: 'object',
          name: 'pathway',
          title: 'Pathway',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'For example "Train the trainers".',
              validation: (Rule) => [Rule.required().error('Name the pathway.'), Rule.max(30).warning('A shorter name fits better.')],
            }),
            ...stage('activity', 'Activity', 'What OAD does.'),
            ...stage('output', 'Output', 'What can be counted.'),
            ...stage('outcome', 'Outcome', 'What should change.'),
          ],
          preview: {
            select: {title: 'name', subtitle: 'activityShort'},
          },
        },
      ],
      validation: (Rule) => [
        Rule.required().error('Add the three pathways.'),
        Rule.length(3).error('The design has room for exactly three pathways.'),
      ],
    }),
    stageAssumptions('activitiesAssumptions', 'Assumptions behind the activities'),
    stageAssumptions('outputsAssumptions', 'Assumptions behind the outputs'),
    stageAssumptions('outcomesAssumptions', 'Assumptions behind the outcomes'),

    // ---- 4 The goals
    defineField({
      name: 'goals',
      title: 'Goals',
      type: 'array',
      group: 'goals',
      description: 'The UN Sustainable Development Goals the work serves, one to three, side by side. Drag to reorder.',
      of: [
        {
          type: 'object',
          name: 'goal',
          title: 'Goal',
          fields: [
            defineField({
              name: 'sdg',
              title: 'Goal',
              type: 'number',
              description: 'The goal\'s name is added by the page.',
              options: {list: sdgs.map((g) => ({title: `${g.number}. ${g.title}`, value: g.number}))},
              validation: (Rule) => Rule.required().error('Choose the goal.'),
            }),
            defineField({
              name: 'target',
              title: 'Target number',
              type: 'number',
              description: 'Optional. The target within the goal, for example 9 for target 8.9. Leave empty if the whole goal is meant.',
              validation: (Rule) => Rule.integer().min(1).max(30),
            }),
            defineField({
              name: 'main',
              title: 'Main goal',
              type: 'boolean',
              description: 'Shows a "Main goal" badge. Only one goal can be the main one.',
              initialValue: false,
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required().error('Add the text.'),
            }),
            defineField({
              name: 'indicatorCode',
              title: 'Indicator number',
              type: 'string',
              description: 'Optional, for example "8.9.1". Shown after the words "Measured by indicator".',
            }),
            defineField({
              name: 'indicatorText',
              title: 'Indicator wording',
              type: 'string',
              description: 'Optional, for example "tourism direct GDP as a proportion of total GDP and in growth rate".',
            }),
          ],
          validation: (Rule) =>
            Rule.custom((goal) => {
              if (!goal) return true
              if (Boolean(goal.indicatorCode) !== Boolean(goal.indicatorText)) {
                return 'Fill in both the indicator number and its wording, or leave both empty.'
              }
              return true
            }),
          preview: {
            select: {sdg: 'sdg', target: 'target', main: 'main', text: 'text'},
            prepare({sdg, target, main, text}) {
              const goal = sdgs.find((g) => g.number === sdg)
              const label = goal ? `${goal.number}. ${goal.title}` : 'Choose a goal'
              return {title: label, subtitle: `${target ? `Target ${target}. ` : ''}${main ? 'Main goal. ' : ''}${text || ''}`}
            },
          },
        },
      ],
      validation: (Rule) => [
        Rule.required().min(1).max(3).error('Add one to three goals.'),
        Rule.custom((goals) => {
          const mains = (goals || []).filter((g) => g?.main).length
          return mains > 1 ? 'Only one goal can be the main goal.' : true
        }),
        Rule.custom((goals) => {
          const numbers = (goals || []).map((g) => g?.sdg).filter((n) => typeof n === 'number')
          return new Set(numbers).size === numbers.length ? true : 'The same goal appears twice.'
        }),
      ],
    }),

    // ---- 5 The impact
    defineField({
      name: 'impactText',
      title: 'Impact statement',
      type: 'text',
      rows: 5,
      group: 'impact',
      description: 'The large text in the teal band.',
      validation: (Rule) => Rule.required().error('Add the impact statement.'),
    }),
    defineField({
      name: 'impactButton',
      title: 'Button',
      type: 'object',
      group: 'impact',
      description: 'The outlined button under the statement.',
      fields: [
        defineField({
          name: 'label',
          title: 'Button text',
          type: 'string',
          description: 'For example "See the results so far on the Impact page".',
          validation: (Rule) => [Rule.required().error('Add the button text.'), Rule.max(60).warning('Keep the button text short.')],
        }),
        defineField({name: 'page', title: 'Page on this site', type: 'string', options: {list: sitePages}}),
        defineField({
          name: 'url',
          title: 'Or a web address outside the site',
          type: 'url',
          description: 'Only if the button goes outside this site.',
        }),
      ],
      validation: (Rule) =>
        Rule.custom((button) => {
          if (!button) return 'Add the button.'
          if (button.page && button.url) return 'Choose a page or a web address, not both.'
          if (!button.page && !button.url) return 'Choose a page or add a web address.'
          return true
        }),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Theory of Change'}
    },
  },
})
