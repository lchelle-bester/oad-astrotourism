import {defineArrayMember, defineField, defineType} from 'sanity'
import {youtubeSource} from './mediaLinks.mjs'

// The Online course page (/resources/online-course/), design in docs/online-course/ (L'chelle's two
// mock-ups, 25 Nov 2026). There is only one, so it is a single document. Fixed in the page, not here:
// the title "Astrotourism online course", the breadcrumb, the section headings ("What you will learn",
// "Course outline", "How it works"), the numbers (modules, steps, "Part 1 of 4") and the words on the
// preview video card. The course itself is run by The Open University on OpenLearn Create; this
// page describes it and sends people there, so every fact on it (hours, level, certificate, modules)
// must match the real course. The source and the date it was checked are required and never shown.

export const onlineCoursePage = defineType({
  name: 'onlineCoursePage',
  title: 'Online course page',
  type: 'document',
  groups: [
    {name: 'top', title: 'Top of the page', default: true},
    {name: 'learn', title: 'What you will learn'},
    {name: 'outline', title: 'Course outline'},
    {name: 'how', title: 'How it works'},
  ],
  fields: [
    // ---- Top of the page
    defineField({
      name: 'intro',
      title: 'Introduction',
      type: 'text',
      rows: 3,
      group: 'top',
      description: 'The sentence or two under the page title, for example "A free online course for guides, individuals and tourism businesses who want to share the night sky."',
      validation: (Rule) => [Rule.required().error('Add the introduction.'), Rule.max(200).warning('A shorter introduction fits the layout better.')],
    }),
    defineField({
      name: 'courseUrl',
      title: 'Course address',
      type: 'url',
      group: 'top',
      description: 'Where the buttons go: the course on OpenLearn Create. Both buttons on the page use it.',
      validation: (Rule) => Rule.required().uri({scheme: ['https']}).error('Add the full address, starting with https://.'),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button words',
      type: 'string',
      group: 'top',
      description: 'For example "Start the free course". The page adds the arrow.',
      validation: (Rule) => [Rule.required().error('Add the button words.'), Rule.max(30).warning('Shorter button words fit better.')],
    }),
    defineField({
      name: 'hostedLine',
      title: 'Line under the button',
      type: 'string',
      group: 'top',
      description: 'For example "Hosted by The Open University on OpenLearn Create."',
      validation: (Rule) => Rule.required().error('Add the line.'),
    }),
    defineField({
      name: 'facts',
      title: 'Four facts',
      type: 'array',
      group: 'top',
      description: 'Exactly four, in order: a short bold line and a smaller line under it. For example "24 hours" and "of study, at your own pace".',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'fact',
          title: 'Fact',
          fields: [
            defineField({
              name: 'strong',
              title: 'Bold line',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Add the bold line.'), Rule.max(28).warning('Keep it short.')],
            }),
            defineField({
              name: 'small',
              title: 'Small line',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Add the small line.'), Rule.max(48).warning('Keep it short.')],
            }),
          ],
          preview: {select: {title: 'strong', subtitle: 'small'}},
        }),
      ],
      validation: (Rule) => [Rule.required().error('Add the four facts.'), Rule.length(4).error('The design has exactly four facts.')],
    }),
    defineField({
      name: 'heroPhoto',
      title: 'Photo',
      type: 'image',
      group: 'top',
      description: 'Optional. The photo beside the title (under it on a phone). Only add a photo OAD has agreed can be shown.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'What the photo shows, for people who cannot see it.',
          validation: (Rule) => Rule.custom((value, context) => (context.parent?.asset && !value ? 'Add alt text for the photo.' : true)),
        }),
        defineField({
          name: 'credit',
          title: 'Credit',
          type: 'string',
          description: 'Optional. Who took the photo, for example "Dr Jane Doe". The page adds "Photo:" in front. Leave empty if not known: nothing is shown.',
        }),
      ],
    }),

    // ---- What you will learn
    defineField({
      name: 'outcomes',
      title: 'What you will learn',
      type: 'array',
      group: 'learn',
      description: 'The learning outcomes, one short sentence each, in order (the page numbers them). The real course lists five.',
      of: [{type: 'string'}],
      validation: (Rule) => [Rule.required().error('Add the outcomes.'), Rule.min(3).max(8).error('Between three and eight outcomes.')],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Preview video (YouTube link)',
      type: 'url',
      group: 'learn',
      description:
        'Optional. A YouTube video of the course. Nothing is loaded from YouTube until someone presses play. Leave empty and the page simply has no video (the list then uses the full width).',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          const source = youtubeSource(value)
          if (!source || source.kind !== 'video') return 'This is not a link to one YouTube video.'
          return true
        }),
    }),
    defineField({
      name: 'videoTitle',
      title: 'Video title',
      type: 'string',
      group: 'learn',
      description: 'What the video is called. Screen readers announce it on the play button. Required when there is a video.',
      validation: (Rule) => Rule.custom((value, context) => (context.document?.videoUrl && !value ? 'Add the video title.' : true)),
    }),

    // ---- Course outline
    defineField({
      name: 'parts',
      title: 'Parts of the course',
      type: 'array',
      group: 'outline',
      description:
        'Exactly four parts, in order. Each part has its modules. The page numbers the modules in order across all the parts (01, 02, ...) and works out "Ten modules, four parts" itself.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'part',
          title: 'Part',
          fields: [
            defineField({
              name: 'title',
              title: 'Part title',
              type: 'string',
              description: 'For example "Foundations".',
              validation: (Rule) => [Rule.required().error('Add the part title.'), Rule.max(40).warning('A shorter title fits the layout better.')],
            }),
            defineField({
              name: 'modules',
              title: 'Modules',
              type: 'array',
              description: 'The modules of this part, in order. Drag to reorder.',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'module',
                  title: 'Module',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Module title',
                      type: 'string',
                      validation: (Rule) => [Rule.required().error('Add the module title.'), Rule.max(60).warning('A shorter title fits the layout better.')],
                    }),
                    defineField({
                      name: 'topics',
                      title: 'Topics',
                      type: 'array',
                      of: [{type: 'string'}],
                      description: 'Short topic names, one per line. The page puts a dot between them.',
                      validation: (Rule) => Rule.max(10).warning('A long list is hard to read.'),
                    }),
                  ],
                  preview: {select: {title: 'title', topics: 'topics'}, prepare: ({title, topics}) => ({title, subtitle: (topics || []).join(' · ')})},
                }),
              ],
              validation: (Rule) => Rule.required().min(1).error('Add at least one module.'),
            }),
          ],
          preview: {
            select: {title: 'title', modules: 'modules'},
            prepare: ({title, modules}) => ({title, subtitle: `${(modules || []).length} modules`}),
          },
        }),
      ],
      validation: (Rule) => [Rule.required().error('Add the four parts.'), Rule.length(4).error('The design has exactly four parts.')],
    }),

    // ---- How it works
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      group: 'how',
      description: 'Exactly four, in order (the page numbers them 1 to 4).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          title: 'Step',
          fields: [
            defineField({
              name: 'title',
              title: 'Step title',
              type: 'string',
              validation: (Rule) => [Rule.required().error('Add the step title.'), Rule.max(40).warning('Keep it short.')],
            }),
            defineField({
              name: 'text',
              title: 'Step text',
              type: 'text',
              rows: 2,
              validation: (Rule) => [Rule.required().error('Add the step text.'), Rule.max(160).warning('A shorter text fits the layout better.')],
            }),
          ],
          preview: {select: {title: 'title', subtitle: 'text'}},
        }),
      ],
      validation: (Rule) => [Rule.required().error('Add the four steps.'), Rule.length(4).error('The design has exactly four steps.')],
    }),

    // ---- Where the facts come from (never shown on the page)
    defineField({
      name: 'sourceText',
      title: 'Source of the facts',
      type: 'string',
      group: 'top',
      description: 'Never shown. Where the hours, the level, the certificate and the modules were checked, for example "OpenLearn Create course page and OAD\'s course page".',
      validation: (Rule) => Rule.required().error('Add where the facts were checked.'),
    }),
    defineField({
      name: 'checkedOn',
      title: 'Facts checked on',
      type: 'date',
      group: 'top',
      description: 'Never shown. The date someone last compared this page with the real course. Update it whenever the course changes.',
      validation: (Rule) => Rule.required().error('Add the date.'),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Online course page'}
    },
  },
})
