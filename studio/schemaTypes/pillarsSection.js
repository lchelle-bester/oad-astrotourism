import {defineArrayMember, defineField, defineType} from 'sanity'
import {sitePages} from './sitePages'

// "What we do": OAD's six pillars as a ring of segments (design in docs/pillars/).
// One document holding exactly six pillars. Their order in the list is their order
// round the circle, clockwise from the top. The segment colours belong to the
// positions and live in the site's CSS, so reordering never changes the colours.
export const pillarsSection = defineType({
  name: 'pillarsSection',
  title: 'What we do (six pillars)',
  type: 'document',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'The small line above the heading, for example "Six pillars".',
      validation: (Rule) => Rule.required().error('Add the eyebrow.'),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'For example "What we do".',
      validation: (Rule) => Rule.required().error('Add the heading.'),
    }),
    defineField({
      name: 'helper',
      title: 'Helper line (computer)',
      type: 'string',
      description: 'Under the heading on larger screens, for example "Six pillars that feed into each other. Click one on the circle to see what it involves."',
      validation: (Rule) => [
        Rule.required().error('Add the helper line.'),
        Rule.max(120).warning('A shorter helper line reads better.'),
      ],
    }),
    defineField({
      name: 'helperPhone',
      title: 'Helper line (phone)',
      type: 'string',
      description: 'The shorter version for phones, for example "Tap a pillar on the circle."',
      validation: (Rule) => [
        Rule.required().error('Add the phone helper line.'),
        Rule.max(50).warning('Keep the phone version short.'),
      ],
    }),
    defineField({
      name: 'pillars',
      title: 'Pillars',
      type: 'array',
      description:
        'Exactly six, in order round the circle, clockwise from the top. Drag to reorder. The colours stay with the positions.',
      validation: (Rule) => [
        Rule.required().error('Add the six pillars.'),
        Rule.length(6).error('The circle has exactly six pillars.'),
      ],
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pillar',
          title: 'Pillar',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              description: 'Shown on the circle and as the card title, for example "Resources".',
              validation: (Rule) => [
                Rule.required().error('Add the name.'),
                Rule.max(24).warning('Long names may not fit on the circle.'),
              ],
            }),
            defineField({
              name: 'description',
              title: 'Sentence',
              type: 'text',
              rows: 3,
              description: "OAD's sentence about this pillar.",
              validation: (Rule) => [
                Rule.required().error('Add the sentence.'),
                Rule.max(160).warning('A shorter sentence fits the card better.'),
              ],
            }),
            defineField({
              name: 'photo',
              title: 'Photo',
              type: 'image',
              description: 'Optional until a photo is chosen; a placeholder shows meanwhile.',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                  description: 'What the photo shows, for people who cannot see it.',
                  validation: (Rule) =>
                    Rule.custom((value, context) =>
                      context.parent?.asset && !value ? 'Add alt text for the photo.' : true,
                    ),
                }),
                defineField({
                  name: 'credit',
                  title: 'Credit',
                  type: 'string',
                  description: 'Who took the photo, for example "Photo: Jane Doe / OAD".',
                  validation: (Rule) =>
                    Rule.custom((value, context) =>
                      context.parent?.asset && !value ? 'Add a credit for the photo.' : true,
                    ),
                }),
              ],
            }),
            defineField({
              name: 'links',
              title: 'Find it on this site',
              type: 'array',
              description: 'Where this work lives on the site. One to three links.',
              validation: (Rule) => [
                Rule.required().min(1).error('Add at least one link.'),
                Rule.max(3).warning('More than three links crowd the card.'),
              ],
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'link',
                  title: 'Link',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Link text',
                      type: 'string',
                      validation: (Rule) => Rule.required().error('Add the link text.'),
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
                      description: 'Only if the link goes outside this site, for example Discord.',
                    }),
                  ],
                  validation: (Rule) =>
                    Rule.custom((link) => {
                      if (!link) return true
                      if (link.page && link.url) return 'Choose a page or a web address, not both.'
                      if (!link.page && !link.url) return 'Choose a page or add a web address.'
                      return true
                    }),
                  preview: {
                    select: {title: 'label', page: 'page', url: 'url'},
                    prepare: ({title, page, url}) => ({title, subtitle: page || url}),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'description', media: 'photo'},
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'What we do (six pillars)'}
    },
  },
})
