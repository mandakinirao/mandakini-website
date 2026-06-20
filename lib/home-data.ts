import type { Image as SanityImageType } from 'sanity'
import type { RawPressItem } from '@/lib/press'

/**
 * Homepage data with hard fallbacks. No `.env.local` exists in this
 * workspace and the Sanity dataset has no artwork yet (Block 13 pending),
 * so every loader degrades to placeholder content with zero errors.
 */

export interface HomePrint {
  title: string
  slug: string
  price: string
  image: string
  href: string
  desc: string
  /** false ⇒ sold out / withdrawn: badge shows, purchase CTA disabled.
   *  Phase B wires this to shopItem.sold/editionSize/available. */
  available: boolean
  /** Commerce (flag-gated): numeric INR amount — display only; checkout
   *  re-validates server-side from Sanity. */
  amount: number
  /** Units purchasable right now. 0 ⇒ quiet "Sold" state, no CTA. */
  stock: number
}

export interface HomePress {
  source: string
  title: string
  year: string
  url?: string
}

/** A project — a named series of works (e.g. a charcoal series),
 *  represented on the homepage by its name and a few images.
 *  Backed by the Sanity `project` document type: Mandakini can add a
 *  new series or change its images in the Studio and it flows through
 *  the homepage, /works, and /works/[slug] automatically. */
/** One painting/photo inside a series — its own title, an optional
 *  note, and (when an edition exists in the shop) a sale link. */
export interface SeriesPiece {
  src: string
  title: string
  note?: string
  sale?: { href: string; label: string }
}

export interface HomeSeries {
  index: string
  name: string
  slug: string
  medium: string
  desc: string
  href: string
  images: string[]
  pieces: SeriesPiece[]
}

export interface HomeTestimonial {
  _id?: string
  quote: string
  author: string
  role?: string
}

export interface HomeData {
  series: HomeSeries[]
  prints: HomePrint[]
  press: HomePress[]
  testimonials: HomeTestimonial[]
  /** 7 image URLs in card order (left→right). Empty = use built-in fallback. */
  heroImages: string[]
  /** "Painter · Educator · Storyteller" or whatever is set in siteSettings. */
  tagline: string
  /** One-line bio for the About section. */
  aboutBio: string
  /** Resolved URL for the About section portrait. Empty = use built-in fallback. */
  aboutPortrait: string
  /** Short display-font line for the compact homepage teaser. */
  aboutTeaserLine: string
}

// TODO(AP): placeholder series — replace with Mandakini's real project
// series (names, blurbs, and 3-4 images each) when she supplies them.
const PLACEHOLDER_SERIES: HomeSeries[] = [
  {
    index: '01',
    name: 'The Subbulakshmi Series',
    slug: 'the-subbulakshmi-series',
    medium: 'Duotone portraits',
    desc: 'One voice, many faces — a tribute to M.S. Subbulakshmi.',
    href: '/works/the-subbulakshmi-series',
    images: [
      '/art/subbulakshmi/ms-sq-1.jpg',
      '/art/subbulakshmi/ms-sq-2.jpg',
      '/art/subbulakshmi/ms-sq-3.jpg',
      '/art/subbulakshmi/ms-sq-4.jpg',
    ],
    pieces: [
      {
        src: '/art/subbulakshmi/ms-sq-1.jpg',
        title: 'Raga in Ochre',
        note: 'The first of the series — the gaze that started it.',
        sale: { href: '/shop/raga-in-ochre-print', label: 'Edition of 30 — from ₹5,200' },
      },
      {
        src: '/art/subbulakshmi/ms-sq-2.jpg',
        title: 'Subbulakshmi, Singing',
        note: 'Mid-phrase, eyes upward.',
        sale: { href: '/shop/subbulakshmi-singing-print', label: 'Edition of 50 — from ₹4,800' },
      },
      {
        src: '/art/subbulakshmi/ms-sq-3.jpg',
        title: 'Garland',
        note: 'Jasmine and stage light.',
      },
      {
        src: '/art/subbulakshmi/ms-sq-4.jpg',
        title: 'Mother, Listening',
      },
    ],
  },
  {
    index: '02',
    name: 'Studio Diaries',
    slug: 'studio-diaries',
    medium: 'Photography',
    desc: 'Quiet records of the Hyderabad studio at work.',
    href: '/works/studio-diaries',
    images: [
      '/art/loader/portrait-studio-seated-wide.jpg',
      '/art/loader/portrait-studio-close.jpg',
      '/art/loader/portrait-studio-fullbody.jpg',
    ],
    pieces: [
      { src: '/art/loader/portrait-studio-seated-wide.jpg', title: 'The Easel, Morning' },
      { src: '/art/loader/portrait-studio-close.jpg', title: 'Between Strokes' },
      { src: '/art/loader/portrait-studio-fullbody.jpg', title: 'North Window' },
    ],
  },
  {
    index: '03',
    name: 'Palette Studies',
    slug: 'palette-studies',
    medium: 'Oil on board',
    desc: 'Colour exercises that begin where the brushes rest.',
    href: '/works/palette-studies',
    images: [
      '/art/loader/portrait-painting-palette.jpg',
      '/art/loader/color-palette-vivid.jpeg',
      '/art/loader/portrait-home-studio-color.jpg',
    ],
    pieces: [
      { src: '/art/loader/portrait-painting-palette.jpg', title: 'Palette No. 4' },
      {
        src: '/art/loader/color-palette-vivid.jpeg',
        title: 'Palette No. 9',
        note: 'Vivid set — the loudest table in the studio.',
        sale: { href: '/shop/palette-no-9-print', label: 'Edition of 50 — from ₹3,600' },
      },
      { src: '/art/loader/portrait-home-studio-color.jpg', title: 'The Studio Wall' },
    ],
  },
]

