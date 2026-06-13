import { defineField, defineType } from 'sanity'

export const artworkSchema = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 } }),
    defineField({ name: 'project', title: 'Project', type: 'reference', to: [{ type: 'project' }] }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'note', title: 'Note', type: 'text', rows: 3, description: 'One or two lines shown under this piece on its series page (optional)' }),
    defineField({ name: 'shopItem', title: 'Shop Item (print edition)', type: 'reference', to: [{ type: 'shopItem' }], description: 'Link the print edition to show the “For sale” marker on the series page. Leave empty if not for sale.' }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number', description: 'Lower number = appears first within its series' }),
    defineField({ name: 'medium', title: 'Medium', type: 'string' }),
    defineField({ name: 'dimensions', title: 'Dimensions', type: 'string' }),
    defineField({ name: 'year', title: 'Year', type: 'number' }),
    defineField({ name: 'availabilityStatus', title: 'Availability', type: 'string', options: { list: [{ title: 'Available', value: 'available' }, { title: 'Sold', value: 'sold' }, { title: 'Enquiry Only', value: 'enquiryOnly' }], layout: 'radio' }, initialValue: 'available' }),
    defineField({ name: 'isSold', title: 'Sold', type: 'boolean', description: 'Sold works remain visible on the website', initialValue: false }),
    defineField({ name: 'printsAvailable', title: 'Prints Available', type: 'boolean', initialValue: false }),
    defineField({ name: 'originalAvailable', title: 'Original Available', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'availabilityStatus', media: 'images.0' },
  },
})
