import { defineArrayMember, defineField, defineType } from 'sanity'

const RESERVED_SLUGS = ['learn', 'classes', 'login', 'account']

export const journalPostSchema = defineType({
  name: 'journalPost',
  title: 'Journal Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Auto-generated from the title. Click "Generate" after entering the title.',
      validation: (Rule) =>
        Rule.required().custom((slug: { current?: string } | undefined) => {
          const current = slug?.current
          if (!current) return true
          if (RESERVED_SLUGS.includes(current)) {
            return `"${current}" is a reserved route — choose a different slug.`
          }
          return true
        }),
    }),
    defineField({
      name: 'kicker',
      title: 'Kicker',
      type: 'string',
      description: 'Small label above the title, e.g. "Studio notes" or "From the easel".',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'One or two sentences shown on the listing page card.',
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown on the listing card and at the top of the article.',
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required() }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Featured posts may be highlighted at the top of the listing page.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({ type: 'journalSection' })],
      description: 'Build the article paragraph by paragraph. Add, reorder, or remove paragraphs freely.',
    }),
  ],
  orderings: [
    { title: 'Published, newest first', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'kicker', media: 'coverImage' },
  },
})
