import {defineArrayMember, defineField, defineType} from 'sanity'
import {GenerateOnlySlugInput} from './components/GenerateOnlySlugInput'
import {SubheadingH2, SubheadingH3, QuoteStyle} from './components/Subheadings'
import {ButtonColourInput} from './components/ButtonColourInput'
import {ButtonPreview} from './components/ButtonPreview'
import {ImageRowPreview} from './components/ImageRowPreview'
import {buttonAlignments, buttonColours} from './buttonColours.mjs'
import {sitePages} from './sitePages.mjs'
import {youtubeId, youtubePlaylistId, youtubeSource, spotifyPath} from './mediaLinks.mjs'
import ImageIcon from '@sanity/icons/Image'
import ImagesIcon from '@sanity/icons/Images'
import LaunchIcon from '@sanity/icons/Launch'
import MicrophoneIcon from '@sanity/icons/Microphone'
import PlayIcon from '@sanity/icons/Play'

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
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Subheading', value: 'h2', component: SubheadingH2},
            {title: 'Smaller subheading', value: 'h3', component: SubheadingH3},
            // Added 30 Oct 2026: a quotation. Bold, italic and links still work inside it.
            {title: 'Quote', value: 'blockquote', component: QuoteStyle},
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
          title: 'Single photo',
          icon: ImageIcon,
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
          icon: MicrophoneIcon,
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
        // A YouTube video or playlist inside the article (video added 30 Oct 2026,
        // playlists the same day). On the site it will be click to load: a still
        // image with a play button for a video, a plain play card for a playlist (a
        // playlist has no still image without a YouTube key), and YouTube is only
        // contacted when someone presses play (decided 30 Oct 2026, for privacy
        // and page weight). The data name stays "youtube", so existing posts keep
        // working. Built with the article pages.
        defineArrayMember({
          type: 'object',
          name: 'youtube',
          title: 'YouTube video or playlist',
          icon: PlayIcon,
          fields: [
            defineField({
              name: 'url',
              title: 'YouTube link',
              type: 'url',
              description:
                'Paste the address of a video (https://www.youtube.com/watch?v=...) or of a playlist (https://www.youtube.com/playlist?list=...). A video link that also has "list=" in it is treated as that one video: for the whole playlist, paste the playlist page address.',
              validation: (Rule) => [
                Rule.required().error('Paste the YouTube link.'),
                Rule.custom((url) => (!url || youtubeSource(url) ? true : 'This does not look like a link to a YouTube video or playlist.')),
              ],
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'What the video or playlist is, for example "Starry Safaris tour, Tanzania". Screen readers announce it.',
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
            prepare: ({title, url}) => {
              const source = url ? youtubeSource(url) : null
              const kind = source?.kind === 'playlist' ? 'YouTube playlist' : 'YouTube video'
              return {title: title || kind, subtitle: url ? `${kind}: ${url}` : 'No link yet'}
            },
          },
        }),
        // Photos side by side (added 30 Oct 2026, decided: a simple row, not a
        // layout picker): two or three photos at equal width, in the order they
        // are dragged (left to right). On phones they will stack.
        defineArrayMember({
          type: 'object',
          name: 'imageRow',
          title: 'Photos side by side',
          icon: ImagesIcon,
          components: {preview: ImageRowPreview},
          fields: [
            defineField({
              name: 'images',
              title: 'Photos',
              type: 'array',
              description:
                'Two or three photos, shown side by side at the same size. Drag them to change which is on the left. Each needs alt text.',
              options: {layout: 'grid'},
              validation: (Rule) => [
                Rule.required().min(2).error('A row needs at least two photos. For one photo use Single photo.'),
                Rule.max(3).error('At most three photos fit side by side.'),
              ],
              of: [
                defineArrayMember({
                  type: 'image',
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
                      description: 'Optional. Shown under this photo.',
                    }),
                    defineField({
                      name: 'credit',
                      title: 'Credit',
                      type: 'string',
                      description: 'Optional. Who took the photo, for example "Photo: Jane Doe / OAD".',
                    }),
                  ],
                }),
              ],
            }),
          ],
          preview: {
            select: {images: 'images'},
            prepare: ({images}) => ({
              images: images || [],
              subtitle: `${(images || []).length} photos side by side`,
            }),
          },
        }),
        // A button (added 30 Oct 2026): words, where it goes, a brand colour chosen
        // from swatches (text colour follows automatically) and where it sits.
        defineArrayMember({
          type: 'object',
          name: 'button',
          title: 'Button',
          icon: LaunchIcon,
          components: {preview: ButtonPreview},
          fields: [
            defineField({
              name: 'label',
              title: 'Button text',
              type: 'string',
              description: 'The words on the button, for example "Apply for funding".',
              validation: (Rule) => [
                Rule.required().error('Add the words for the button.'),
                Rule.max(40).warning('Short button text reads better.'),
              ],
            }),
            defineField({
              name: 'page',
              title: 'Goes to: a page on this site',
              type: 'string',
              description: 'Pick a page of this site. Or leave this empty and use the web address below.',
              options: {list: sitePages},
            }),
            defineField({
              name: 'url',
              title: 'Goes to: or a web address outside the site',
              type: 'url',
              description: 'Only if the button goes outside this site. A full address, starting with https://',
              validation: (Rule) => Rule.uri({scheme: ['https', 'http']}).error('Add the full address, starting with https://'),
            }),
            defineField({
              name: 'colour',
              title: 'Colour',
              type: 'string',
              description: 'Click a colour. The words on the button turn dark or white by themselves so they stay easy to read.',
              options: {list: buttonColours.map(({title, value}) => ({title, value}))},
              components: {input: ButtonColourInput},
              initialValue: 'yellow',
              validation: (Rule) => Rule.required().error('Choose a colour.'),
            }),
            defineField({
              name: 'align',
              title: 'Where it sits',
              type: 'string',
              options: {list: buttonAlignments, layout: 'radio', direction: 'horizontal'},
              initialValue: 'left',
              validation: (Rule) => Rule.required().error('Choose where the button sits.'),
            }),
          ],
          validation: (Rule) =>
            Rule.custom((button) => {
              if (!button) return true
              if (button.page && button.url) return 'Choose a page or a web address, not both.'
              if (!button.page && !button.url) return 'Choose a page of this site, or add a web address.'
              return true
            }),
          preview: {
            select: {title: 'label', page: 'page', url: 'url', colour: 'colour', align: 'align'},
            prepare: ({title, page, url, colour, align}) => ({title, subtitle: page || url, colour, align}),
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
