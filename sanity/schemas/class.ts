import { defineField, defineType } from 'sanity'

// PHASE 2 — Schema defined now so data structure is ready. No UI built yet.
export const classSchema = defineType({
  name: 'class',
  title: 'Class',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'classType', title: 'Class Type', type: 'string', options: { list: [{ title: 'Video', value: 'video' }, { title: 'Downloadable Bundle', value: 'downloadable' }, { title: 'Both', value: 'both' }], layout: 'radio' } }),
    defineField({ name: 'price', title: 'Price (INR)', type: 'number' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['published', 'draft', 'comingSoon'], layout: 'radio' }, initialValue: 'draft' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status', media: 'coverImage' },
  },
})
