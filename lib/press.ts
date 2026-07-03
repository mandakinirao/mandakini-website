import type { Image as SanityImage } from 'sanity'
import { urlForImage } from '@/sanity/lib/image'

export interface RawPressItem {
  _id: string
  link: string
  type: string
  headlineOverride?: string
  thumbnailOverride?: SanityImage & { alt?: string }
  logoCard?: boolean
  source?: string
  displayOrder?: number
}

export interface EnrichedPressItem {
  _id: string
  url: string
  type: string
  headline: string | null
  thumbnail: string | null
  source: string | null
  displayOrder: number
  /** 'photo' — image fills the card. 'logo' — clean card, no photo overlay. */
  mode: 'photo' | 'logo'
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
  const fetched = isYouTube(raw.link)
    ? await fetchFromYoutubeOembed(raw.link)
    : await fetchFromOg(raw.link)

  let overrideThumbnail: string | undefined
  if (raw.thumbnailOverride?.asset) {
    try {
      overrideThumbnail = urlForImage(raw.thumbnailOverride).width(800).url()
    } catch {
      overrideThumbnail = undefined
    }
  }

  const headline = raw.headlineOverride ?? fetched.headline ?? null
  const thumbnail = overrideThumbnail ?? fetched.thumbnail ?? null
  const source = raw.source ?? fetched.source ?? null

  const mode: EnrichedPressItem['mode'] = raw.logoCard || !thumbnail ? 'logo' : 'photo'

  return {
    _id: raw._id,
    url: raw.link,
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
