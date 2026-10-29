import { imageField } from '@/lib/admin/content'
import { safeHref, type PTBlock, type PTLink, type PTSpan } from '@/lib/admin/richtext'
import type { PrintImage } from '@/lib/admin/shop'

export type PhotoPosition = 'left' | 'right' | 'top' | 'bottom'
export type PhotoDisplay = 'collage' | 'carousel'

export interface JournalPhoto extends PrintImage {
  caption?: string
}

export interface ParagraphInput {
  key: string
  text: PTBlock[]
  photos: JournalPhoto[]
  position: PhotoPosition
  displayMode: PhotoDisplay
  pullQuote: boolean
}

export interface PostInput {
  title: string
  kicker: string
  excerpt: string
  cover: PrintImage | null
  publishedAt: string
  featured: boolean
  paragraphs: ParagraphInput[]
}

const POSITIONS: PhotoPosition[] = ['left', 'right', 'top', 'bottom']
const newKey = () => Math.random().toString(36).slice(2, 14)
const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

/** Re-sanitise text from the browser: normal style, bold/italic, safe links only. */
function cleanBlocks(raw: unknown): PTBlock[] {
  if (!Array.isArray(raw)) return []
  const out: PTBlock[] = []
  for (const b of raw) {
    if (!b || typeof b !== 'object' || !Array.isArray(b.children)) continue
    const links: PTLink[] = (Array.isArray(b.markDefs) ? b.markDefs : [])
      .filter((d: PTLink) => d && d._type === 'link' && typeof d._key === 'string' && safeHref(d.href))
      .map((d: PTLink) => ({ _key: d._key, _type: 'link' as const, href: safeHref(d.href) as string }))
    const linkKeys = new Set(links.map((l) => l._key))
    const children: PTSpan[] = b.children
      .filter((c: PTSpan) => c && typeof c.text === 'string' && c.text.length > 0)
      .map((c: PTSpan) => ({
        _type: 'span' as const,
        _key: typeof c._key === 'string' ? c._key : newKey(),
        text: c.text.slice(0, 10000),
        marks: (Array.isArray(c.marks) ? c.marks : []).filter((m) => m === 'strong' || m === 'em' || linkKeys.has(m)),
      }))
    if (!children.some((c) => c.text.trim())) continue
    const used = new Set(children.flatMap((c) => c.marks))
    out.push({
      _type: 'block',
      _key: typeof b._key === 'string' ? b._key : newKey(),
      style: 'normal',
      markDefs: links.filter((l) => used.has(l._key)),
      children,
    })
  }
  return out
}

function cleanPhotos(raw: unknown): JournalPhoto[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((p) => p && typeof p.assetId === 'string' && p.assetId)
    .map((p) => ({ assetId: p.assetId, alt: str(p.alt, 200), caption: str(p.caption, 200), key: typeof p.key === 'string' ? p.key : undefined }))
}

export function validatePost(raw: Record<string, unknown>): { ok: true; value: PostInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const title = str(raw.title, 160)
  const c = raw.cover as PrintImage | null | undefined
  const cover = c && typeof c.assetId === 'string' && c.assetId ? { assetId: c.assetId, alt: str(c.alt, 200), key: c.key } : null

  const paragraphs: ParagraphInput[] = (Array.isArray(raw.paragraphs) ? raw.paragraphs : [])
    .map((p: Record<string, unknown>) => {
      const photos = cleanPhotos(p?.photos)
      return {
        key: typeof p?.key === 'string' && p.key ? p.key : newKey(),
        text: cleanBlocks(p?.text),
        photos,
        position: POSITIONS.includes(p?.position as PhotoPosition) ? (p.position as PhotoPosition) : 'right',
        displayMode: p?.displayMode === 'carousel' ? 'carousel' : 'collage',
        pullQuote: p?.pullQuote === true && photos.length === 0,
      } as ParagraphInput
    })
    .filter((p) => p.text.length > 0 || p.photos.length > 0)

  if (!title) errors.title = 'Add a title'
  if (!cover) errors.cover = 'Add a cover photo'
  if (!paragraphs.length) errors.paragraphs = 'Write at least one paragraph'
  if (Object.keys(errors).length) return { ok: false, errors }

  const date = Date.parse(String(raw.publishedAt ?? ''))
  return {
    ok: true,
    value: {
      title,
      kicker: str(raw.kicker, 120),
      excerpt: str(raw.excerpt, 600),
      cover,
      publishedAt: Number.isFinite(date) ? new Date(date).toISOString() : new Date().toISOString(),
      featured: raw.featured === true,
      paragraphs,
    },
  }
}

export function toPostFields(v: PostInput) {
  return {
    title: v.title,
    kicker: v.kicker || null,
    excerpt: v.excerpt || null,
    coverImage: imageField(v.cover, v.title),
    publishedAt: v.publishedAt,
    featured: v.featured,
    body: v.paragraphs.map((p) => {
      const section: Record<string, unknown> = { _type: 'journalSection', _key: p.key, text: p.text }
      if (p.photos.length) {
        section.images = p.photos.map((ph) => {
          const img = imageField(ph, v.title) as Record<string, unknown>
          if (ph.caption) img.caption = ph.caption
          return img
        })
        section.position = p.position
        section.displayMode = p.displayMode
      }
      section.pullQuote = p.pullQuote
      return section
    }),
  }
}
