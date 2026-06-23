import { defineField, defineType } from 'sanity'

export const homepageSchema = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'heroRevealTop',
      title: 'Hero Reveal — Top image',
      type: 'image',
      options: { hotspot: true },
      description: 'Top image in the two-image hero reveal.',
      validation: (Rule) => Rule.required(),
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
      name: 'heroRevealBottom',
      title: 'Hero Reveal — Bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Bottom image in the two-image hero reveal.',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage' }
    },
  },
} as any)
