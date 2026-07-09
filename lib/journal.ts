import type { Image as SanityImage } from 'sanity'

/**
 * Journal (blog) data loaders. Every function falls back to an empty
 * result on error — the listing page's empty state and detail page's
 * notFound() handle the rest, no throw ever reaches a page component.
 */

export interface JournalImage {
  url: string
  thumbUrl: string
  alt: string
  aspectRatio: number
}

export interface JournalSectionData {
  _key: string
  text: unknown[]
  images: JournalImage[]
  displayMode: 'collage' | 'carousel'
  position: 'left' | 'right' | 'top' | 'bottom'
}

export interface JournalPost {
  _id: string
  title: string
  slug: string
  kicker: string | null
  excerpt: string
  coverImage: JournalImage | null
  publishedAt: string
  featured: boolean
  body: JournalSectionData[]
}

interface RawImage extends SanityImage {
  alt?: string
  aspectRatio?: number
}

interface RawSection {
  _key: string
  text?: unknown[]
  displayMode?: 'collage' | 'carousel'
  position?: 'left' | 'right' | 'top' | 'bottom'
  images?: RawImage[]
}

interface RawJournalPost {
  _id: string
  title: string
  slug: string
  kicker?: string
  excerpt: string
  coverImage?: RawImage
  publishedAt: string
  featured?: boolean
  body?: RawSection[]
}

type UrlFor = (source: SanityImage) => {
  width: (w: number) => { height: (h: number) => { url: () => string }; url: () => string }
}

function resolveImage(raw: RawImage | undefined, urlForImage: UrlFor): JournalImage | null {
  if (!raw?.asset) return null
  try {
    return {
      url: urlForImage(raw).width(2000).url(),
      thumbUrl: urlForImage(raw).width(160).height(160).url(),
      alt: raw.alt ?? '',
      aspectRatio: raw.aspectRatio || 4 / 5,
    }
  } catch {
    return null
  }
}

function resolveSection(raw: RawSection, urlForImage: UrlFor): JournalSectionData {
  const images = (raw.images ?? [])
    .map((img) => resolveImage(img, urlForImage))
    .filter((img): img is JournalImage => img !== null)
  return {
    _key: raw._key,
    text: raw.text ?? [],
    images,
    displayMode: raw.displayMode ?? 'collage',
    position: raw.position ?? 'right',
  }
}

function resolvePost(raw: RawJournalPost, urlForImage: UrlFor): JournalPost {
  return {
    _id: raw._id,
    title: raw.title,
    slug: raw.slug,
    kicker: raw.kicker ?? null,
    excerpt: raw.excerpt,
    coverImage: resolveImage(raw.coverImage, urlForImage),
    publishedAt: raw.publishedAt,
    featured: raw.featured ?? false,
    body: (raw.body ?? []).map((section) => resolveSection(section, urlForImage)),
  }
}

export async function getAllJournalPosts(): Promise<JournalPost[]> {
  try {
    const [{ client }, { urlForImage }, queries] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])
    const raw = await client.fetch<RawJournalPost[] | null>(queries.allJournalPostsQuery)
    if (!raw?.length) return []
    return raw.map((post) => resolvePost(post, urlForImage))
  } catch {
    return []
  }
}

/** Used by the layout to hide the Journal nav link entirely when there's
 *  nothing published yet — shares the listing query's cache, no extra cost. */
export async function hasJournalPosts(): Promise<boolean> {
  const posts = await getAllJournalPosts()
  return posts.length > 0
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  try {
    const [{ client }, { urlForImage }, queries] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])
    const raw = await client.fetch<RawJournalPost | null>(queries.journalPostBySlugQuery, { slug })
    return raw ? resolvePost(raw, urlForImage) : null
  } catch {
    return null
  }
}
