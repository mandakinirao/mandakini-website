import { createImageUrlBuilder } from '@sanity/image-url'
import type { Image } from 'sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i4t9kzxg'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

const builder = createImageUrlBuilder({ projectId, dataset })

export function urlForImage(source: Image) {
  return builder.image(source).auto('format').fit('max')
}
