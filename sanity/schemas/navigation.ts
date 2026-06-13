import { defineField, defineType } from 'sanity'

export const navigationSchema = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'mainNavItems',
      title: 'Main Navigation',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', title: 'Label', type: 'string' },
          { name: 'href', title: 'Link', type: 'string' },
          { name: 'order', title: 'Order', type: 'number' },
        ],
        preview: { select: { title: 'label', subtitle: 'href' } },
      }],
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer Links',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', title: 'Label', type: 'string' },
          { name: 'href', title: 'Link', type: 'string' },
        ],
        preview: { select: { title: 'label' } },
      }],
    }),
  ],
  preview: {
    prepare() { return { title: 'Navigation' } },
  },
} as any)
