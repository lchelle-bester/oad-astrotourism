import {defineArrayMember, defineField, defineType} from 'sanity'
import {GenerateOnlySlugInput} from './components/GenerateOnlySlugInput'
import {ButtonColourInput} from './components/ButtonColourInput'
import {countries, countryName} from './countries.mjs'
import {sdgs} from './sdgs.mjs'
import {projectColours} from './projectColours.mjs'

// A project in the directory (Phase 8, spec in docs/projects/projects-design.md). One
// type for projects funded by OAD now and surveyed initiatives later (decided 10 Nov
// 2026), told apart by "kind". After one import from OAD's list, this is the master
// copy: Ram and Joy edit it here. Nothing appears on the site until it is published.
//
// This is a public dataset, so nothing private goes in: no names, emails or phone
// numbers of people. Photos only once OAD has agreed they can be shown.

// Only one kind for now; the map phase adds "Surveyed initiative".
export const projectKinds = [{title: 'Funded by OAD', value: 'funded'}]

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project title',
      type: 'string',
      description: 'OAD\'s title for the project.',
      validation: (Rule) => [
        Rule.required().error('Add a title.'),
        Rule.max(120).warning('Long titles wrap onto many lines on the cards. Shorter reads better.'),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The end of the project\'s web address, for example astrotourism.astro4dev.org/projects/directory/anga-explorers-for-development/. Finish the title first, then click Generate. Once generated it is locked and cannot be edited, so links to the project never break.',
      options: {source: 'title', maxLength: 96},
      components: {input: GenerateOnlySlugInput},
      validation: (Rule) => Rule.required().error('Generate the web address from the title.'),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      description: 'Fixed for now: every project here was funded by OAD.',
      options: {list: projectKinds},
      initialValue: 'funded',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Implementation year',
      type: 'number',
      description: 'The year the project was carried out. The directory can be filtered and sorted by it.',
      validation: (Rule) => Rule.required().integer().min(2000).max(2100).error('Add a year, for example 2025.'),
    }),
    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      description:
        'Where the project took place. Click Add item for each country. A project in several countries appears under each one in the directory.',
      of: [
        defineArrayMember({
          type: 'string',
          title: 'Country',
          options: {list: countries.map(({code, name}) => ({title: name, value: code}))},
        }),
      ],
      validation: (Rule) => [
        Rule.required().min(1).error('Add at least one country.'),
        Rule.unique().error('The same country is in the list twice.'),
      ],
    }),
    defineField({
      name: 'place',
      title: 'Place',
      type: 'string',
      description:
        'Optional. Where inside the country, for example "Northern Cape and Karoo region". Shown after the country on the card.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 14,
      description:
        'OAD\'s description of the project. Plain text: start a new paragraph by leaving a blank line. (No bold or links in here.)',
      validation: (Rule) => [
        Rule.required().error('Add the summary.'),
        Rule.max(3500).warning('This is very long. Consider keeping the main points.'),
      ],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      description:
        'Optional. Shown as the card\'s background with a dark fade on the left. Without a photo the card gets the solid colour below. Only add a photo OAD has agreed can be shown. Click the crop icon and drag the circle onto the most important part: the card is a wide strip, so the picture is cut to it around that point.',
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
          description: 'Optional. Who took the photo, for example "Photo: Jane Doe / OAD".',
        }),
      ],
    }),
    defineField({
      name: 'cardColour',
      title: 'Card colour (when there is no photo)',
      type: 'string',
      description:
        'Click a colour. Only used when the project has no photo. The words on the card stay white on a dark fade, so any of these is readable.',
      options: {
        list: projectColours.map(({title, value}) => ({title, value})),
        swatches: projectColours,
      },
      components: {input: ButtonColourInput},
      validation: (Rule) =>
        Rule.custom((value, context) =>
          !value && !context.document?.photo?.asset ? 'Choose a card colour, or add a photo.' : true,
        ),
    }),
    defineField({
      name: 'sdgs',
      title: 'Sustainable Development Goals',
      type: 'array',
      description: 'Optional. Tick the UN goals the project supports. The directory can be filtered by them.',
      of: [defineArrayMember({type: 'number'})],
      options: {list: sdgs.map(({number, title}) => ({title: `${number}. ${title}`, value: number}))},
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Optional. Kept for later (for example to make categories). Not shown on the site yet.',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'originalUrl',
      title: 'Original page on astro4dev.org',
      type: 'url',
      description:
        'Optional. Where OAD\'s own page for this project lives. Shown on the project page as "Read the original". Leave empty to show no link.',
      validation: (Rule) => Rule.uri({scheme: ['https']}).error('Add the full address, starting with https://'),
    }),
  ],
  // The Studio list: newest year first, then A to Z
  orderings: [
    {
      title: 'Year, newest first',
      name: 'yearDesc',
      by: [
        {field: 'year', direction: 'desc'},
        {field: 'title', direction: 'asc'},
      ],
    },
    {title: 'Title, A to Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', year: 'year', countries: 'countries', media: 'photo'},
    prepare: ({title, year, countries: codes, media}) => ({
      title,
      subtitle: [year, (codes || []).map(countryName).join(', ')].filter(Boolean).join(' · '),
      media,
    }),
  },
})
