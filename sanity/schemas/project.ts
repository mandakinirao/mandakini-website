import { defineField, defineType } from 'sanity'

const RESERVED_SLUGS = ['learn', 'classes', 'login', 'account']

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
      validation: (Rule) =>
        Rule.required().custom((slug: { current?: string } | undefined) => {
          const current = slug?.current
          if (!current) return true
          if (RESERVED_SLUGS.includes(current)) {
            return `"${current}" is a reserved route — choose a different slug.`
          }
          return true
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      description: 'A short description shown on the Works listing and the individual series page.',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describe the image for screen readers and SEO.',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      options: { layout: 'grid' },
      description:
        'Upload one or more images for this series. Drag to reorder. The first image is used as the cover. Alt text is required on each image.',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'Year this series was created, e.g. "2024" or "2023–24" (optional).',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = appears first on the Works page.',
    }),
    defineField({
      name: 'featuredOnHomepage',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Show this series in the homepage Works stage.',
    }),
    defineField({
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      description: 'Controls the sequence when multiple series are featured on the homepage. Lower = first.',
    }),
  ],
  preview: {
    select: { title: 'seriesName', subtitle: 'year', media: 'gallery.0' },
  },
})
