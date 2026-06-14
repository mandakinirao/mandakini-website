import type { PortableTextBlock } from '@portabletext/types'
import type { Image as SanityImageType } from 'sanity'

export interface Exhibition {
  year: number
  exhibitionName: string
  venue: string
  location: string
}

export interface AboutData {
  bio: PortableTextBlock[] | null
  artistStatement: PortableTextBlock[] | null
  profilePhotos: string[]
  studioPhotos: string[]
  cv: PortableTextBlock[] | null
  exhibitionHistory: Exhibition[]
}

function hasSanityEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
}

const EMPTY: AboutData = {
  bio: null,
  artistStatement: null,
  profilePhotos: [],
  studioPhotos: [],
  cv: null,
  exhibitionHistory: [],
}

export async function getAboutData(): Promise<AboutData> {
  if (!hasSanityEnv()) return EMPTY

  try {
    const [{ client }, { urlForImage }, { aboutQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])

    const doc = await client.fetch<{
      bio?: PortableTextBlock[]
      artistStatement?: PortableTextBlock[]
      profilePhotos?: SanityImageType[]
      studioPhotos?: SanityImageType[]
      cv?: PortableTextBlock[]
      exhibitionHistory?: Exhibition[]
    } | null>(aboutQuery)

    if (!doc) return EMPTY

    return {
      bio: doc.bio ?? null,
      artistStatement: doc.artistStatement ?? null,
      profilePhotos: (doc.profilePhotos ?? []).map((img) =>
        urlForImage(img).width(1600).url()
      ),
      studioPhotos: (doc.studioPhotos ?? []).map((img) =>
        urlForImage(img).width(1600).url()
      ),
      cv: doc.cv ?? null,
      exhibitionHistory: doc.exhibitionHistory ?? [],
    }
  } catch {
    return EMPTY
  }
}
