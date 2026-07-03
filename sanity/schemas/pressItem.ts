import { defineField, defineType } from 'sanity'

export const pressItemSchema = defineType({
  name: 'pressItem',
  title: 'Press',
  type: 'document',
  fields: [
    defineField({
      name: 'link',
      title: 'Link URL',
      type: 'url',
      description:
        'Paste the article, video, or podcast link. Headline, thumbnail, and source are auto-filled at build time when the site allows it. Many outlets (paywalls, regional sites, print archives) block this — filling in the overrides below by hand is normal, not a fallback.',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Article', value: 'article' },
          { title: 'Video', value: 'video' },
          { title: 'Podcast', value: 'podcast' },
        ],
        layout: 'radio',
      },
      initialValue: 'article',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headlineOverride',
      title: 'Headline (override)',
      type: 'string',
      description:
        'Leave blank to try auto-fill from the link. Used often — most regional and print outlets don’t expose a usable headline tag.',
    }),
    defineField({
      name: 'thumbnailOverride',
      title: 'Thumbnail (override)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Leave blank to try auto-fill. For print features, paywalled links, or any site with a poor preview image, upload the publication logo here and turn on "Logo card" below.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'logoCard',
      title: 'Logo card',
      type: 'boolean',
      initialValue: false,
      description:
        'Turn on when the thumbnail above is a publication logo/mark rather than a photo (or when there is no usable thumbnail at all) — renders a clean logo card instead of a photo overlay.',
    }),
    defineField({
      name: 'source',
      title: 'Source / Publication',
      type: 'string',
      description: 'e.g. "Telangana Today". Leave blank to try auto-fill from the link.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers show first.',
      initialValue: 99,
    }),
    defineField({
      name: 'featuredOnHomepage',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Show this press item in the homepage Press section.',
    }),
    defineField({
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      description: 'Controls the sequence among featured homepage press items. Lower = first.',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'headlineOverride',
      link: 'link',
      subtitle: 'type',
    },
    prepare({ title, link, subtitle }: { title?: string; link?: string; subtitle?: string }) {
      return {
        title: title || link || '(no URL set)',
        subtitle: subtitle ?? 'article',
      }
    },
  },
})
