import { groq } from 'next-sanity'

/** All GROQ lives here — never write inline GROQ (PROJECT.md §14). */

// Private Collection items never render images or listings anywhere —
// every listing query excludes them at the source.
export const heroImagesQuery = groq`
  *[_type == "siteSettings"][0].heroImages[].asset->url
`

// Homepage hero reveal — top (portrait) / bottom (revealed) images for the
// ink-reveal effect. Both optional: falls back to the built-in static
// files when the homepage singleton or either field is missing.
export const homepageHeroQuery = groq`
  *[_type == "homepage"][0] {
    heroRevealTop { ..., alt },
    heroRevealBottom { ..., alt }
  }
`

export const siteSettingsBasicQuery = groq`
  *[_type == "siteSettings"][0] {
    tagline,
    aboutBio,
    aboutPortrait
  }
`

export const footerSocialQuery = groq`
  *[_type == "siteSettings"][0] {
    instagramHandle,
    youtubeChannelName
  }
`

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(coalesce(displayOrder, 99) asc, _createdAt asc) {
    _id,
    quote,
    personName,
    personImage { asset, alt }
  }
`

export const siteSettingsShopQuery = groq`
  *[_type == "siteSettings"][0] {
    worksPageHeadline,
    worksEmptyHeadline,
    worksEmptyBody,
    shopPageHeadline,
    shopPrintNote,
    printDefaultPaper,
    printDefaultSignature,
    printDefaultShipping,
    thankYouMessage,
    contactPageIntro,
    contactEmail,
    privateCollectionTitle,
    privateCollectionLine
  }
`

// Homepage press marquee: items switched to "Show on homepage", in homepageOrder.
export const featuredPressItemsQuery = groq`
  *[_type == "pressItem" && featuredOnHomepage == true]
    | order(coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 99) asc) [0...8] {
    _id,
    link,
    type,
    headlineOverride,
    thumbnailOverride { asset, alt },
    logoCard,
    source,
    displayOrder
  }
`

export const pressItemsQuery = groq`
  *[_type == "pressItem"] | order(coalesce(displayOrder, 99) asc) {
    _id,
    link,
    type,
    headlineOverride,
    thumbnailOverride { asset, alt },
    logoCard,
    source,
    displayOrder
  }
`


// Homepage shop teaser: prints switched to "Show on homepage" (featuredOnHomepage),
// in homepageOrder. lib/home-data.ts falls back to firstShopItemsQuery when none are.
export const featuredShopItemsQuery = groq`
  *[_type == "shopItem"
      && featuredOnHomepage == true
      && coalesce(availabilityStatus, "available") != "hidden"
      && coalesce(purchaseType, "buy") != "privateCollection"]
    | order(coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 999) asc) [0...3] {
      _id,
      title,
      "slug": slug.current,
      "desc": coalesce(description, desc),
      "basePrice": coalesce(basePrice, price),
      images,
      "availabilityStatus": coalesce(availabilityStatus, "available"),
      editionSize,
      sold,
      stock,
      height,
      width,
      sizeUnit,
      "purchaseType": coalesce(purchaseType, "buy"),
      stripePriceId
    }
`

export const firstShopItemsQuery = groq`
  *[_type == "shopItem"
      && coalesce(availabilityStatus, "available") != "hidden"
      && coalesce(purchaseType, "buy") != "privateCollection"]
    | order(coalesce(displayOrder, 999) asc, _createdAt asc) [0...3] {
      _id,
      title,
      "slug": slug.current,
      "desc": coalesce(description, desc),
      "basePrice": coalesce(basePrice, price),
      images,
      "availabilityStatus": coalesce(availabilityStatus, "available"),
      editionSize,
      sold,
      stock,
      height,
      width,
      sizeUnit,
      "purchaseType": coalesce(purchaseType, "buy"),
      stripePriceId
    }
`

// Full shop listing — no slice, used by /shop page.
// The homepage teaser (EditionShop) uses featuredShopItemsQuery which has [0...3].
export const allShopItemsQuery = groq`
  *[_type == "shopItem"
      && coalesce(availabilityStatus, "available") != "hidden"
      && coalesce(purchaseType, "buy") != "privateCollection"]
    | order(coalesce(displayOrder, 999) asc, _createdAt asc) {
      _id,
      title,
      "slug": slug.current,
      "desc": coalesce(description, desc),
      "basePrice": coalesce(basePrice, price),
      images,
      "availabilityStatus": coalesce(availabilityStatus, "available"),
      editionSize,
      sold,
      stock,
      height,
      width,
      sizeUnit,
      "purchaseType": coalesce(purchaseType, "buy"),
      stripePriceId
    }
`

// Order numbering — MR-<year>-<NNNN> is incremented from the total
// order count. Used only by the Razorpay webhook.
export const orderCountQuery = groq`count(*[_type == "order"])`

// Checkout price validation — amounts always come from Sanity, never
// from the client. Buyable items only.
export const shopItemsBySlugsQuery = groq`
  *[_type == "shopItem" && slug.current in $slugs
      && coalesce(purchaseType, "buy") == "buy"] {
    _id,
    title,
    "slug": slug.current,
    "basePrice": coalesce(basePrice, price),
    "availabilityStatus": coalesce(availabilityStatus, "available"),
    editionSize,
    sold,
    stock,
    stripePriceId
  }
`

// Series view of projects — the homepage Projects section and the
// /works pages treat each published project as a named series.
export const allSeriesQuery = groq`
  *[_type == "project"] | order(coalesce(displayOrder, 999) asc, _createdAt asc) {
    _id,
    seriesName,
    "slug": slug.current,
    description,
    gallery,
    year
  }
`

// About Page singleton — drives /about and (via homeSnippet) the homepage
// About section. All fields are optional so the page renders gracefully
// before content is entered in the Studio.
export const aboutPageQuery = groq`
  *[_type == "aboutPage"][0] {
    aboutTeaserLine,
    aboutBlockBio,
    aboutBlockPortrait { ..., alt }
  }
`

// Homepage-only about fields — separate from the full aboutPageQuery so
// getHomeData() fetches only what the homepage needs.
export const aboutHomeDataQuery = groq`
  *[_type == "aboutPage"][0] { homeSnippet, aboutTeaserLine, aboutBlockPortrait { asset, alt } }
`

// Homepage projects: series switched to "Show on homepage", in homepageOrder.
// lib/home-data.ts falls back to the first four published when none are.
export const featuredSeriesQuery = groq`
  *[_type == "project" && featuredOnHomepage == true]
    | order(coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 999) asc) [0...4] {
      _id,
      seriesName,
      "slug": slug.current,
      description,
      gallery,
      year
    }
`

// Journal listing — /journal. Cover + card copy only, no body (kept light).
export const allJournalPostsQuery = groq`
  *[_type == "journalPost" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    kicker,
    excerpt,
    coverImage { asset, alt, "aspectRatio": asset->metadata.dimensions.aspectRatio },
    publishedAt,
    featured
  }
`

// Journal detail — /journal/[slug]. Resolves each paragraph's images to
// asset refs + alt + aspect ratio so the renderer never needs a second
// round trip for image metadata.
export const journalPostBySlugQuery = groq`
  *[_type == "journalPost" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    kicker,
    excerpt,
    coverImage { asset, alt, "aspectRatio": asset->metadata.dimensions.aspectRatio },
    publishedAt,
    featured,
    body[] {
      _key,
      text,
      displayMode,
      position,
      pullQuote,
      images[] {
        asset,
        alt,
        caption,
        "aspectRatio": asset->metadata.dimensions.aspectRatio
      }
    }
  }
`
