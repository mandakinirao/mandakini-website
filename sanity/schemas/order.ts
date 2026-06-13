import { defineField, defineType } from 'sanity'

export const orderSchema = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({ name: 'orderId', title: 'Order ID (Stripe)', type: 'string' }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe Checkout Session ID',
      type: 'string',
      description: 'Idempotency key — one order per checkout session, webhook replays never duplicate.',
    }),
    defineField({ name: 'customerName', title: 'Customer Name', type: 'string' }),
    defineField({ name: 'customerEmail', title: 'Customer Email', type: 'string' }),
    defineField({ name: 'customerPhone', title: 'Customer Phone', type: 'string' }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'object',
      fields: [
        { name: 'line1', title: 'Address Line 1', type: 'string' },
        { name: 'line2', title: 'Address Line 2', type: 'string' },
        { name: 'city', title: 'City', type: 'string' },
        { name: 'state', title: 'State', type: 'string' },
        { name: 'pincode', title: 'Pincode', type: 'string' },
        { name: 'country', title: 'Country', type: 'string', initialValue: 'India' },
      ],
    }),
    defineField({
      name: 'items',
      title: 'Items Ordered',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'shopItemRef', title: 'Shop Item', type: 'reference', to: [{ type: 'shopItem' }] },
          { name: 'sizeSelected', title: 'Size Selected', type: 'string' },
          { name: 'frameOption', title: 'Frame Option', type: 'string' },
          { name: 'quantity', title: 'Quantity', type: 'number' },
          { name: 'price', title: 'Price (INR)', type: 'number' },
        ],
      }],
    }),
    defineField({ name: 'totalAmount', title: 'Total Amount (INR)', type: 'number' }),
    defineField({ name: 'paymentStatus', title: 'Payment Status', type: 'string', options: { list: ['paid', 'pending', 'refunded'], layout: 'radio' }, initialValue: 'pending' }),
    defineField({ name: 'fulfillmentStatus', title: 'Fulfillment Status', type: 'string', options: { list: ['new', 'processing', 'shipped', 'delivered'], layout: 'radio' }, initialValue: 'new' }),
    defineField({ name: 'waybillNumber', title: 'Waybill Number', type: 'string', description: 'Enter after shipping the order' }),
    defineField({ name: 'courierProvider', title: 'Courier Provider', type: 'string', description: 'e.g. Delhivery, India Post, Shiprocket' }),
    defineField({ name: 'orderDate', title: 'Order Date', type: 'datetime' }),
    defineField({ name: 'shippedDate', title: 'Shipped Date', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'customerName', subtitle: 'fulfillmentStatus' },
  },
})
