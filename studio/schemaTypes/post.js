import {defineArrayMember, defineField, defineType} from 'sanity'
import {GenerateOnlySlugInput} from './components/GenerateOnlySlugInput'
import {youtubeId, youtubePlaylistId, youtubeSource, spotifyPath} from './mediaLinks.mjs'
import {articleBlocks} from './articleBody'

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

// The link rules are in mediaLinks.mjs, shared with the build. Re-exported here for
// anything that already imports them from this file.
export {youtubeId, youtubePlaylistId, youtubeSource, spotifyPath}

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
      // No typing: only a Generate button, then locked (decided 29 Oct 2026)
      components: {input: GenerateOnlySlugInput},
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
    // Added 10 Nov 2026 (L'chelle): an OAD projects post can say which projects in the
    // directory it is about. It then appears under "News and updates" on each project's page,
    // and the article links back to the project. Only shown for the OAD projects category. The
    // references are weak, so a project can still be deleted: the build ignores a link that
    // no longer points at anything. A post whose category is changed away from OAD projects
    // keeps the choice in the Studio, but the site ignores it.
    defineField({
      name: 'projects',
      title: 'Projects this post is about',
      type: 'array',
      description:
        'Optional. Add the project or projects in the Project directory that this post is about. The post then shows on each project\'s page, and links back to it. Leave empty if it is not about one of them.',
      hidden: ({document}) => document?.category !== 'oad-projects',
      of: [defineArrayMember({type: 'reference', to: [{type: 'project'}], weak: true})],
      validation: (Rule) => Rule.unique().error('The same project is in the list twice.'),
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
      description:
        'The post itself. Use Subheading to break up long posts and Quote for a quotation. The + button adds photos, rows of photos side by side, buttons, videos and podcasts.',
      validation: (Rule) => Rule.required().error('Write the article.'),
      of: articleBlocks,
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
