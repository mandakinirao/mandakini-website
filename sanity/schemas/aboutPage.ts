import { defineType, defineField } from 'sanity'

export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g. "Mandakini Rao"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discipline',
      title: 'Discipline / Subtitle',
      type: 'string',
      description: 'e.g. "Multidisciplinary Artist"',
    }),
    defineField({
      name: 'homeSnippet',
      title: 'Home Page Snippet',
      type: 'text',
      rows: 4,
      description: 'Short bio paragraph shown in the About section on the home page. The full /about page uses the scattered text and quote below. If empty, the home snippet section is hidden.',
    }),
    defineField({
      name: 'descriptionLines',
      title: 'Description (scattered text)',
      description: 'Each row has 3 fragments spread across the width. Add 4 rows for the staggered layout.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'textRow',
          title: 'Text Row',
          fields: [
            { name: 'col1', title: 'Left fragment', type: 'string' },
            { name: 'col2', title: 'Centre fragment', type: 'string' },
            { name: 'col3', title: 'Right fragment', type: 'string' },
          ],
          preview: { select: { title: 'col1', subtitle: 'col2' } },
        },
      ],
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'quoteAttribution',
      title: 'Quote Attribution',
      type: 'string',
    }),
  ],
  preview: {
    prepare() { return { title: 'About Page' } },
  },
})
