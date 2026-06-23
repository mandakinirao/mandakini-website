import { defineConfig } from 'sanity'
import { deskTool, type StructureBuilder } from 'sanity/desk'
import { schemaTypes } from './sanity/schemas'

const PINNED = [
  'homepage',
  'siteSettings',
  'about',
  'project',
  'shopItem',
  'order',
  'pressItem',
  'testimonial',
  'enquiry',
]

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // ── Settings ────────────────────────────────────────────────────────
      S.listItem()
        .title('Homepage')
        .id('homepage')
        .child(S.document().schemaType('homepage').documentId('homepage')),
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('About')
        .id('about')
        .child(S.document().schemaType('about').documentId('about')),
      S.divider(),

      // ── Work ────────────────────────────────────────────────────────────
      S.documentTypeListItem('project').title('Projects (series)'),
      S.documentTypeListItem('pressItem').title('Press'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.divider(),

      // ── Commerce ────────────────────────────────────────────────────────
      S.documentTypeListItem('shopItem').title('Shop Items'),
      S.documentTypeListItem('order').title('Orders'),
      S.documentTypeListItem('enquiry').title('Enquiries'),
      S.divider(),

      // ── Everything else (classes, members, legacy types) ────────────────
      ...S.documentTypeListItems().filter(
        (item) => !PINNED.includes(item.getId() ?? '')
      ),
    ])

export default defineConfig({
  name: 'mandakini-rao',
  title: 'Mandakini Rao',
  basePath: '/studio',
  projectId: 'i4t9kzxg',
  dataset: 'production',
  plugins: [deskTool({ structure })],
  schema: {
    types: schemaTypes,
  },
})
