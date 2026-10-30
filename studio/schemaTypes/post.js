import {defineArrayMember, defineField, defineType} from 'sanity'
import {GenerateOnlySlugInput} from './components/GenerateOnlySlugInput'
import {SubheadingH2, SubheadingH3} from './components/Subheadings'

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

// The video id (11 letters, numbers, - or _) from a YouTube link, or null if
// the link is not a YouTube video. Accepts youtube.com/watch?v=..., youtu.be/...,
// youtube.com/shorts/..., youtube.com/embed/... and youtube.com/live/....
// The build will use the same rule to find the video.
export function youtubeId(url) {
  const match = String(url).match(
    /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})(?:[?&#/].*)?$/,
  )
  return match ? match[1] : null
}

// The part of a Spotify link the player needs, such as "episode/4rOoJ6Egrf8K2IrywzwOMk",
// or null if the link is not a Spotify one. Accepts open.spotify.com links for an
// episode, show, track, album or playlist, also with a language prefix such as
// /intl-de/ and with ?si=... on the end.
export function spotifyPath(url) {
  const match = String(url).match(
    /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(episode|show|track|album|playlist)\/([A-Za-z0-9]{22})(?:[?#/].*)?$/,
  )
  return match ? `${match[1]}/${match[2]}` : null
}

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
            {title: 'Subheading', value: 'h2', component: SubheadingH2},
            {title: 'Smaller subheading', value: 'h3', component: SubheadingH3},
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
            defineField({
              name: 'credit',
              title: 'Credit',
              type: 'string',
              description: 'Optional. Who took the photo, for example "Photo: Jane Doe / OAD".',
            }),
          ],
        }),
        // A Spotify episode, show, track, album or playlist (added 30 Oct 2026),
        // for podcasts. Like YouTube, it will load only when the visitor presses
        // play (to be built with the article pages).
        defineArrayMember({
          type: 'object',
          name: 'spotify',
          title: 'Spotify podcast',
          fields: [
            defineField({
              name: 'url',
              title: 'Spotify link',
              type: 'url',
              description: 'In Spotify, click Share, then Copy link to episode (or show). It looks like https://open.spotify.com/episode/...',
              validation: (Rule) => [
                Rule.required().error('Paste the Spotify link.'),
                Rule.custom((url) => (!url || spotifyPath(url) ? true : 'This does not look like a Spotify episode, show, track, album or playlist link.')),
              ],
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'What it is, for example "Episode 12: Dark skies in Namibia". Screen readers announce it.',
              validation: (Rule) => Rule.required().error('Add a title for the podcast.'),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional. Shown under the player.',
            }),
          ],
          preview: {
            select: {title: 'title', url: 'url'},
            prepare: ({title, url}) => ({title: title || 'Spotify podcast', subtitle: url ? `Spotify: ${url}` : 'No link yet'}),
          },
        }),
        // A YouTube video inside the article (added 30 Oct 2026). On the site it
        // will show as the video's still image with a play button, and YouTube
        // is only contacted when someone presses play (decided 30 Oct 2026, for
        // privacy and page weight). Built with the article pages.
        defineArrayMember({
          type: 'object',
          name: 'youtube',
          title: 'YouTube video',
          fields: [
            defineField({
              name: 'url',
              title: 'Video link',
              type: 'url',
              description: 'Paste the address of the video on YouTube, for example https://www.youtube.com/watch?v=...',
              validation: (Rule) => [
                Rule.required().error('Paste the YouTube link.'),
                Rule.custom((url) => (!url || youtubeId(url) ? true : 'This does not look like a link to a YouTube video.')),
              ],
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'What the video is, for example "Starry Safaris tour, Tanzania". Screen readers announce it.',
              validation: (Rule) => Rule.required().error('Add a title for the video.'),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional. Shown under the video.',
            }),
          ],
          preview: {
            select: {title: 'title', url: 'url'},
            prepare: ({title, url}) => ({title: title || 'YouTube video', subtitle: url ? `YouTube: ${url}` : 'No link yet'}),
          },
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
