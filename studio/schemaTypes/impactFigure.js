import {defineField, defineType} from 'sanity'

// A figure that counts up on the page: a whole number with optional text either
// side of it, the sentence that follows it, and where it came from.
// The source fields are never shown on the page, but every figure must have them.
// Kept in its own file so the Impact page can use the same shape later.
const figureFields = [
  defineField({
    name: 'prefix',
    title: 'Before the number',
    type: 'string',
    description: 'Optional, for example "€".',
    validation: (Rule) => Rule.max(3).warning('Keep this to a symbol or two.'),
  }),
  defineField({
    name: 'value',
    title: 'Number',
    type: 'number',
    description: 'A whole number, typed without commas or spaces, for example 111000. The site adds the comma.',
    validation: (Rule) => [
      Rule.required().error('Add the number.'),
      Rule.integer().error('Use a whole number, so it can count up.'),
      Rule.min(0).error('The number cannot be negative.'),
    ],
  }),
  defineField({
    name: 'suffix',
    title: 'After the number',
    type: 'string',
    description: 'Optional, for example "+" or "%".',
    validation: (Rule) => Rule.max(3).warning('Keep this to a symbol or two.'),
  }),
  defineField({
    name: 'label',
    title: 'Sentence',
    type: 'string',
    description:
      'The words after the number, so the two read as one sentence, for example "village women and disabled persons trained to be astroguides".',
    validation: (Rule) => [
      Rule.required().error('Add the sentence.'),
      Rule.max(80).warning('A shorter sentence is easier to scan.'),
    ],
  }),
]

const sourceFields = [
  defineField({
    name: 'sourceText',
    title: 'Source',
    type: 'string',
    description: 'Where the number comes from. Not shown on the page.',
    validation: (Rule) => Rule.required().error('Every number needs its source.'),
  }),
  defineField({
    name: 'sourceUrl',
    title: 'Source link',
    type: 'url',
    description: 'Where the number can be checked. Not shown on the page.',
    validation: (Rule) =>
      Rule.required()
        .uri({scheme: ['https', 'http']})
        .error('Add a web address for the source.'),
  }),
  defineField({
    name: 'checkedOn',
    title: 'Checked on',
    type: 'date',
    description: 'The day someone last checked this number against its source. Not shown on the page.',
    validation: (Rule) => Rule.required().error('Add the date the number was checked.'),
  }),
]

// Shows the number as it will look, for example "€111000+", in the Studio list
const preview = {
  select: {prefix: 'prefix', value: 'value', suffix: 'suffix', label: 'label'},
  prepare: ({prefix, value, suffix, label}) => ({
    title: `${prefix || ''}${value ?? ''}${suffix || ''}`,
    subtitle: label,
  }),
}

// The big headline figure
export const impactFigure = defineType({
  name: 'impactFigure',
  title: 'Figure',
  type: 'object',
  fields: [...figureFields, ...sourceFields],
  preview,
})

// A result in the list: a figure plus the small line above its sentence,
// shown as "TOURISM · MALAYSIA"
export const impactResult = defineType({
  name: 'impactResult',
  title: 'Result',
  type: 'object',
  fields: [
    ...figureFields,
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'Who or what changed, for example "Tourism" or "Local government".',
      validation: (Rule) => [
        Rule.required().error('Add the tag.'),
        Rule.max(20).warning('Keep the tag short.'),
      ],
    }),
    defineField({
      name: 'place',
      title: 'Place',
      type: 'string',
      description: 'Where, for example "Malaysia".',
      validation: (Rule) => [
        Rule.required().error('Add the place.'),
        Rule.max(20).warning('Keep the place short.'),
      ],
    }),
    ...sourceFields,
  ],
  preview,
})
