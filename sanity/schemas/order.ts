import { defineField, defineType } from 'sanity'

/**
 * Orders are created by the Razorpay webhook only (app/api/razorpay/webhook).
 * Every field except status/awbNumber/courierName is read-only in Studio —
 * Mandakini's only job here is updating shipping status, never editing the
 * payment/customer record itself.
 */
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
      readOnly: true,
    }),
    defineField({
      name: 'razorpayOrderId',
      title: 'Razorpay Order ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'razorpayPaymentId',
      title: 'Razorpay Payment ID',
      type: 'string',
      description: 'Idempotency key from Razorpay — one order per payment.',
      readOnly: true,
    }),
    defineField({ name: 'customerName', title: 'Customer Name', type: 'string', readOnly: true }),
    defineField({ name: 'customerEmail', title: 'Customer Email', type: 'string', readOnly: true }),
    defineField({ name: 'customerPhone', title: 'Customer Phone', type: 'string', readOnly: true }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'text',
      rows: 4,
      description: 'Full shipping address as a block of text.',
      readOnly: true,
    }),
    defineField({
      name: 'items',
      title: 'Items Ordered',
      type: 'array',
      readOnly: true,
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
            defineField({ name: 'title', title: 'Title (snapshot)', type: 'string' }),
            defineField({ name: 'quantity', title: 'Quantity', type: 'number' }),
            defineField({ name: 'priceAtPurchase', title: 'Price at Purchase (INR)', type: 'number' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'priceAtPurchase' },
          },
        },
      ],
    }),
    defineField({
      name: 'amountTotal',
      title: 'Total Amount (INR)',
      type: 'number',
      readOnly: true,
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
      name: 'courierName',
      title: 'Courier Name',
      type: 'string',
      description: 'e.g. Delhivery, Bluedart. Enter after shipping the order.',
    }),
    defineField({
      name: 'shippedEmailSent',
      title: 'Shipped Email Sent',
      type: 'boolean',
      initialValue: false,
      description: 'Set automatically once the shipping-confirmation email has gone out.',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'Timestamp set by the payment webhook when the order is first created.',
      readOnly: true,
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
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customerName',
      amountTotal: 'amountTotal',
      status: 'status',
    },
    prepare({ orderNumber, customerName, amountTotal, status }) {
      const amount = typeof amountTotal === 'number' ? `₹${amountTotal.toLocaleString('en-IN')}` : '—'
      const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Paid'
      return {
        title: orderNumber || customerName || 'Untitled order',
        subtitle: `${customerName || 'Unknown customer'} · ${amount} · ${statusLabel}`,
      }
    },
  },
})
