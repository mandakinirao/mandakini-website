import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'navigation', title: 'Navigation', default: true },
    { name: 'footer',     title: 'Footer' },
    { name: 'commerce',   title: 'Commerce' },
  ],
  fields: [
    // ── Navigation ─────────────────────────────────────────────────────────
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      group: 'navigation',
      description: 'Site logo shown in the navigation bar. Leave empty to use the text logotype.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          initialValue: 'Mandakini Rao',
        }),
      ],
    }),
    defineField({
      name: 'navItems',
      title: 'Nav Items',
      type: 'array',
      group: 'navigation',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'href',  title: 'Path',  type: 'string', description: 'e.g. /works or /shop', validation: (Rule) => Rule.required() }),
            defineField({ name: 'order', title: 'Order', type: 'number', initialValue: 99 }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
      description: 'Main navigation links shown in the header.',
    }),

    // ── Footer ─────────────────────────────────────────────────────────────
    defineField({
      name: 'footerText',
      title: 'Footer Text',
      type: 'text',
      rows: 2,
      group: 'footer',
      description: 'Short attribution or copyright line shown in the site footer.',
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
      group: 'footer',
      initialValue: '@mandakini_rao',
      description: 'Shown in the footer. Include the @ symbol. E.g. @mandakini_rao',
    }),
    defineField({
      name: 'youtubeHandle',
      title: 'YouTube Handle',
      type: 'string',
      group: 'footer',
      initialValue: '@mandakinirao',
      description: 'Shown in the footer. Include the @ symbol. E.g. @mandakinirao',
    }),

    // ── Commerce ───────────────────────────────────────────────────────────
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: 'commerce',
      initialValue: 'INR',
      description: 'ISO 4217 currency code for prices displayed in the shop. E.g. INR, USD.',
    }),
    defineField({
      name: 'shippingNote',
      title: 'Shipping Note',
      type: 'text',
      rows: 3,
      group: 'commerce',
      description: 'Shown on product pages to describe shipping terms and timelines.',
    }),
    defineField({
      name: 'enquiryRecipientEmail',
      title: 'Enquiry Recipient Email',
      type: 'string',
      group: 'commerce',
      description: 'Email address that receives private collection enquiry form submissions.',
    }),
    defineField({
      name: 'privateCollectionCtaLabel',
      title: 'Private Collection CTA Label',
      type: 'string',
      group: 'commerce',
      initialValue: 'Enquire to view the private collection',
      description: 'Button/link label for the private collection call to action.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
} as any)
