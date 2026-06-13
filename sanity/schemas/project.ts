import { defineField, defineType } from 'sanity'

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() }),
    defineField({ name: 'year', title: 'Year', type: 'number' }),
    defineField({ name: 'seriesName', title: 'Series Name', type: 'string' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['published', 'draft'], layout: 'radio' }, initialValue: 'draft' }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'artworkImages', title: 'Artwork Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'medium', title: 'Medium', type: 'string' }),
    defineField({ name: 'dimensions', title: 'Dimensions', type: 'string' }),
    defineField({ name: 'projectNote', title: 'Project Note', type: 'text', rows: 4 }),
    defineField({ name: 'projectType', title: 'Project Type', type: 'string', options: { list: [{ title: 'Project Only', value: 'projectOnly' }, { title: 'Project + Shop', value: 'projectWithShop' }], layout: 'radio' }, initialValue: 'projectOnly' }),
    defineField({ name: 'relatedProjects', title: 'Related Projects', type: 'array', of: [{ type: 'reference', to: [{ type: 'project' }] }] }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number', description: 'Lower number = appears first on Works page' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'year', media: 'coverImage' },
  },
})