// TODO(AP): placeholder voices — collect real testimonial quotes.
const PLACEHOLDER_TESTIMONIALS: HomeTestimonial[] = [
  {
    quote: 'Mandakini sees warmth where the rest of us see walls.',
    author: 'Priya N. — collector, Hyderabad',
  },
  {
    quote: 'A painter’s eye behind every photograph.',
    author: 'Editor — Paint & Process',
  },
  {
    quote: 'The studio feels like a place where pictures are grown, not made.',
    author: 'Workshop guest, 2025',
  },
]

// TODO(AP): placeholder prints — replace with real shop items (Block 10).
const PLACEHOLDER_PRINTS: HomePrint[] = [
  {
    title: 'Subbulakshmi, Singing — Print',
    slug: 'subbulakshmi-singing-print',
    price: 'Edition of 50 — from ₹4,800',
    image: '/art/subbulakshmi/ms-sq-3.jpg',
    href: '/shop/subbulakshmi-singing-print',
    desc: 'Archival giclée print of the duotone portrait, on 308gsm cotton rag. Signed and numbered by hand in the Hyderabad studio, shipped rolled with a certificate of authenticity.',
    available: true,
    amount: 4800,
    stock: 50,
  },
  {
    title: 'Palette No. 9 — Print',
    slug: 'palette-no-9-print',
    price: 'Edition of 50 — from ₹3,600',
    image: '/art/studio/palette-earthy.jpg',
    href: '/shop/palette-no-9-print',
    desc: 'A study in earth and ochre from the palette series. Archival print on cotton rag, signed and numbered, shipped rolled from Hyderabad.',
    available: true,
    amount: 3600,
    stock: 50,
  },
  {
    title: 'Raga in Ochre — Print',
    slug: 'raga-in-ochre-print',
    price: 'Edition of 30 — from ₹5,200',
    image: '/art/subbulakshmi/ms-sq-1.jpg',
    href: '/shop/raga-in-ochre-print',
    desc: 'From the Subbulakshmi series — a small edition of thirty. Archival giclée on cotton rag, signed and numbered, with certificate.',
    available: true,
    amount: 5200,
    stock: 30,
  },
]

// TODO(AP): real press items + article URLs pending.
const PLACEHOLDER_PRESS: HomePress[] = [
  { source: 'The Hindu', title: 'A studio where music becomes paint', year: '2025' },
  { source: 'Deccan Chronicle', title: 'Hyderabad artists to watch', year: '2024' },
  { source: 'Telangana Today', title: 'Portraits of a voice — the Subbulakshmi series', year: '2024' },
  { source: 'Paint & Process', title: 'Podcast — episode 41', year: '2023' },
]

function hasSanityEnv(): boolean {
  // client.ts and image.ts now have hardcoded projectId/dataset fallbacks,
  // so the Sanity client always initialises correctly even without env vars.
  return true
}

interface SanitySaleLite {
  slug?: string
  basePrice?: number
  editionSize?: number
  sold?: number
  availabilityStatus?: string
  purchaseType?: string
}

interface SanityArtworkLite {
  title?: string
  note?: string
  image?: SanityImageType
  sale?: SanitySaleLite | null
}

