import type { Image as SanityImage } from 'sanity'
import { urlForImage } from '@/sanity/lib/image'

export interface RawPressItem {
  _id: string
  url: string
  type: string
  titleOverride?: string
  imageOverride?: SanityImage & { alt?: string }
  sourceOverride?: string
  order?: number
}

export interface EnrichedPressItem {
  _id: string
  url: string
  type: string
  title: string
  thumbnail?: string
  source: string
  order: number
}

function isYouTube(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

function hostnameFrom(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
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

async function enrichFromYouTube(
  url: string
): Promise<{ title?: string; thumbnail?: string; source?: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const res = await fetchWithTimeout(oembedUrl)
    if (!res.ok) return {}
    const data = (await res.json()) as { title?: string; thumbnail_url?: string }
    return { title: data.title, thumbnail: data.thumbnail_url, source: 'YouTube' }
  } catch {
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

async function enrichFromOg(
  url: string
): Promise<{ title?: string; thumbnail?: string; source?: string }> {
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return {}
    const html = await res.text()
    return {
      title: parseOgTag(html, 'title'),
      thumbnail: parseOgTag(html, 'image'),
      source: parseOgTag(html, 'site_name'),
    }
  } catch {
    return {}
  }
}

export async function enrichPressItem(raw: RawPressItem): Promise<EnrichedPressItem> {
  const derived = isYouTube(raw.url)
    ? await enrichFromYouTube(raw.url)
    : await enrichFromOg(raw.url)

  let thumbnail: string | undefined
  if (raw.imageOverride) {
    try {
      thumbnail = urlForImage(raw.imageOverride).width(800).url()
    } catch {
      thumbnail = derived.thumbnail
    }
  } else {
    thumbnail = derived.thumbnail
  }

  return {
    _id: raw._id,
    url: raw.url,
    type: raw.type,
    title: raw.titleOverride || derived.title || raw.url,
    thumbnail,
    source: raw.sourceOverride || derived.source || hostnameFrom(raw.url),
    order: raw.order ?? 99,
  }
}

export async function enrichPressItems(items: RawPressItem[]): Promise<EnrichedPressItem[]> {
  return Promise.all(items.map(enrichPressItem))
}
