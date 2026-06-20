import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'homepage', title: 'Homepage', default: true },
    { name: 'works',    title: 'Works' },
    { name: 'shop',     title: 'Shop' },
    { name: 'contact',  title: 'Contact' },
    { name: 'social',   title: 'Social' },
    { name: 'seo',      title: 'SEO' },
  ],
  fields: [
    // ── Homepage ────────────────────────────────────────────────────────────
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'homepage',
      description: 'Shown beneath the artist name on the hero and loading screen. E.g. "Painter · Educator · Storyteller"',
    }),
    defineField({
      name: 'aboutPortrait',
      title: 'About Portrait',
      type: 'image',
      options: { hotspot: true },
      group: 'homepage',
      description: 'Portrait shown in the About section on the homepage.',
    }),
    defineField({
      name: 'aboutBio',
      title: 'About Bio (one line)',
      type: 'string',
      group: 'homepage',
      description: 'Single sentence shown beside the portrait in the homepage About section.',
    }),
    defineField({
      name: 'heroImages',
      title: 'Hero Panels (7 images, centre outward)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'homepage',
      description: 'Upload exactly 7 images. The 4th position is the centre card; the others fan left–right. Leave empty to use the built-in placeholder set.',
      validation: (Rule) => Rule.max(7),
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Featured Projects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
      group: 'homepage',
      description: 'Projects shown in the homepage Works stage. Falls back to the four most recent published projects if left empty.',
    }),
    defineField({
      name: 'featuredShopItems',
      title: 'Featured Shop Items',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'shopItem' }] }],
      group: 'homepage',
      description: 'Shop items shown in the homepage Shop teaser. Falls back to the three most recent available items if left empty.',
    }),

    // ── Works ────────────────────────────────────────────────────────────────
    defineField({
      name: 'worksPageHeadline',
      title: 'Works Page Headline',
      type: 'string',
      group: 'works',
      description: 'Large heading on the /works listing page. E.g. "Bodies of work"',
    }),
    defineField({
      name: 'worksEmptyHeadline',
      title: 'Works Empty State Headline',
      type: 'string',
      group: 'works',
      description: 'Heading shown when no projects are published yet.',
    }),
    defineField({
      name: 'worksEmptyBody',
      title: 'Works Empty State Body',
      type: 'string',
      group: 'works',
      description: 'Supporting line shown below the empty state headline on /works.',
    }),

    // ── Shop ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'shopPageHeadline',
      title: 'Shop Page Headline',
      type: 'string',
      group: 'shop',
      description: 'Large heading on the /shop listing page.',
    }),
    defineField({
      name: 'shopPrintNote',
      title: 'Shop Print Note',
      type: 'string',
      group: 'shop',
      description: 'Small note at the bottom of the shop listing. E.g. "Each print is signed and numbered in the Hyderabad studio."',
    }),
    defineField({
      name: 'printDefaultPaper',
      title: 'Default Paper Spec',
      type: 'string',
      group: 'shop',
      description: 'Shown in the print spec table on every product page. E.g. "308gsm cotton rag, archival"',
    }),
    defineField({
      name: 'printDefaultSignature',
      title: 'Default Signature Spec',
      type: 'string',
      group: 'shop',
      description: 'Shown in the print spec table. E.g. "Signed & numbered by hand"',
    }),
    defineField({
      name: 'printDefaultShipping',
      title: 'Default Shipping Spec',
      type: 'string',
      group: 'shop',
      description: 'Shown in the print spec table. E.g. "Rolled, worldwide from Hyderabad"',
    }),
    defineField({
      name: 'thankYouMessage',
      title: 'Thank You Page Message',
      type: 'text',
      rows: 3,
      group: 'shop',
      description: 'Shown on /thank-you after a successful purchase.',
    }),
    defineField({
      name: 'privateCollectionTitle',
      title: 'Private Collection Title',
      type: 'string',
      group: 'shop',
      description: 'Heading for the Private Collection enquiry block on the shop page.',
    }),
    defineField({
      name: 'privateCollectionLine',
      title: 'Private Collection Description',
      type: 'text',
      rows: 2,
      group: 'shop',
      description: 'One or two sentences below the Private Collection heading.',
    }),

    // ── Contact ───────────────────────────────────────────────────────────────
    defineField({
      name: 'contactPageIntro',
      title: 'Contact Page Intro',
      type: 'text',
      rows: 3,
      group: 'contact',
      description: 'Introductory paragraph shown at the top of the /contact page.',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'contact',
      description: 'Displayed as a mailto link on the contact page. E.g. studio@mandakinirao.com',
    }),

    // ── Social ────────────────────────────────────────────────────────────────
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Display Handle',
      type: 'string',
      group: 'social',
      description: 'Shown in the footer. E.g. @mandakini_rao',
    }),
    defineField({
      name: 'youtubeChannelName',
      title: 'YouTube Channel Name',
      type: 'string',
      group: 'social',
      description: 'Shown in the footer. E.g. @mandakinirao',
    }),

    // ── SEO ───────────────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'Default SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Fallback page title used in browser tabs and search results when a page does not set its own.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default SEO Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Fallback meta description used in search results when a page does not set its own. Keep under 160 characters.',
    }),
  ],
  preview: {
    prepare() { return { title: 'Site Settings' } },
  },
} as any)
