import { defineConfig } from 'sanity'
import { deskTool, type StructureBuilder } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

// Desk organised for a non-technical editor: curation first (Site
// Settings), then the things she adds (Projects → Artworks → Shop),
// then everything else.
const PINNED = [
  'siteSettings',
  'project',
  'artwork',
  'shopItem',
  'order',
  'pressItem',
  'testimonial',
]

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings (featured & socials)')
        .id('siteSettings')
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings')
        ),
      S.divider(),
      S.documentTypeListItem('project').title('Projects (series)'),
      S.documentTypeListItem('artwork').title('Artworks (pieces)'),
      S.documentTypeListItem('shopItem').title('Shop items'),
      S.documentTypeListItem('order').title('Orders'),
      S.divider(),
      S.documentTypeListItem('pressItem').title('Press'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
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
  plugins: [deskTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
