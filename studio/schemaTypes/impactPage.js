import {defineArrayMember, defineField, defineType} from 'sanity'
import {sourceFields} from './impactFigure'

// The Impact page (/projects/impact/), design in docs/impact/. There is only one, so it is a
// single document. The four parts of the page are called "sections" in the Studio and on the page:
// "chapter" is not OAD's word, so it was taken out of everything people see on 21 Nov 2026 (the
// internal names `chapters` and `chapter` stay, so no content has to move). Fixed in the page, not
// here: the title "Impact", the breadcrumb, the colours and where each photo sits (they belong to
// the section's position), and the line under the map heading, which the site writes from the
// project list ("20 astrotourism projects funded since 2016. Choose a country to see its
// projects.").

// A photo with alt text, an optional caption and an optional credit. The photo is optional, but
// once it is added it needs alt text. The page puts "Photo:" in front of the credit, and shows no
// credit when it is empty (credit made optional 20 Nov 2026, L'chelle: the photographers are not
// all known yet).
// The banner photo has no caption field (25 Nov 2026, L'chelle: the page no longer shows one).
const photoField = (name, title, description, {withCaption = true} = {}) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'What the photo shows, for people who cannot see it.',
        validation: (Rule) =>
          Rule.custom((value, context) => (context.parent?.asset && !value ? 'Add alt text for the photo.' : true)),
      }),
      ...(withCaption
        ? [
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional. Shown under the photo, for example "An astro-homestay in Maan, in the Himalaya".',
            }),
          ]
        : []),
      defineField({
        name: 'credit',
        title: 'Credit',
        type: 'string',
        description: 'Optional. Who took the photo, for example "Dr Jane Doe". The page adds "Photo:" in front. Leave empty if the photographer is not known: nothing is shown.',
      }),
    ],
  })

export const impactPage = defineType({
  name: 'impactPage',
  title: 'Impact page',
  type: 'document',
  groups: [
    {name: 'top', title: 'Top of the page', default: true},
    {name: 'chapters', title: 'The four sections'}, // "chapter" was dropped from everything editors see on 21 Nov 2026 (it is not OAD's word); the internal name stays so no content has to move
    {name: 'map', title: 'The map'},
  ],
  fields: [
    // ---- Top of the page
    defineField({
      name: 'headline',
      title: 'Headline sentence',
      type: 'array',
      group: 'top',
      description:
        'The sentence under the page title. Select the words that should show in yellow (the amount and the number of countries) and press Highlight.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {decorators: [{title: 'Highlight', value: 'highlight'}], annotations: []},
        }),
      ],
      validation: (Rule) => [
        Rule.required().length(1).error('Write one sentence, in one paragraph.'),
        Rule.custom((blocks) => {
          const spans = blocks?.[0]?.children || []
          const text = spans.map((s) => s.text || '').join('')
          if (!text.trim()) return 'Write the sentence.'
          return true
        }),
        Rule.custom((blocks) => {
          const spans = blocks?.[0]?.children || []
          return spans.some((s) => s.marks?.includes('highlight'))
            ? true
            : 'Nothing is highlighted yet. Select the amount and the countries and press Highlight.'
        }).warning(),
        Rule.custom((blocks) => {
          const text = (blocks?.[0]?.children || []).map((s) => s.text || '').join('')
          return text.length > 170 ? 'A shorter sentence fits the banner better.' : true
        }).warning(),
      ],
    }),
    ...sourceFields.map((field) => ({
      ...field,
      group: 'top',
      title: field.name === 'sourceText' ? 'Source of the headline figures' : field.title,
      description: field.description.replace('the number', 'the figures in the headline sentence'),
    })),
    // In the "Top of the page" tab (fixed 21 Nov 2026: it had no group, so it only showed under "All fields")
    {
      ...photoField(
        'heroPhoto',
        'Banner photo',
        'Optional. The photo behind the headline, with a dark fade. A wide photo works best; click the crop icon and drag the circle onto the most important part, because the banner is a wide strip and the photo is cut to it around that point. Only add a photo OAD has agreed can be shown.',
        {withCaption: false},
      ),
      group: 'top',
    },

    // ---- The four sections
    defineField({
      name: 'chapters',
      title: 'Sections',
      type: 'array',
      group: 'chapters',
      description:
        'Exactly four, in order. The site sets their colours and where their photo sits by their order. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chapter',
          title: 'Section',
          fields: [
            defineField({
              name: 'label',
              title: 'Eyebrow',
              type: 'string',
              description: 'The small line above the heading, one or two words, for example "Tourism". It is shown as you type it.',
              validation: (Rule) => [
                Rule.required().error('Add the eyebrow.'),
                Rule.max(20).warning('Keep the eyebrow short.'),
              ],
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              description: 'For example "Night skies became something to offer visitors".',
              validation: (Rule) => [
                Rule.required().error('Add the heading.'),
                Rule.max(60).warning('A shorter heading fits the layout better.'),
              ],
            }),
            defineField({
              name: 'intro',
              title: 'Introduction',
              type: 'string',
              description: 'One sentence under the heading.',
              validation: (Rule) => [
                Rule.required().error('Add the introduction.'),
                Rule.max(140).warning('A shorter sentence is easier to scan.'),
              ],
            }),
            photoField(
              'photo',
              'Photo',
              'Optional. Only add a photo OAD has agreed can be shown. Click the crop icon and drag the circle onto the most important part.',
            ),
            defineField({
              name: 'figures',
              title: 'Figures',
              type: 'array',
              description:
                'One to five. In the first two sections the first figure is shown large, then the rest as a list; the third is a plain list; the fourth shows its figures in a row, so give it three. Drag to reorder.',
              of: [{type: 'impactStat'}],
              validation: (Rule) => [
                Rule.required().min(1).error('Add at least one figure.'),
                Rule.max(5).error('The design has room for five figures at most.'),
              ],
            }),
          ],
          preview: {
            select: {title: 'heading', subtitle: 'label', media: 'photo', figures: 'figures'},
            prepare: ({title, subtitle, media, figures}) => ({
              title,
              subtitle: `${subtitle || ''} · ${(figures || []).length} figures`,
              media,
            }),
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required().error('Add the four sections.'),
        Rule.length(4).error('The design has exactly four sections.'),
      ],
    }),
    defineField({
      name: 'note',
      title: 'Note under the last section',
      type: 'string',
      group: 'chapters',
      description: 'Optional. A small line after the last section, for example "All figures as reported by the funded projects to OAD."',
    }),

    // ---- The map
    defineField({
      name: 'mapEyebrow',
      title: 'Map: small line above the heading',
      type: 'string',
      group: 'map',
      description: 'For example "Funded projects".',
      validation: (Rule) => Rule.required().error('Add the small line.'),
    }),
    defineField({
      name: 'mapHeading',
      title: 'Map: heading',
      type: 'string',
      group: 'map',
      description:
        'For example "Where the change happened". The line under it ("20 astrotourism projects funded since 2016. Choose a country to see its projects.") is written by the site from the project list, so the number and the year are always right.',
      validation: (Rule) => [
        Rule.required().error('Add the heading.'),
        Rule.max(50).warning('A shorter heading fits the layout better.'),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Impact page'}
    },
  },
})
