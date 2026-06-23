import { defineField, defineType } from 'sanity'

const RESERVED_SLUGS = ['learn', 'classes', 'login', 'account']

export const shopItemSchema = defineType({
  name: 'shopItem',
  title: 'Shop Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
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
      name: 'images',
      title: 'Product Images',
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
    }),
    defineField({
      name: 'price',
      title: 'Price (INR)',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Short description shown on the product page and shop grid.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = appears first in the shop.',
    }),
    defineField({
      name: 'featuredOnHomepage',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Show this item in the homepage Shop teaser.',
    }),
    defineField({
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      description: 'Controls the sequence among featured homepage shop items. Lower = first.',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'images.0' },
  },
})