interface SanitySeriesLite {
  title?: string
  slug?: string
  medium?: string
  projectNote?: string
  coverImage?: SanityImageType
  artworkImages?: SanityImageType[]
  artworks?: SanityArtworkLite[]
}

/** A linked shopItem becomes a sale marker only while it is actually
 *  buyable (IA interim rule: no dead ends in the selling loop). */
function saleFrom(s?: SanitySaleLite | null): SeriesPiece['sale'] {
  if (!s?.slug) return undefined
  // Private Collection pieces never surface a sale link anywhere.
  if (s.purchaseType === 'privateCollection') return undefined
  const soldOut =
    s.availabilityStatus === 'soldOut' ||
    (s.editionSize != null && s.sold != null && s.sold >= s.editionSize)
  if (soldOut) return undefined
  const price = s.basePrice
    ? `from ₹${s.basePrice.toLocaleString('en-IN')}`
    : ''
  const label = s.editionSize
    ? `Edition of ${s.editionSize}${price ? ' — ' + price : ''}`
    : price || 'Available'
  return { href: `/shop/${s.slug}`, label }
}

function printAvailable(s: {
  availabilityStatus?: string
  editionSize?: number
  sold?: number
  stock?: number
}): boolean {
  if (s.availabilityStatus === 'soldOut') return false
  if (s.editionSize != null && s.sold != null && s.sold >= s.editionSize)
    return false
  if (s.stock != null && s.stock <= 0) return false
  return true
}

/** Checkout line item, validated server-side — amounts come from Sanity
 *  (or the placeholder list while the dataset is empty), never the client. */
export interface PurchasableItem {
  id: string
  slug: string
  title: string
  amount: number
  stock: number
  stripePriceId?: string
}

/** Source-of-truth lookup for the checkout route. Buyable items only —
 *  Private Collection items are excluded inside the GROQ itself. */
export async function getPurchasableItems(
  slugs: string[]
): Promise<PurchasableItem[]> {
  if (!hasSanityEnv()) {
    return PLACEHOLDER_PRINTS.filter(
      (p) => slugs.includes(p.slug) && p.stock > 0
    ).map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      amount: p.amount,
      stock: p.stock,
    }))
  }
  const [{ client }, queries] = await Promise.all([
    import('@/sanity/lib/client'),
    import('@/sanity/lib/queries'),
  ])
  const docs = await client.fetch<
    | {
        _id: string
        title?: string
        slug?: string
        basePrice?: number
        stock?: number
        stripePriceId?: string
      }[]
    | null
  >(queries.shopItemsBySlugsQuery, { slugs })
  return (docs ?? [])
    .filter((d) => d.slug && typeof d.basePrice === 'number')
    .map((d) => ({
      id: d._id,
      slug: d.slug as string,
      title: d.title ?? 'Untitled print',
      amount: d.basePrice as number,
      stock: d.stock ?? 0,
      stripePriceId: d.stripePriceId || undefined,
    }))
}

/**
 * Every published Sanity `project` is a series: Mandakini adds one in
 * the Studio (name, note, images, order) and it appears on the
 * homepage, /works, and gets its own /works/[slug] page.
 */
export async function getAllSeries(): Promise<HomeSeries[]> {
  if (!hasSanityEnv()) return PLACEHOLDER_SERIES
  try {
    const [{ client }, { urlForImage }, queries] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])
    const docs = await client.fetch<SanitySeriesLite[] | null>(
      queries.allSeriesQuery
    )
    if (!docs || !docs.length) return PLACEHOLDER_SERIES
    return docs.map((d, i) => mapSeriesDoc(d, i, urlForImage))
  } catch {
    return PLACEHOLDER_SERIES
  }
}

type UrlFor = (img: SanityImageType) => { width: (w: number) => { url: () => string } }

