import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'homepageHeadline', title: 'Homepage Headline', type: 'string' }),
    defineField({ name: 'homepageSubtext', title: 'Homepage Subtext', type: 'string' }),
    defineField({ name: 'featuredProjects', title: 'Featured Projects (Homepage)', type: 'array', of: [{ type: 'reference', to: [{ type: 'project' }] }] }),
    defineField({ name: 'featuredShopItems', title: 'Featured Shop Items (Homepage)', type: 'array', of: [{ type: 'reference', to: [{ type: 'shopItem' }] }] }),
    defineField({ name: 'signupCtaText', title: 'Signup CTA Text', type: 'string' }),
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
