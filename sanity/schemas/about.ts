import { defineField, defineType } from 'sanity'

export const aboutSchema = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrait photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown on the About page. Use a high-resolution portrait.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Editorial body text shown on the About page.',
    }),
    defineField({
      name: 'pullQuote',
      title: 'Pull Quote',
      type: 'string',
      description: 'Optional short quote highlighted on the About page. Leave blank to omit.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About' }
    },
  },
} as any)