function mapSeriesDoc(
  d: SanitySeriesLite,
  i: number,
  urlForImage: UrlFor
): HomeSeries {
  const slug = d.slug ?? `series-${i + 1}`

  // Pieces come from artwork documents (title, note, sale link); a
  // project with no artworks falls back to its own image gallery.
  let pieces: SeriesPiece[]
  if (d.artworks && d.artworks.length) {
    pieces = d.artworks
      .filter((a) => a.image)
      .map((a, n) => ({
        src: urlForImage(a.image as SanityImageType).width(1600).url(),
        title: a.title ?? `${d.title ?? 'Untitled'} ${String(n + 1).padStart(2, '0')}`,
        note: a.note,
        sale: saleFrom(a.sale),
      }))
  } else {
    const images = [d.coverImage, ...(d.artworkImages ?? [])]
      .filter((img): img is SanityImageType => Boolean(img))
      .map((img) => urlForImage(img).width(1600).url())
    pieces = images.map((src) => ({ src, title: '' }))
  }

  const fallback = PLACEHOLDER_SERIES[i % PLACEHOLDER_SERIES.length]
  const images = pieces.length ? pieces.map((p) => p.src) : fallback.images
  if (!pieces.length) pieces = fallback.images.map((src) => ({ src, title: '' }))

  return {
    index: String(i + 1).padStart(2, '0'),
    name: d.title ?? 'Untitled series',
    slug,
    medium: d.medium ?? '',
    desc: d.projectNote ?? '',
    href: `/works/${slug}`,
    images,
    pieces,
  }
}

/**
 * Curated featured series — Site Settings → Featured Projects, falling
 * back to the first four published. Drives the homepage Projects stage
 * and /works Tier 1.
 */
export async function getFeaturedSeries(): Promise<HomeSeries[]> {
  if (!hasSanityEnv()) return PLACEHOLDER_SERIES.slice(0, 4)
  try {
    const [{ client }, { urlForImage }, queries] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])
    const docs = await client.fetch<SanitySeriesLite[] | null>(
      queries.featuredSeriesQuery
    )
    if (!docs || !docs.length) return (await getAllSeries()).slice(0, 4)
    return docs
      .filter((d): d is SanitySeriesLite => Boolean(d))
      .map((d, i) => mapSeriesDoc(d, i, urlForImage))
  } catch {
    return PLACEHOLDER_SERIES.slice(0, 4)
  }
}

export async function getSeriesBySlug(slug: string): Promise<HomeSeries | null> {
  const all = await getAllSeries()
  return all.find((s) => s.slug === slug) ?? null
}

export async function getAllPrints(): Promise<HomePrint[]> {
  const { prints } = await getHomeData()
  return prints
}

export async function getPrintBySlug(slug: string): Promise<HomePrint | null> {
  const prints = await getAllPrints()
  return prints.find((p) => p.slug === slug) ?? null
}

/**
 * Full shop listing for /shop — no limit, all non-private, non-hidden items.
 * The homepage EditionShop uses getHomeData() which intentionally caps at 3.
 */
export async function getAllShopItems(): Promise<HomePrint[]> {
  if (!hasSanityEnv()) return PLACEHOLDER_PRINTS

  try {
    const [{ client }, { urlForImage }, { allShopItemsQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])
    const docs = await client.fetch<
      | {
          _id: string
          title?: string
          slug?: string
          desc?: string
          basePrice?: number
          images?: SanityImageType[]
          availabilityStatus?: string
          editionSize?: number
          sold?: number
          stock?: number
        }[]
      | null
    >(allShopItemsQuery)

    if (!docs || !docs.length) return PLACEHOLDER_PRINTS

    return docs.map((s, i) => {
      let image = '/art/subbulakshmi/ms-sq-3.jpg'
      try {
        if (s.images?.[0]) image = urlForImage(s.images[0]).width(1200).url()
      } catch {}
      return {
        title: s.title ?? 'Untitled print',
        slug: s.slug ?? `print-${i + 1}`,
        price: s.editionSize
          ? `Edition of ${s.editionSize}${s.basePrice ? ' — from ₹' + s.basePrice.toLocaleString('en-IN') : ''}`
          : s.basePrice ? `from ₹${s.basePrice.toLocaleString('en-IN')}` : '',
        image,
        href: s.slug ? `/shop/${s.slug}` : '/shop',
        desc: s.desc ?? '',
        available: printAvailable(s),
        amount: s.basePrice ?? 0,
        stock: s.stock ?? 0,
      }
    })
  } catch {
    return PLACEHOLDER_PRINTS
  }
}

