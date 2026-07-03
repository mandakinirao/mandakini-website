import type { Image as SanityImage } from 'sanity'
import { urlForImage } from '@/sanity/lib/image'

export interface RawPressItem {
  _id: string
  link?: string
  type: string
  headlineOverride?: string
  thumbnailOverride?: SanityImage & { alt?: string }
  logoCard?: boolean
  source?: string
  displayOrder?: number
}

export interface EnrichedPressItem {
  _id: string
  /** null when there is no destination — a photographed/scanned print
   *  clipping with nothing to link out to. The card opens a lightbox
   *  instead of navigating. */
  url: string | null
  type: string
  headline: string | null
  thumbnail: string | null
  source: string | null
  displayOrder: number
  /** 'photo' — image fills the card, links out. 'logo' — clean card, no
   *  photo overlay, links out. 'clipping' — full image + caption, no link,
   *  opens a lightbox on click. */
  mode: 'photo' | 'logo' | 'clipping'
}

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

function hostnameFrom(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

async function fetchWithTimeout(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

interface Fetched {
  headline?: string
  thumbnail?: string
  source?: string
}

/** oEmbed is preferred for video links — it's a stable, purpose-built API,
 *  unlike OG tags which many video pages omit or gate behind consent walls. */
async function fetchFromYoutubeOembed(url: string): Promise<Fetched> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const res = await fetchWithTimeout(oembedUrl)
    if (!res.ok) return {}
    const data = (await res.json()) as { title?: string; thumbnail_url?: string }
    return { headline: data.title, thumbnail: data.thumbnail_url, source: 'YouTube' }
  } catch {
    // Missing oEmbed data is an expected outcome (private/deleted video, rate limit) — never throw.
    return {}
  }
}

function parseOgTag(html: string, property: string): string | undefined {
  const re1 = new RegExp(
    `<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  )
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`,
    'i'
  )
  return (re1.exec(html) ?? re2.exec(html))?.[1]
}

/** Missing/incomplete OG tags are the expected case for this site's press
 *  (regional outlets, old archive pages, print-only features) — every field
 *  here can legitimately come back undefined. */
async function fetchFromOg(url: string): Promise<Fetched> {
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return {}
    const html = await res.text()
    return {
      headline: parseOgTag(html, 'title'),
      thumbnail: parseOgTag(html, 'image'),
      source: parseOgTag(html, 'site_name') ?? hostnameFrom(url),
    }
  } catch {
    return {}
  }
}

export async function enrichPressItem(raw: RawPressItem): Promise<EnrichedPressItem> {
  // No link, nothing to fetch — this is a print clipping (or an incomplete
  // draft). Skip the network call entirely rather than fetching an empty URL.
  const fetched = !raw.link
    ? {}
    : isYouTube(raw.link)
      ? await fetchFromYoutubeOembed(raw.link)
      : await fetchFromOg(raw.link)

  let overrideThumbnail: string | undefined
  if (raw.thumbnailOverride?.asset) {
    try {
      // 2000px cap so the lightbox (near full-viewport for clipping scans)
      // has enough real detail to read comfortably, not just the grid thumb.
      overrideThumbnail = urlForImage(raw.thumbnailOverride).width(2000).url()
    } catch {
      overrideThumbnail = undefined
    }
  }

  const headline = raw.headlineOverride ?? fetched.headline ?? null
  const thumbnail = overrideThumbnail ?? fetched.thumbnail ?? null
  const source = raw.source ?? fetched.source ?? null

  let mode: EnrichedPressItem['mode']
  if (!raw.link && thumbnail) {
    mode = 'clipping'
  } else if (raw.logoCard || !thumbnail) {
    mode = 'logo'
  } else {
    mode = 'photo'
  }

  return {
    _id: raw._id,
    url: raw.link ?? null,
    type: raw.type,
    headline,
    thumbnail,
    source,
    displayOrder: raw.displayOrder ?? 99,
    mode,
  }
}

export async function enrichPressItems(items: RawPressItem[]): Promise<EnrichedPressItem[]> {
  return Promise.all(items.map(enrichPressItem))
}
