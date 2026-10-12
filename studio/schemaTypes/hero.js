import {defineField, defineType} from 'sanity'

// The hero is the big block at the top of the home page.
// There is only ever one of these, so it is set up as a single document.
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The large line at the top of the home page.',
      validation: (Rule) => [
        Rule.required().error('The hero needs a headline.'),
        Rule.max(80).warning('Long headlines may not fit on a phone screen.'),
      ],
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
      description: 'One short sentence under the headline.',
      validation: (Rule) => [
        Rule.required().error('The hero needs a subheading.'),
        Rule.max(140).warning('A shorter subheading reads better in the hero.'),
      ],
    }),
    defineField({
      name: 'affiliation',
      title: 'Affiliation line',
      type: 'string',
      description: 'The small line that names the Office of Astronomy for Development.',
      validation: (Rule) => [
        Rule.required().error('The hero needs an affiliation line.'),
        Rule.max(100).warning('A shorter affiliation line reads better in the hero.'),
      ],
    }),
  ],
  preview: {
    select: {title: 'headline'},
    prepare({title}) {
      return {title: title || 'Hero'}
    },
  },
})