export async function getHomeData(): Promise<HomeData> {
  // The homepage gets the curated featured set (capped at 4 in the
  // component); /works fetches the full list via getAllSeries itself.
  const series = await getFeaturedSeries()

  if (!hasSanityEnv()) {
    return {
      series,
      prints: PLACEHOLDER_PRINTS,
      press: PLACEHOLDER_PRESS,
      testimonials: PLACEHOLDER_TESTIMONIALS,
      heroImages: [],
      tagline: 'Painter · Educator · Storyteller',
      aboutBio: '',
      aboutPortrait: '/art/loader/portrait-studio-seated-wide.jpg',
      aboutTeaserLine: '',
    }
  }

  const [{ client }, { urlForImage }, queries] = await Promise.all([
    import('@/sanity/lib/client'),
    import('@/sanity/lib/image'),
    import('@/sanity/lib/queries'),
  ])

  const ok = <T>(r: PromiseSettledResult<T>): T | null =>
    r.status === 'fulfilled' ? r.value : null

  const [shopRes, pressRes, heroRes, basicRes, testiRes, snippetRes, teaserRes] = await Promise.allSettled([
    client.fetch<
      | {
          title?: string
          slug?: string
          desc?: string
          basePrice?: number
          images?: SanityImageType[]
          availabilityStatus?: string
          editionSize?: number
          sold?: number
          stock?: number
        }[]
      | null
    >(queries.featuredShopItemsQuery),
    client.fetch<RawPressItem[] | null>(queries.pressItemsQuery),
    client.fetch<string[] | null>(queries.heroImagesQuery),
    client.fetch<{ tagline?: string; aboutBio?: string; aboutPortrait?: SanityImageType } | null>(
      queries.siteSettingsBasicQuery
    ),
    client.fetch<{ _id: string; quote: string; author: string; role?: string }[] | null>(queries.testimonialsQuery),
    client.fetch<string | null>('*[_type == "aboutPage"][0].homeSnippet'),
    client.fetch<string | null>('*[_type == "aboutPage"][0].aboutTeaserLine'),
  ])

  const shopItems = ok(shopRes)
  const rawPressItems = ok(pressRes)
  const rawHeroImages = ok(heroRes)
  const siteBasic = ok(basicRes)
  const { enrichPressItems } = await import('@/lib/press')
  const enrichedPress = rawPressItems?.length
    ? await enrichPressItems(rawPressItems).catch(() => null)
    : null

  const rawTestimonials = ok(testiRes)
  const homeSnippet = ok(snippetRes)
  const teaserLine = ok(teaserRes)

  const prints: HomePrint[] =
    shopItems && shopItems.length
      ? shopItems.slice(0, 3).map((s, i) => {
          let image = '/art/subbulakshmi/ms-sq-3.jpg'
          try {
            if (s.images?.[0]) image = urlForImage(s.images[0]).width(1200).url()
          } catch {}
          return {
            title: s.title ?? 'Untitled print',
            slug: s.slug ?? `print-${i + 1}`,
            price: s.editionSize
              ? `Edition of ${s.editionSize}${s.basePrice ? ' — from ₹' + s.basePrice.toLocaleString('en-IN') : ''}`
              : s.basePrice ? `from ₹${s.basePrice.toLocaleString('en-IN')}` : '',
            image,
            href: s.slug ? `/shop/${s.slug}` : '/shop',
            desc: s.desc ?? '',
            available: printAvailable(s),
            amount: s.basePrice ?? 0,
            stock: s.stock ?? 0,
          }
        })
      : PLACEHOLDER_PRINTS

  const press: HomePress[] =
    enrichedPress?.length
      ? enrichedPress.map((p) => ({
          source: p.source,
          title: p.title,
          year: '',
          url: p.url,
        }))
      : PLACEHOLDER_PRESS

  const heroImages =
    rawHeroImages && rawHeroImages.length === 7 ? rawHeroImages : []

  const tagline = siteBasic?.tagline ?? 'Painter · Educator · Storyteller'
  const aboutBio = homeSnippet ?? ''
  // Local portrait (IMG_9003) takes precedence until a colour photo is
  // uploaded to Sanity Studio (siteSettings → aboutPortrait).
  // To restore Sanity control: upload a colour portrait to Studio,
  // then flip the condition below back to the original.
  const aboutPortrait = '/art/about-portrait.jpg'
  try {
    // Sanity portrait intentionally bypassed — current upload is B&W.
    // Re-enable after uploading colour photo:
    // if (siteBasic?.aboutPortrait) {
    //   aboutPortrait = urlForImage(siteBasic.aboutPortrait).width(1600).url()
    // }
    void siteBasic
  } catch {}

  const testimonials =
    rawTestimonials && rawTestimonials.length
      ? rawTestimonials
      : PLACEHOLDER_TESTIMONIALS

  return {
    series,
    prints,
    press,
    testimonials,
    heroImages,
    tagline,
    aboutBio,
    aboutPortrait,
    aboutTeaserLine: teaserLine ?? homeSnippet ?? '',
  }
}
