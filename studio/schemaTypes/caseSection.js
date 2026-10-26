import {defineArrayMember, defineField, defineType} from 'sanity'

// "The case" is the section under the hero: a heading and three
// statistics placed along the trail. There is only one, so it is a single document.
// The design is made for exactly three statistics, and every statistic must have
// its source, so a figure can never go live without one.
export const caseSection = defineType({
  name: 'caseSection',
  title: 'The case',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'One line that makes the argument, for example "A dark sky is worth travelling for."',
      validation: (Rule) => [
        Rule.required().error('The section needs a heading.'),
        Rule.max(60).warning('A shorter heading reads better.'),
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'array',
      description: 'Exactly three. Each one sits at a waypoint on the trail.',
      validation: (Rule) => [
        Rule.required().error('Add the three statistics.'),
        Rule.length(3).error('The design has room for exactly three statistics.'),
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stat',
          title: 'Statistic',
          fields: [
            defineField({
              name: 'value',
              title: 'Number',
              type: 'string',
              description: 'Shown very large, in any format, for example "8 in 10", "62%" or "$2.2bn".',
              validation: (Rule) => [
                Rule.required().error('Add the number.'),
                Rule.max(8).warning('Long numbers may not fit at this size.'),
              ],
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description:
                'The words after the number, so the two read as one sentence, for example "people live under light-polluted skies." Keep to what the source says.',
              validation: (Rule) => [
                Rule.required().error('Add the label.'),
                Rule.max(80).warning('A shorter label is easier to scan.'),
              ],
            }),
            defineField({
              name: 'sourceText',
              title: 'Source line',
              type: 'string',
              description: 'Shown in small text under the label, for example "Falchi et al., Science Advances, 2016".',
              validation: (Rule) => Rule.required().error('Every number needs its source.'),
            }),
            defineField({
              name: 'sourceUrl',
              title: 'Source link',
              type: 'url',
              description:
                'Where the number can be checked. Not shown on the page, but kept so anyone editing knows where it came from.',
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
          ],
          preview: {
            select: {title: 'value', subtitle: 'label'},
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
