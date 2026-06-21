import { defineField, defineType } from 'sanity'

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'seriesName',
      title: 'Series Name',
      type: 'string',
      description: 'The name of this series or body of work. E.g. "Fragments Charcoal"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'seriesName', maxLength: 96 },
      description: 'Auto-generated from the series name. Click "Generate" after entering the name.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      description: 'A short description shown on the Works listing and the individual series page.',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
      description: 'Upload one or more images for this series. Drag to reorder. The first image is used as the cover.',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Year this series was created (optional).',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = appears first on the Works page.',
    }),
  ],
  preview: {
    select: { title: 'seriesName', subtitle: 'year', media: 'images.0' },
  },
})
