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
      description:
        'Top image in the two-image hero reveal (the layer the cursor erases). Leave empty to use the built-in default.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'heroRevealBottom',
      title: 'Hero Reveal — Bottom image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Bottom image in the two-image hero reveal (revealed underneath as the cursor erases the top layer). Leave empty to use the built-in default.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
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
