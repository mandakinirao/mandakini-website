import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'homepageHeadline', title: 'Homepage Headline', type: 'string' }),
    defineField({ name: 'homepageSubtext', title: 'Homepage Subtext', type: 'string' }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Shown beneath the name on the hero and loading screen. E.g. "Painter · Educator · Storyteller"',
    }),
    defineField({
      name: 'aboutPortrait',
      title: 'About Portrait',
      type: 'image',
      options: { hotspot: true },
      description: 'The portrait shown in the About section on the homepage.',
    }),
    defineField({
      name: 'aboutBio',
      title: 'About Bio (one line)',
      type: 'string',
      description: 'Single sentence shown beside the portrait in the About section.',
    }),
    defineField({ name: 'featuredProjects', title: 'Featured Projects (Homepage)', type: 'array', of: [{ type: 'reference', to: [{ type: 'project' }] }] }),
    defineField({ name: 'featuredShopItems', title: 'Featured Shop Items (Homepage)', type: 'array', of: [{ type: 'reference', to: [{ type: 'shopItem' }] }] }),
    defineField({
      name: 'heroImages',
      title: 'Hero Panels (7 images, centre outward)',
      description:
        'Upload exactly 7 images. The 4th position is the centre card; the others fan left–right. Leave empty to use the built-in Subbulakshmi placeholder set.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.max(7),
    }),
    defineField({ name: 'signupCtaText', title: 'Signup CTA Text', type: 'string' }),
    defineField({
      name: 'shopPageHeadline',
      title: 'Shop Page Headline',
      type: 'string',
      description: 'Large heading on the /shop listing page.',
    }),
    defineField({
      name: 'shopPrintNote',
      title: 'Shop Print Note',
      type: 'string',
      description: 'Small note at the bottom of the shop listing. E.g. "Each print is signed and numbered in the Hyderabad studio."',
    }),
    defineField({
      name: 'printDefaultPaper',
      title: 'Default Paper Spec',
      type: 'string',
      description: 'Shown in the print spec table on every product page.',
    }),
    defineField({
      name: 'printDefaultSignature',
      title: 'Default Signature Spec',
      type: 'string',
    }),
    defineField({
      name: 'printDefaultShipping',
      title: 'Default Shipping Spec',
      type: 'string',
    }),
    defineField({
      name: 'thankYouMessage',
      title: 'Thank You Page Message',
      type: 'text',
      rows: 3,
      description: 'Shown on /thank-you after a successful purchase.',
    }),
    defineField({
      name: 'contactPageIntro',
      title: 'Contact Page Intro',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'privateCollectionTitle',
      title: 'Private Collection Title',
      type: 'string',
    }),
    defineField({
      name: 'privateCollectionLine',
      title: 'Private Collection Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'youtube', title: 'YouTube URL', type: 'url' },
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
      ],
    }),
    defineField({ name: 'contactEmail', title: 'Contact Email', type: 'string' }),
    defineField({ name: 'seoTitle', title: 'Default SEO Title', type: 'string' }),
    defineField({ name: 'seoDescription', title: 'Default SEO Description', type: 'text', rows: 3 }),
  ],
  preview: {
    prepare() { return { title: 'Site Settings' } },
  },
} as any)
