import { defineType, defineField } from 'sanity'

export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    // ── Core identity (unchanged) ─────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g. "Mandakini Rao"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'discipline',
      title: 'Discipline / Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'homeSnippet',
      title: 'Home Page Snippet',
      type: 'text',
      rows: 4,
      description:
        'Short bio paragraph shown in the About section on the home page. Leave empty to hide that section.',
    }),

    // ── HERO (Section 1 — flanking arch columns) ──────────────────────────
    defineField({
      name: 'heroLeadIn',
      title: 'Hero — Lead-in label',
      type: 'string',
      description: 'Small all-caps label above the display word, e.g. "Painter · Hyderabad"',
    }),
    defineField({
      name: 'heroDisplayWord',
      title: 'Hero — Display word',
      type: 'string',
      description: 'The large word centred between the two arch paintings, e.g. "MANDAKINI"',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Hero — Subhead',
      type: 'string',
      description: 'Small line beneath the display word',
    }),
    defineField({
      name: 'heroLeftImage',
      title: 'Hero — Left painting',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        {
          name: 'caption',
          title: 'Museum-label caption',
          type: 'string',
          description: 'Title or short credit shown beneath the arch, e.g. "Raga Bhairavi, 2023"',
        },
      ],
    }),
    defineField({
      name: 'heroRightImage',
      title: 'Hero — Right painting',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        {
          name: 'caption',
          title: 'Museum-label caption',
          type: 'string',
        },
      ],
    }),

    // ── BODY (Section 2 — edge-word scroll layer) ─────────────────────────
    defineField({
      name: 'bodyParagraph',
      title: 'Body — Paragraph fragments',
      description:
        'Each string is one fragment, displayed in a fractured 3-column layout. 3–6 fragments recommended.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'edgeWords',
      title: 'Body — Edge words',
      description:
        'Words that drift in from the left or right as the visitor scrolls. These can be disciplines, themes, or painting titles.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'edgeWord',
          title: 'Edge word',
          fields: [
            {
              name: 'text',
              title: 'Word / phrase',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'side',
              title: 'Side',
              type: 'string',
              options: {
                list: [
                  { title: 'Left', value: 'left' },
                  { title: 'Right', value: 'right' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'scale',
              title: 'Size',
              type: 'string',
              options: {
                list: [
                  { title: 'Small (S)', value: 'S' },
                  { title: 'Medium (M)', value: 'M' },
                  { title: 'Large (L)', value: 'L' },
                ],
                layout: 'radio',
              },
              initialValue: 'M',
            },
            {
              name: 'depth',
              title: 'Depth (0 = back / faint / slow — 1 = front / solid / fast)',
              type: 'number',
              initialValue: 1,
              validation: (Rule) => Rule.min(0).max(1),
            },
          ],
          preview: {
            select: { title: 'text', subtitle: 'side' },
          },
        },
      ],
    }),
    defineField({
      name: 'seriesTitles',
      title: 'Body — Series titles',
      description: 'Short list of series or project names shown in the lower-left corner.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'colophon',
      title: 'Body — Colophon lines',
      description:
        'Small label lines in the lower-right corner, e.g. "Painted in Hyderabad", "2011 – present".',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    // ── ABOUT-BLOCK (Section 3 — amber panel, mirrors homepage) ──────────
    defineField({
      name: 'aboutBlockBio',
      title: 'About block — Bio paragraph',
      type: 'text',
      rows: 5,
      description:
        'The bio text shown in the amber panel at the bottom of /about. Separate from the home snippet so the two can differ.',
    }),
    defineField({
      name: 'aboutBlockPortrait',
      title: 'About block — Portrait photo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    }),

    // ── Legacy fields (kept for backwards compat; used by old AboutSection) ─
    defineField({
      name: 'descriptionLines',
      title: 'Description (scattered text — legacy)',
      description: 'Legacy scattered-text rows. Superseded by the Body fields above.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'textRow',
          title: 'Text Row',
          fields: [
            { name: 'col1', title: 'Left fragment', type: 'string' },
            { name: 'col2', title: 'Centre fragment', type: 'string' },
            { name: 'col3', title: 'Right fragment', type: 'string' },
          ],
          preview: { select: { title: 'col1', subtitle: 'col2' } },
        },
      ],
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait photo (legacy)',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    }),
    defineField({ name: 'quote', title: 'Quote (legacy)', type: 'text', rows: 3 }),
    defineField({ name: 'quoteAttribution', title: 'Quote Attribution (legacy)', type: 'string' }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
