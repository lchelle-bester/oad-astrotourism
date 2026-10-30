import {defineArrayMember, defineField, defineType} from 'sanity'

// Details that appear on every page, mostly in the footer. There is only ever one
// of these, so it is a single document, like the hero.

// The social platforms an editor can pick. The icon for each is chosen by the
// site's code from this value, so editors cannot break the icons. LinkedIn and X
// are here so they can be added back later without a code change.
export const socialPlatforms = [
  {title: 'Facebook', value: 'facebook'},
  {title: 'Instagram', value: 'instagram'},
  {title: 'TikTok', value: 'tiktok'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'LinkedIn', value: 'linkedin'},
  {title: 'X', value: 'x'},
]

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      description: 'The public contact address shown in the footer.',
      validation: (Rule) => [
        Rule.required().error('Add the contact email.'),
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email'}).error('This does not look like an email address.'),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social media links',
      type: 'array',
      description: 'Shown as icons in the footer, in this order. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              description: 'The icon is chosen from this.',
              options: {list: socialPlatforms},
              validation: (Rule) => Rule.required().error('Choose a platform.'),
            }),
            defineField({
              name: 'url',
              title: 'Web address',
              type: 'url',
              description: 'The full address of the page, starting with https://',
              validation: (Rule) =>
                Rule.required().uri({scheme: ['https']}).error('Add the full address, starting with https://'),
            }),
          ],
          preview: {
            select: {platform: 'platform', url: 'url'},
            prepare: ({platform, url}) => ({
              title: socialPlatforms.find((p) => p.value === platform)?.title || 'Choose a platform',
              subtitle: url,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'homeLinkLabel',
      title: 'Link to the main OAD site: wording',
      type: 'string',
      description:
        'The words of the link to the main OAD website, shown in the footer and in the header on phones. For example "Part of the IAU Office of Astronomy for Development".',
      initialValue: 'Part of the IAU Office of Astronomy for Development',
      validation: (Rule) => Rule.required().error('Add the wording of the link.'),
    }),
    defineField({
      name: 'homeLinkUrl',
      title: 'Link to the main OAD site: web address',
      type: 'url',
      initialValue: 'https://astro4dev.org',
      validation: (Rule) =>
        Rule.required().uri({scheme: ['https']}).error('Add the full address, starting with https://'),
    }),
    defineField({
      name: 'partners',
      title: 'Partners',
      type: 'array',
      description: 'The logos in the "Our partners" band, in this order. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'partner',
          fields: [
            defineField({
              name: 'name',
              title: 'Organisation name',
              type: 'string',
              description: 'The full name, for example "National Research Foundation".',
              validation: (Rule) => Rule.required().error('Add the organisation name.'),
            }),
            defineField({
              name: 'logo',
              title: 'Logo',
              type: 'image',
              description:
                'Use the official logo file only, never redrawn or recoloured. A PNG with a transparent background, about 104 pixels tall or more, works best.',
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt text',
                  type: 'string',
                  description: 'The organisation\'s full name, for people who cannot see the logo.',
                  validation: (Rule) =>
                    Rule.custom((value, context) =>
                      context.parent?.asset && !value ? 'Add alt text for the logo.' : true,
                    ),
                }),
              ],
              validation: (Rule) => Rule.required().error('Add the logo.'),
            }),
            defineField({
              name: 'url',
              title: 'Website',
              type: 'url',
              description: 'Optional. If you add one, the logo links to it.',
              validation: (Rule) => Rule.uri({scheme: ['https', 'http']}).error('Add the full address, starting with https://'),
            }),
          ],
          preview: {
            select: {title: 'name', media: 'logo'},
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
