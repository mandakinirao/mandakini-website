import { defineField, defineType } from 'sanity'

export const pressItemSchema = defineType({
  name: 'pressItem',
  title: 'Press',
  type: 'document',
  fields: [
    defineField({
      name: 'url',
      title: 'Link URL',
      type: 'url',
      description:
        'Paste the article, video, or podcast link. Title, thumbnail, and source are auto-filled from this link at build time.',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['http', 'https'] }),
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
          { title: 'Feature', value: 'feature' },
        ],
        layout: 'radio',
      },
      initialValue: 'article',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleOverride',
      title: 'Title (override)',
      type: 'string',
      description: 'Leave blank to auto-fill from the link.',
    }),
    defineField({
      name: 'imageOverride',
      title: 'Image (override)',
      type: 'image',
      options: { hotspot: true },
      description:
        'Leave blank to auto-fill. For print/online features, upload the publication’s logo here for a clean logo card.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'sourceOverride',
      title: 'Source / Publication (override)',
      type: 'string',
      description:
        'e.g. “Telangana Today”. Leave blank to auto-fill from the link.',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers show first.',
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'titleOverride',
      url: 'url',
      subtitle: 'type',
    },
    prepare({ title, url, subtitle }: { title?: string; url?: string; subtitle?: string }) {
      return {
        title: title || url || '(no URL set)',
        subtitle: subtitle ?? 'article',
      }
    },
  },
})
