import { defineField, defineType } from 'sanity'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
    defineField({ name: 'author', title: 'Author', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number', initialValue: 99 }),
  ],
  preview: {
    select: { title: 'author', subtitle: 'quote' },
  },
})
