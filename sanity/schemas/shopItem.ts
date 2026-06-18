import { defineField, defineType } from 'sanity'

export const shopItemSchema = defineType({
  name: 'shopItem',
  title: 'Shop Item',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() }),
    defineField({ name: 'artwork', title: 'Artwork', type: 'reference', to: [{ type: 'artwork' }] }),
    defineField({ name: 'itemType', title: 'Item Type', type: 'string', options: { list: [{ title: 'Print', value: 'print' }, { title: 'Original', value: 'original' }, { title: 'Limited Edition', value: 'limitedEdition' }, { title: 'Commission', value: 'commission' }], layout: 'radio' }, initialValue: 'print' }),
    defineField({
      name: 'purchaseType',
      title: 'Purchase Type',
      type: 'string',
      options: {
        list: [
          { title: 'Buy (listed in the shop)', value: 'buy' },
          { title: 'Private Collection (never shown anywhere)', value: 'privateCollection' },
        ],
        layout: 'radio',
      },
      initialValue: 'buy',
      description:
        'Private Collection items never render images or listings anywhere on the site — they are shared personally after an enquiry.',
    }),
    defineField({
      name: 'desc',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Short description shown on the product page and shop grid.',
    }),
    defineField({ name: 'basePrice', title: 'Base Price (INR)', type: 'number' }),
    defineField({
      name: 'stock',
      title: 'Stock',
      type: 'number',
      initialValue: 0,
      description:
        'Units available to buy. 0 shows a quiet “Sold” state. Decremented automatically by the Stripe webhook.',
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'Optional until Stripe keys exist — checkout falls back to the Sanity price.',
    }),
    defineField({
      name: 'sizes',
      title: 'Available Sizes',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', title: 'Size Label (e.g. A4, A3, 8x10)', type: 'string' },
          { name: 'price', title: 'Price (INR)', type: 'number' },
        ],
        preview: { select: { title: 'label', subtitle: 'price' } },
      }],
    }),
    defineField({ name: 'frameOptions', title: 'Frame Options', type: 'string', options: { list: [{ title: 'Framed', value: 'framed' }, { title: 'Unframed', value: 'unframed' }, { title: 'Both Available', value: 'both' }], layout: 'radio' }, initialValue: 'both' }),
    defineField({ name: 'editionNumber', title: 'Edition Number', type: 'number' }),
    defineField({ name: 'editionSize', title: 'Edition Size (e.g. 50)', type: 'number' }),
    defineField({ name: 'sold', title: 'Sold (count)', type: 'number', initialValue: 0, description: 'Managed by the Stripe webhook in V1.x — do not edit by hand. Sold ≥ edition size shows “Sold out”.' }),
    defineField({ name: 'certificateIncluded', title: 'Certificate Included', type: 'boolean', initialValue: false }),
    defineField({ name: 'availabilityStatus', title: 'Availability Status', type: 'string', options: { list: [{ title: 'Available', value: 'available' }, { title: 'Sold Out', value: 'soldOut' }, { title: 'Limited', value: 'limited' }], layout: 'radio' }, initialValue: 'available' }),
    defineField({ name: 'images', title: 'Product Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'shippingInfo', title: 'Shipping Info', type: 'text', rows: 3 }),
    defineField({ name: 'stripeProductId', title: 'Stripe Product ID', type: 'string', description: 'Set this after creating the product in Stripe dashboard' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'availabilityStatus', media: 'images.0' },
  },
})
