import { imageField } from '@/lib/admin/content'
import type { PrintImage } from '@/lib/admin/shop'

export const PROJECT_DESCRIPTION_SOFT_MAX = 220

export interface ProjectInput {
  name: string
  year: string
  description: string
  photos: PrintImage[]
  showOnHomepage: boolean
}

function photosFrom(v: unknown): PrintImage[] {
  return Array.isArray(v)
    ? v
        .filter((p) => p && typeof p.assetId === 'string' && p.assetId)
        .map((p) => ({ assetId: p.assetId, alt: String(p.alt ?? '').slice(0, 200), key: p.key }))
    : []
}

export function validateProject(
  raw: Record<string, unknown>
): { ok: true; value: ProjectInput } | { ok: false; errors: Partial<Record<keyof ProjectInput, string>> } {
  const name = String(raw.name ?? '').trim().slice(0, 120)
  const photos = photosFrom(raw.photos)
  const errors: Partial<Record<keyof ProjectInput, string>> = {}
  if (!name) errors.name = 'Add a name'
  if (!photos.length) errors.photos = 'Add at least one photo'
  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: {
      name,
      year: String(raw.year ?? '').trim().slice(0, 40),
      description: String(raw.description ?? '').trim().slice(0, 2000),
      photos,
      showOnHomepage: raw.showOnHomepage === true,
    },
  }
}

export function toProjectFields(v: ProjectInput) {
  return {
    seriesName: v.name,
    year: v.year || null,
    description: v.description || null,
    featuredOnHomepage: v.showOnHomepage,
    gallery: v.photos.map((p) => imageField(p, v.name)),
  }
}
