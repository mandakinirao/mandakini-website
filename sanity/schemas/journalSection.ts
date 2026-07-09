import { defineArrayMember, defineField, defineType } from 'sanity'

export const journalSectionSchema = defineType({
  name: 'journalSection',
  title: 'Paragraph',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto'] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
      description: 'One paragraph of text.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describes the image for screen readers — not shown on the page.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional — shown on the page under the image, e.g. a title or note about the piece.',
            }),
          ],
        }),
      ],
      options: { layout: 'grid' },
      description:
        'Optional — leave empty for a text-only paragraph. Add one image for a single large photo, or several for a collage or carousel.',
    }),
    defineField({
      name: 'pullQuote',
      title: 'Show as pull quote',
      type: 'boolean',
      initialValue: false,
      hidden: ({ parent }) => ((parent as { images?: unknown[] })?.images?.length ?? 0) > 0,
      description:
        'Only for a text-only paragraph. Displays this line large and centered as a visual break in the article, instead of a normal paragraph.',
    }),
    defineField({
      name: 'displayMode',
      title: 'Multiple-image display',
      type: 'string',
      options: {
        list: [
          { title: 'Collage (shown together)', value: 'collage' },
          { title: 'Carousel (one at a time, with thumbnails)', value: 'carousel' },
        ],
        layout: 'radio',
      },
      initialValue: 'collage',
      hidden: ({ parent }) => !(((parent as { images?: unknown[] })?.images?.length ?? 0) >= 2),
      description: 'Only matters with 2 or more images.',
    }),
    defineField({
      name: 'position',
      title: 'Image position relative to text',
      type: 'string',
      options: {
        list: [
          { title: 'Left of text', value: 'left' },
          { title: 'Right of text', value: 'right' },
          { title: 'Above text', value: 'top' },
          { title: 'Below text', value: 'bottom' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
      hidden: ({ parent }) => !(((parent as { images?: unknown[] })?.images?.length ?? 0) >= 1),
      description: 'Only matters when this paragraph has at least one image.',
    }),
  ],
  preview: {
    select: {
      textBlocks: 'text',
      images: 'images',
      displayMode: 'displayMode',
      position: 'position',
      pullQuote: 'pullQuote',
    },
    prepare({ textBlocks, images, displayMode, position, pullQuote }: {
      textBlocks?: { _type: string; children?: { text?: string }[] }[]
      images?: unknown[]
      displayMode?: string
      position?: string
      pullQuote?: boolean
    }) {
      const firstBlock = (textBlocks ?? []).find((b) => b._type === 'block')
      const plain = (firstBlock?.children ?? [])
        .map((c) => c.text ?? '')
        .join('')
        .trim()
      const count = images?.length ?? 0
      const imgLabel =
        count === 0 ? 'no images' : count === 1 ? '1 image' : `${count} images (${displayMode ?? 'collage'})`
      return {
        title: plain ? (plain.length > 60 ? `${plain.slice(0, 60)}…` : plain) : '(empty paragraph)',
        subtitle: count > 0 ? `${imgLabel} · ${position ?? 'right'}` : pullQuote ? 'Pull quote' : imgLabel,
        media: images?.[0] as never,
      }
    },
  },
})
