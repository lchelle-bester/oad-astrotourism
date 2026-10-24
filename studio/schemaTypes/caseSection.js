import {defineArrayMember, defineField, defineType} from 'sanity'

// "The case" is the section under the hero: a heading that makes the argument,
// and two statistics as the evidence. There is only one, so it is a single document.
// Every statistic must have its source, so a figure can never go live without one.
export const caseSection = defineType({
  name: 'caseSection',
  title: 'The case',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'One line that makes the argument, for example "The night sky is an opportunity".',
      validation: (Rule) => [
        Rule.required().error('The section needs a heading.'),
        Rule.max(60).warning('A shorter heading reads better.'),
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'array',
      description: 'The layout shows two statistics side by side.',
      validation: (Rule) => [
        Rule.required().error('Add the statistics.'),
        Rule.length(2).warning('The layout is designed for exactly two statistics.'),
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          title: 'Statistic',
          fields: [
            defineField({
              name: 'figure',
              title: 'Figure',
              type: 'string',
              description: 'The start of the sentence, shown in white, for example "8 in 10" or "$374.2 billion".',
              validation: (Rule) => [
                Rule.required().error('Add the figure.'),
                Rule.max(16).warning('A shorter figure stands out more.'),
              ],
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description:
                'The rest of the sentence after the figure, starting in lower case, for example "people live under light-polluted skies". Keep to what the source says.',
              validation: (Rule) => [
                Rule.required().error('Add the rest of the sentence.'),
                Rule.max(70).warning('The layout is designed for about 70 characters or fewer.'),
              ],
            }),
            defineField({
              name: 'sourceName',
              title: 'Source name',
              type: 'string',
              description: 'Who published the figure, and the year, for example "Falchi et al., 2016".',
              validation: (Rule) => Rule.required().error('Every figure needs its source.'),
            }),
            defineField({
              name: 'sourceUrl',
              title: 'Source link',
              type: 'url',
              description: 'A web address where anyone can check the figure.',
              validation: (Rule) =>
                Rule.required()
                  .uri({scheme: ['https', 'http']})
                  .error('Add a web address for the source.'),
            }),
          ],
          preview: {
            select: {title: 'figure', subtitle: 'label'},
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'The case'}
    },
  },
})
