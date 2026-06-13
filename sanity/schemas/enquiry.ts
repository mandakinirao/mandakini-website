import { defineField, defineType } from 'sanity'

/**
 * Private Collection enquiry — created by the site's /api/enquiry
 * route, never by hand. `status` feeds the future /admin panel.
 * NOTE: this document never references private artworks; the private
 * collection is intentionally absent from the CMS and the site.
 */
export const enquirySchema = defineType({
  name: 'enquiry',
  title: 'Private Collection Enquiry',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({
      name: 'message',
      title: 'What draws you to the collection?',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'budgetRange',
      title: 'Budget Range',
      type: 'string',
      options: {
        // Placeholder tiers — Mandakini can rename these later.
        list: ['Prefer not to say', 'Modest range', 'Mid range', 'Premium range'],
      },
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Responded', value: 'responded' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'status' },
  },
})
