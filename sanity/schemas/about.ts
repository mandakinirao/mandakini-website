import { defineField, defineType } from 'sanity'

export const aboutSchema = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'bio', title: 'Bio', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'artistStatement', title: 'Artist Statement', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'profilePhotos', title: 'Profile Photos', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'studioPhotos', title: 'Studio Photos', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'cv', title: 'CV', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'exhibitionHistory',
      title: 'Exhibition History',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'year', title: 'Year', type: 'number' },
          { name: 'exhibitionName', title: 'Exhibition Name', type: 'string' },
          { name: 'venue', title: 'Venue', type: 'string' },
          { name: 'location', title: 'Location / City', type: 'string' },
        ],
        preview: { select: { title: 'exhibitionName', subtitle: 'year' } },
      }],
    }),
  ],
  preview: {
    prepare() { return { title: 'About Page' } },
  },
} as any)
