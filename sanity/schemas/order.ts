import { defineField, defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      description: 'Human-readable reference, e.g. MR-2024-001.',
    }),
    defineField({ name: 'customerName', title: 'Customer Name', type: 'string' }),
    defineField({ name: 'customerEmail', title: 'Customer Email', type: 'string' }),
    defineField({ name: 'customerPhone', title: 'Customer Phone', type: 'string' }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'text',
      rows: 4,
      description: 'Full shipping address as a block of text.',
    }),
    defineField({
      name: 'items',
      title: 'Items Ordered',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'shopItem',
              title: 'Shop Item',
              type: 'reference',
              to: [{ type: 'shopItem' }],
            }),
            defineField({ name: 'quantity', title: 'Quantity', type: 'number' }),
            defineField({ name: 'priceAtPurchase', title: 'Price at Purchase (INR)', type: 'number' }),
          ],
          preview: {
            select: { title: 'shopItem.title', subtitle: 'priceAtPurchase' },
          },
        },
      ],
    }),
    defineField({ name: 'amountTotal', title: 'Total Amount (INR)', type: 'number' }),
    defineField({
      name: 'razorpayPaymentId',
      title: 'Razorpay Payment ID',
      type: 'string',
      description: 'Idempotency key from Razorpay — one order per payment.',
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Paid', value: 'paid' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'paid',
    }),
    defineField({
      name: 'awbNumber',
      title: 'AWB Number',
      type: 'string',
      description: 'Air Waybill / tracking number. Enter after shipping the order.',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'Timestamp set by the payment webhook when the order is first created.',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'customerName', subtitle: 'status' },
  },
})
