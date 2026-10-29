import {defineArrayMember, defineField, defineType} from 'sanity'

// A news post. Every post lives in the one News list in the Studio; the homepage
// shows the three newest, and the News page (next phase) shows them all.
// Nothing appears on the site until it is published.

// The categories are fixed (decided 29 Oct 2026). Each is stored as a short code
// that never changes, with the label people see beside it.
export const postCategories = [
  {title: 'News', value: 'news'},
  {title: 'Events', value: 'events'},
  {title: 'OAD projects', value: 'oad-projects'},
]

export const post = defineType({
  name: 'post',
  title: 'News post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The headline.',
      validation: (Rule) => [
        Rule.required().error('Add a title.'),
        Rule.max(100).warning('Long titles wrap onto many lines on the cards. Shorter reads better.'),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The end of the post\'s web address, for example astrotourism.astro4dev.org/news/starry-safaris-tanzania/. Finish the title first, then click Generate. Once generated it is locked and cannot be edited, so links to the post never break.',
      options: {source: 'title', maxLength: 96},
      // Locked as soon as it has a value (decided 29 Oct 2026)
      readOnly: ({value}) => Boolean(value?.current),
      validation: (Rule) => Rule.required().error('Generate the web address from the title.'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      type: 'date',
      description: 'The date shown on the site. Posts are listed newest first by this date.',
      options: {dateFormat: 'D MMMM YYYY'},
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (Rule) => Rule.required().error('Add the date.'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Shown above the title on the cards.',
      options: {list: postCategories},
      validation: (Rule) => Rule.required().error('Choose a category.'),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main photo',
      type: 'image',
      description:
        'Shown on the cards and at the top of the post. Click the crop icon and drag the circle onto the most important part: on phones the photo is cut to a square around that point.',
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
      validation: (Rule) => Rule.required().error('Add a photo.'),
    }),
    defineField({
      name: 'body',
      title: 'Article',
      type: 'array',
      description: 'The post itself. Use Subheading to break up long posts.',
      validation: (Rule) => Rule.required().error('Write the article.'),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Subheading', value: 'h2'},
            {title: 'Smaller subheading', value: 'h3'},
          ],
          lists: [
            {title: 'Bulleted list', value: 'bullet'},
            {title: 'Numbered list', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'Web address',
                    type: 'url',
                    description: 'A full address (https://...), or a page on this site starting with /.',
                    validation: (Rule) =>
                      Rule.required()
                        .uri({scheme: ['https', 'http', 'mailto'], allowRelative: true})
                        .error('Add the web address.'),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          title: 'Photo',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'What the photo shows, for people who cannot see it.',
              validation: (Rule) => Rule.required().error('Add alt text for the photo.'),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional. Shown under the photo.',
            }),
          ],
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'},
        {field: '_createdAt', direction: 'desc'},
      ],
    },
  ],
  // Each row in the News list: the photo, the title, then the date and category
  preview: {
    select: {title: 'title', date: 'publishedAt', category: 'category', media: 'mainImage'},
    prepare: ({title, date, category, media}) => {
      const label = postCategories.find((c) => c.value === category)?.title
      const shown = date
        ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})
        : 'No date'
      return {title, subtitle: [shown, label].filter(Boolean).join(' · '), media}
    },
  },
})
