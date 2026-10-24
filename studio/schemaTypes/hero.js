import {defineField, defineType} from 'sanity'

// The hero is the big block at the top of the home page.
// There is only ever one of these, so it is set up as a single document.
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    // The headline is split in two because the design styles the parts differently:
    // one very large word on the mountains, then a normal-sized line under it.
    defineField({
      name: 'headlineWord',
      title: 'Headline: large word',
      type: 'string',
      description:
        'The single large word at the top of the home page, for example "Astrotourism". Read together with the second line as one headline.',
      validation: (Rule) => [
        Rule.required().error('The hero needs a large word.'),
        Rule.custom((value) =>
          value && /\s/.test(value) ? 'Use one word, with no spaces.' : true,
        ),
        Rule.max(12).warning('A word longer than "Astrotourism" may not fit on a phone screen.'),
      ],
    }),
    defineField({
      name: 'headlineRest',
      title: 'Headline: second line',
      type: 'string',
      description: 'The rest of the headline, shown under the large word, for example "for a better world."',
      validation: (Rule) => [
        Rule.required().error('The hero needs a second headline line.'),
        Rule.max(30).warning('A long second line may run into the subheading on wide screens.'),
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
    select: {word: 'headlineWord', rest: 'headlineRest'},
    prepare({word, rest}) {
      const title = [word, rest].filter(Boolean).join(' ')
      return {title: title || 'Hero'}
    },
  },
})
