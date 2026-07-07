import { defineType, defineField } from 'sanity'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'personName',
      title: 'Person Name',
      type: 'string',
      description: 'Role or context can go here too, e.g. "Priya N. — collector, Hyderabad".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'personImage',
      title: 'Person Photo',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. Leave empty to show the quote without a photo.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers show first.',
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'personName', subtitle: 'quote', media: 'personImage' },
  },
})
