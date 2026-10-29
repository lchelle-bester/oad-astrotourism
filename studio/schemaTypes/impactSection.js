import {defineField, defineType} from 'sanity'
import {sitePages} from './sitePages'

// "Proof": the teal band after the six pillars (design in docs/proof/).
// One headline figure, exactly three results and a link to the full outcomes.
// There is only one, so it is a single document.
export const impactSection = defineType({
  name: 'impactSection',
  title: 'Impact (proof)',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'The small line above the heading, for example "Impact".',
      validation: (Rule) => Rule.required().error('Add the eyebrow.'),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'For example "What our projects have achieved".',
      validation: (Rule) => [
        Rule.required().error('Add the heading.'),
        Rule.max(50).warning('A shorter heading fits the layout better.'),
      ],
    }),
    defineField({
      name: 'headline',
      title: 'Headline figure',
      type: 'impactFigure',
      description: 'The one big number on the left.',
      validation: (Rule) => Rule.required().error('Add the headline figure.'),
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      description: 'Exactly three, each led by one number. Drag to reorder.',
      of: [{type: 'impactResult'}],
      validation: (Rule) => [
        Rule.required().error('Add the three results.'),
        Rule.length(3).error('The design has room for exactly three results.'),
      ],
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'object',
      description: 'The yellow button that goes to the full list of outcomes.',
      fields: [
        defineField({
          name: 'label',
          title: 'Button text',
          type: 'string',
          description: 'For example "See all outcomes".',
          validation: (Rule) => [
            Rule.required().error('Add the button text.'),
            Rule.max(24).warning('Keep the button text short.'),
          ],
        }),
        defineField({
          name: 'page',
          title: 'Page on this site',
          type: 'string',
          options: {list: sitePages},
        }),
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
      return {title: 'Impact (proof)'}
    },
  },
})
