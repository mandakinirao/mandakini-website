import type { Image as SanityImageType } from 'sanity'
import type { RawPressItem } from '@/lib/press'

/**
 * Homepage data loaders. Every async function falls back to placeholder
 * content when Sanity returns nothing — zero errors, always renderable.
 */

export interface HomePrint {
  title: string
  slug: string
  price: string
  image: string
  /** All product images; first entry matches `image`. */
  images: string[]
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

/** One painting/photo inside a series — its own title, an optional
 *  note, and (when an edition exists in the shop) a sale link. */
export interface SeriesPiece {
  src: string
  title: string
  note?: string
  sale?: { href: string; label: string }
}

/** A named series of works. Backed by the Sanity `project` type —
 *  Mandakini adds a series in the Studio and it flows through the
 *  homepage, /works, and /works/[slug] automatically. */
export interface HomeSeries {
  index: string
  name: string
  slug: string
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

// Placeholder series — shown until Mandakini adds real projects in Sanity Studio.
const PLACEHOLDER_SERIES: HomeSeries[] = [
  {
    index: '01',
    name: 'The Subbulakshmi Series',
    slug: 'the-subbulakshmi-series',
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

// Placeholder testimonials — shown until real quotes are entered in Studio.
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

// Placeholder prints — shown until real shop items are added in Studio.
const PLACEHOLDER_PRINTS: HomePrint[] = [
  {
    title: 'Subbulakshmi, Singing — Print',
    slug: 'subbulakshmi-singing-print',
    price: 'Edition of 50 — from ₹4,800',
    image: '/art/subbulakshmi/ms-sq-3.jpg',
    images: ['/art/subbulakshmi/ms-sq-3.jpg'],
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
    images: ['/art/studio/palette-earthy.jpg'],
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
    images: ['/art/subbulakshmi/ms-sq-1.jpg'],
    href: '/shop/raga-in-ochre-print',
    desc: 'From the Subbulakshmi series — a small edition of thirty. Archival giclée on cotton rag, signed and numbered, with certificate.',
    available: true,
    amount: 5200,
    stock: 30,
  },
]

// Placeholder press items — shown until real press records are added in Studio.
const PLACEHOLDER_PRESS: HomePress[] = [
  { source: 'The Hindu', title: 'A studio where music becomes paint', year: '2025' },
  { source: 'Deccan Chronicle', title: 'Hyderabad artists to watch', year: '2024' },
  { source: 'Telangana Today', title: 'Portraits of a voice — the Subbulakshmi series', year: '2024' },
  { source: 'Paint & Process', title: 'Podcast — episode 41', year: '2023' },
]

interface SanitySeriesLite {
  seriesName?: string
  slug?: string
  description?: string
  gallery?: SanityImageType[]
  year?: number
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

type UrlFor = (img: SanityImageType) => { width: (w: number) => { url: () => string } }

const SHOP_IMAGE_FALLBACK = '/art/subbulakshmi/ms-sq-3.jpg'

interface ShopDoc {
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
}

function resolveShopImages(sanityImages: SanityImageType[] | undefined, urlForImage: UrlFor): string[] {
  if (!sanityImages?.length) return [SHOP_IMAGE_FALLBACK]
  return sanityImages.map((img) => {
    try {
      return img?.asset ? urlForImage(img).width(1200).url() : SHOP_IMAGE_FALLBACK
    } catch {
      return SHOP_IMAGE_FALLBACK
    }
  })
}

function mapShopDoc(s: ShopDoc, i: number, urlForImage: UrlFor): HomePrint {
  const allImages = resolveShopImages(s.images, urlForImage)
  return {
    title: s.title ?? 'Untitled print',
    slug: s.slug ?? `print-${i + 1}`,
    price: s.editionSize
      ? `Edition of ${s.editionSize}${s.basePrice ? ' — from ₹' + s.basePrice.toLocaleString('en-IN') : ''}`
      : s.basePrice ? `from ₹${s.basePrice.toLocaleString('en-IN')}` : '',
    image: allImages[0],
    images: allImages,
    href: s.slug ? `/shop/${s.slug}` : '/shop',
    desc: s.desc ?? '',
    available: printAvailable(s),
    amount: s.basePrice ?? 0,
    // null stock = not tracked yet; treat as plentiful so buy buttons show
    stock: s.stock != null ? s.stock : (printAvailable(s) ? 999 : 0),
  }
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
  const fallback = PLACEHOLDER_PRINTS.filter(
    (p) => slugs.includes(p.slug) && p.stock > 0
  ).map((p) => ({ id: p.slug, slug: p.slug, title: p.title, amount: p.amount, stock: p.stock }))

  try {
    const [{ client }, queries] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/queries'),
    ])
    const docs = await client.fetch<
      | { _id: string; title?: string; slug?: string; basePrice?: number; stock?: number; stripePriceId?: string }[]
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
  } catch {
    return fallback
  }
}

/**
 * Every published Sanity `project` is a series: Mandakini adds one in
 * the Studio (name, note, images, order) and it appears on the
 * homepage, /works, and gets its own /works/[slug] page.
 */
export async function getAllSeries(): Promise<HomeSeries[]> {
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

function mapSeriesDoc(
  d: SanitySeriesLite,
  i: number,
  urlForImage: UrlFor
): HomeSeries {
  const slug = d.slug ?? `series-${i + 1}`
  const images = (d.gallery ?? [])
    .filter((img): img is SanityImageType => Boolean(img?.asset))
    .map((img) => urlForImage(img).width(1600).url())
  const pieces: SeriesPiece[] = images.map((src) => ({ src, title: '' }))
  return {
    index: String(i + 1).padStart(2, '0'),
    name: d.seriesName ?? 'Untitled series',
    slug,
    desc: d.description ?? '',
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

/** Detail-page lookup: searches the FULL shop catalogue (not just the
 *  3 homepage-featured items). Use this on /shop/[slug]. */
export async function getShopItemBySlug(slug: string): Promise<HomePrint | null> {
  const all = await getAllShopItems()
  return all.find((p) => p.slug === slug) ?? null
}

/**
 * Full shop listing for /shop — no limit, all non-private, non-hidden items.
 * The homepage EditionShop uses getHomeData() which intentionally caps at 3.
 */
export async function getAllShopItems(): Promise<HomePrint[]> {
  try {
    const [{ client }, { urlForImage }, { allShopItemsQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/image'),
      import('@/sanity/lib/queries'),
    ])
    const docs = await client.fetch<ShopDoc[] | null>(allShopItemsQuery)
    if (!docs?.length) return PLACEHOLDER_PRINTS
    return docs.map((s, i) => mapShopDoc(s, i, urlForImage))
  } catch {
    return PLACEHOLDER_PRINTS
  }
}

export async function getHomeData(): Promise<HomeData> {
  const series = await getFeaturedSeries()

  const [{ client }, { urlForImage }, queries] = await Promise.all([
    import('@/sanity/lib/client'),
    import('@/sanity/lib/image'),
    import('@/sanity/lib/queries'),
  ])

  const ok = <T>(r: PromiseSettledResult<T>): T | null =>
    r.status === 'fulfilled' ? r.value : null

  const [shopRes, pressRes, heroRes, basicRes, testiRes, aboutRes] = await Promise.allSettled([
    client.fetch<ShopDoc[] | null>(queries.featuredShopItemsQuery),
    client.fetch<RawPressItem[] | null>(queries.pressItemsQuery),
    client.fetch<string[] | null>(queries.heroImagesQuery),
    client.fetch<{ tagline?: string } | null>(queries.siteSettingsBasicQuery),
    client.fetch<{ _id: string; quote: string; author: string; role?: string }[] | null>(queries.testimonialsQuery),
    client.fetch<{ homeSnippet?: string; aboutTeaserLine?: string } | null>(queries.aboutHomeDataQuery),
  ])

  const shopItems = ok(shopRes)
  const rawPressItems = ok(pressRes)
  const rawHeroImages = ok(heroRes)
  const siteBasic = ok(basicRes)
  const rawTestimonials = ok(testiRes)
  const aboutData = ok(aboutRes)

  const { enrichPressItems } = await import('@/lib/press')
  const enrichedPress = rawPressItems?.length
    ? await enrichPressItems(rawPressItems).catch(() => null)
    : null

  const prints: HomePrint[] = shopItems?.length
    ? shopItems.slice(0, 3).map((s, i) => mapShopDoc(s, i, urlForImage))
    : PLACEHOLDER_PRINTS

  const tickerItems = enrichedPress?.filter((p) => p.headline && p.source) ?? []
  const press: HomePress[] = tickerItems.length
    ? tickerItems.map((p) => ({ source: p.source as string, title: p.headline as string, year: '', url: p.url ?? undefined }))
    : PLACEHOLDER_PRESS

  const homeSnippet = aboutData?.homeSnippet ?? ''

  return {
    series,
    prints,
    press,
    testimonials: rawTestimonials?.length ? rawTestimonials : PLACEHOLDER_TESTIMONIALS,
    heroImages: rawHeroImages?.length === 7 ? rawHeroImages : [],
    tagline: siteBasic?.tagline ?? 'Painter · Educator · Storyteller',
    aboutBio: homeSnippet,
    // Hardcoded until a colour portrait is uploaded to Studio (current upload is B&W).
    aboutPortrait: '/art/about-portrait.jpg',
    aboutTeaserLine: aboutData?.aboutTeaserLine ?? homeSnippet,
  }
}
