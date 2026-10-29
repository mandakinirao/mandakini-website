import type { Photo } from '@/components/admin/PhotoDropzone'
import type { PrintImage } from '@/lib/admin/shop'

/** Sanity image (as read by ADMIN queries) → a ready Photo for the drop zone. */
export function toPhoto(
  img: { _key?: string; alt?: string; assetId?: string; url?: string } | null | undefined,
  fallbackName = 'photo'
): Photo | null {
  if (!img?.assetId) return null
  return {
    key: img._key || img.assetId,
    name: img.alt || fallbackName,
    alt: img.alt ?? '',
    status: 'done',
    assetId: img.assetId,
    url: img.url,
  }
}

/** Uploaded Photo → the plain value server actions accept. */
export function toPrintImage(p: Photo | null): PrintImage | null {
  return p && p.status === 'done' && p.assetId ? { assetId: p.assetId, alt: p.alt, key: p.key } : null
}

/** GROQ projection for one image field, matching toPhoto's input. */
export const IMAGE_PROJECTION = `{ _key, alt, "assetId": asset._ref, "url": asset->url }`
