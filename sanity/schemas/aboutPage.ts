import { defineType, defineField } from 'sanity'

export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'aboutBlockPortrait',
      title: 'Portrait photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    }),
    defineField({
      name: 'aboutBlockBio',
      title: 'Bio text',
      type: 'text',
      rows: 6,
      description: 'Shown on the About page alongside the portrait.',
    }),
    defineField({
      name: 'aboutTeaserLine',
      title: 'Homepage teaser line',
      type: 'string',
      description: 'One short sentence shown on the homepage. Falls back to the bio text if left empty.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
