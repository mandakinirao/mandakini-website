import type { SanityClient } from 'next-sanity'
import type { PrintImage } from '@/lib/admin/shop'

/** One transaction setting `field` to each id's 1-based position. */
export async function reorderDocs(
  client: Pick<SanityClient, 'transaction'>,
  ids: string[],
  field: 'displayOrder' | 'homepageOrder'
): Promise<void> {
  let tx = client.transaction()
  ids.forEach((id, i) => {
    tx = tx.patch(id, (p) => p.set({ [field]: i + 1 }))
  })
  await tx.commit()
}

/** A single Sanity image value, or null when there's no photo. */
export function imageField(img: PrintImage | null, fallbackAlt: string) {
  if (!img?.assetId) return null
  return {
    _type: 'image',
    _key: img.key || Math.random().toString(36).slice(2, 12),
    asset: { _type: 'reference', _ref: img.assetId },
    alt: img.alt?.trim() || fallbackAlt,
  }
}
