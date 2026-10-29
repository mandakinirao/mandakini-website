import { imageField } from '@/lib/admin/content'
import type { PrintImage } from '@/lib/admin/shop'
import type { EnrichedPressItem, RawPressItem } from '@/lib/press'

export const PRESS_TYPES = ['article', 'video', 'podcast'] as const
export type PressType = (typeof PRESS_TYPES)[number]

export interface PressInput {
  link: string | null
  type: PressType
  headline: string
  source: string
  thumbnail: PrintImage | null
  logoCard: boolean
  showOnHomepage: boolean
}

export function validatePress(
  raw: Record<string, unknown>
): { ok: true; value: PressInput } | { ok: false; errors: Partial<Record<keyof PressInput, string>> } {
  const link = String(raw.link ?? '').trim()
  const t = raw.thumbnail as PrintImage | null | undefined
  const thumbnail = t && typeof t.assetId === 'string' && t.assetId ? { assetId: t.assetId, alt: String(t.alt ?? ''), key: t.key } : null
  const errors: Partial<Record<keyof PressInput, string>> = {}
  if (link && !/^https?:\/\/\S+\.\S+/.test(link)) errors.link = "That link doesn't look right"
  else if (!link && !thumbnail) errors.link = 'Add the link or a photo of the clipping'
  if (Object.keys(errors).length) return { ok: false, errors }
  const type = (PRESS_TYPES as readonly string[]).includes(String(raw.type)) ? (raw.type as PressType) : 'article'
  return {
    ok: true,
    value: {
      link: link || null,
      type,
      headline: String(raw.headline ?? '').trim().slice(0, 200),
      source: String(raw.source ?? '').trim().slice(0, 120),
      thumbnail,
      logoCard: raw.logoCard === true,
      showOnHomepage: raw.showOnHomepage === true,
    },
  }
}

export function toPressFields(v: PressInput) {
  return {
    link: v.link,
    type: v.type,
    headlineOverride: v.headline || null,
    source: v.source || null,
    thumbnailOverride: imageField(v.thumbnail, v.headline || v.source || 'Press clipping'),
    logoCard: v.logoCard,
    featuredOnHomepage: v.showOnHomepage,
  }
}

/** Reads the page's headline/source/image the same way the site does; never throws. */
export async function lookUpLink(
  url: string,
  enrich: (items: RawPressItem[]) => Promise<EnrichedPressItem[]>
): Promise<{ headline?: string; source?: string; image?: string }> {
  try {
    const [found] = await enrich([{ _id: 'lookup', link: url, type: 'article' }])
    if (!found) return {}
    const out: { headline?: string; source?: string; image?: string } = {}
    if (found.headline) out.headline = found.headline
    if (found.source) out.source = found.source
    if (found.thumbnail) out.image = found.thumbnail
    return out
  } catch {
    return {}
  }
}
