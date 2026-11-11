import {defineArrayMember, defineField, defineType} from 'sanity'
import {GenerateOnlySlugInput} from './components/GenerateOnlySlugInput'
import {ButtonColourInput} from './components/ButtonColourInput'
import {articleBlocks} from './articleBody'
import {countries, countryName} from './countries.mjs'
import {sdgs} from './sdgs.mjs'
import {projectColours} from './projectColours.mjs'

// A project in the directory (Phase 8, spec in docs/projects/projects-design.md): a
// project funded by OAD. After one import from OAD's list, this is the master copy:
// Ram and Joy edit it here. Nothing appears on the site until it is published.
// There is no "kind" field (removed 10 Nov 2026, every project is funded by OAD). If
// the map phase needs to tell surveyed initiatives apart, add one then and treat a
// project without it as funded.
//
// This is a public dataset, so nothing private goes in: no names, emails or phone
// numbers of people. Photos only once OAD has agreed they can be shown.

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
        'Optional. Where inside the country, for example "Northern Cape and Karoo region". Not shown on the directory cards, which give the country only.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 14,
      description:
        'OAD\'s short description of the project, as plain text: start a new paragraph by leaving a blank line. Used for the directory search. It is also shown on the project page, unless you fill in "Page content" below, which then replaces it.',
      // Needed unless the page content is written (added 11 Nov 2026)
      validation: (Rule) => [
        Rule.custom((value, context) =>
          !value && !(context.document?.body && context.document.body.length)
            ? 'Add the summary, or write the page in "Page content".'
            : true,
        ),
        Rule.max(3500).warning('This is very long. Consider keeping the main points.'),
      ],
    }),
    // The full text of the project page (added 11 Nov 2026, L'chelle): the same editor as a news
    // article, so a project can have subheadings, photos, photos side by side, buttons (for
    // example "Download the project report"), videos and podcasts. When it has anything in it,
    // the project page shows it instead of the plain summary.
    defineField({
      name: 'body',
      title: 'Page content',
      type: 'array',
      description:
        'The text of the project page, written like a news article. If you write anything here it is shown on the page instead of the Summary. Use Subheading to break up long text. The + button adds photos, photos side by side, buttons (for example a download), videos and podcasts.',
      of: articleBlocks,
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
    // The person to contact about the project, as on OAD's own page (added 11 Nov 2026). Ram and Joy
    // agreed that contact details can be shown, because they are on OAD's pages already. The name
    // links to their email on the project page.
    defineField({
      name: 'contact',
      title: 'Project contact',
      type: 'object',
      description:
        'Optional. The person to contact about the project, as shown on OAD\'s own page for it. On the project page the name is a link that opens an email to them.',
      fields: [
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({
          name: 'email',
          title: 'Email address',
          type: 'string',
          validation: (Rule) =>
            Rule.regex(/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/, {name: 'email'}).error('Add a full email address, for example name@example.org'),
        }),
      ],
      validation: (Rule) =>
        Rule.custom((contact) => (contact && !contact.name && !contact.email ? 'Add a name or an email address, or clear the contact.' : true)),
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
