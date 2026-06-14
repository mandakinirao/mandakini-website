import { groq } from 'next-sanity'

/** All GROQ lives here — never write inline GROQ (PROJECT.md §14). */

// Private Collection items never render images or listings anywhere —
// every listing query excludes them at the source.
export const heroImagesQuery = groq`
  *[_type == "siteSettings"][0].heroImages
`

export const siteSettingsBasicQuery = groq`
  *[_type == "siteSettings"][0] {
    tagline,
    aboutBio,
    aboutPortrait
  }
`

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(displayOrder asc) {
    quote,
    author
  }
`

export const aboutQuery = groq`
  *[_type == "about"][0] {
    bio,
    artistStatement,
    profilePhotos,
    studioPhotos,
    cv,
    exhibitionHistory[] {
      year,
      exhibitionName,
      venue,
      location
    }
  }
`

export const featuredShopItemsQuery = groq`
  coalesce(
    *[_type == "siteSettings"][0].featuredShopItems[]->
      [coalesce(purchaseType, "buy") != "privateCollection"] {
      _id,
      title,
      "slug": slug.current,
      basePrice,
      images,
      availabilityStatus,
      editionSize,
      sold,
      stock,
      "purchaseType": coalesce(purchaseType, "buy"),
      stripePriceId
    },
    *[_type == "shopItem" && availabilityStatus == "available"
        && coalesce(purchaseType, "buy") != "privateCollection"]
      | order(_createdAt desc) [0...3] {
        _id,
        title,
        "slug": slug.current,
        basePrice,
        images,
        availabilityStatus,
        editionSize,
        sold,
        stock,
        "purchaseType": coalesce(purchaseType, "buy"),
        stripePriceId
      }
  )
`

// Checkout price validation — amounts always come from Sanity, never
// from the client. Buyable items only.
export const shopItemsBySlugsQuery = groq`
  *[_type == "shopItem" && slug.current in $slugs
      && coalesce(purchaseType, "buy") == "buy"] {
    _id,
    title,
    "slug": slug.current,
    basePrice,
    stock,
    stripePriceId
  }
`

export const featuredPressItemsQuery = groq`
  *[_type == "pressItem" && featured == true]
    | order(displayOrder asc) [0...4] {
      _id,
      type,
      title,
      source,
      date,
      externalLink
    }
`

// Series view of projects — the homepage Projects section and the
// /works pages treat each published project as a named series.
// `artworks` are the per-piece documents (title, note, sale link);
// when a project has none, the site falls back to its artworkImages.
export const allSeriesQuery = groq`
  *[_type == "project" && status == "published"] | order(displayOrder asc) {
    _id,
    title,
    "slug": slug.current,
    medium,
    projectNote,
    coverImage,
    artworkImages,
    "artworks": *[_type == "artwork" && project._ref == ^._id]
      | order(coalesce(displayOrder, 999) asc, _createdAt asc) {
        title,
        note,
        "image": images[0],
        "sale": shopItem-> {
          "slug": slug.current,
          basePrice,
          editionSize,
          sold,
          availabilityStatus,
          "purchaseType": coalesce(purchaseType, "buy")
        }
      }
  }
`

// Curated featured series (Site Settings → Featured Projects), falling
// back to the first four published. Drives the homepage Projects stage
// and /works Tier 1.
export const featuredSeriesQuery = groq`
  coalesce(
    *[_type == "siteSettings"][0].featuredProjects[]-> {
      _id,
      title,
      "slug": slug.current,
      medium,
      projectNote,
      coverImage,
      artworkImages
    },
    *[_type == "project" && status == "published"]
      | order(displayOrder asc) {
        _id,
        title,
        "slug": slug.current,
        medium,
        projectNote,
        coverImage,
        artworkImages
      }
  )[0...4]
`
