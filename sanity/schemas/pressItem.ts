import { defineField, defineType } from 'sanity'

export const pressItemSchema = defineType({
  name: 'pressItem',
  title: 'Press Item',
  type: 'document',
  fields: [
    defineField({ name: 'type', title: 'Type', type: 'string', options: { list: [{ title: 'Testimonial', value: 'testimonial' }, { title: 'Newspaper', value: 'newspaper' }, { title: 'Podcast', value: 'podcast' }, { title: 'Interview', value: 'interview' }, { title: 'Feature', value: 'feature' }], layout: 'radio' }, validation: Rule => Rule.required() }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'source', title: 'Source / Publication / Person', type: 'string' }),
    defineField({ name: 'date', title: 'Date', type: 'date' }),
    defineField({ name: 'excerpt', title: 'Excerpt or Quote', type: 'text', rows: 4 }),
    defineField({ name: 'externalLink', title: 'External Link', type: 'url' }),
    defineField({ name: 'logo', title: 'Publication Logo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'featured', title: 'Show on Homepage Preview', type: 'boolean', initialValue: false }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'type', media: 'logo' },
  },
})
