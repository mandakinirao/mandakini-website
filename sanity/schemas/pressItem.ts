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
        'Paste the article, video, or podcast link. Headline, thumbnail, and source are auto-filled at build time.',
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
      description: 'Leave blank to auto-fill from the link.',
    }),
    defineField({
      name: 'thumbnailOverride',
      title: 'Thumbnail (override)',
      type: 'image',
      options: { hotspot: true },
      description: 'Leave blank to auto-fill. For print features, upload the publication logo here.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'source',
      title: 'Source / Publication',
      type: 'string',
      description: 'e.g. "Telangana Today". Leave blank to auto-fill from the link.',
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
