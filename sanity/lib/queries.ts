import { groq } from 'next-sanity'

/** All GROQ lives here — never write inline GROQ (PROJECT.md §14). */

// Private Collection items never render images or listings anywhere —
// every listing query excludes them at the source.
export const heroImagesQuery = groq`
  *[_type == "siteSettings"][0].heroImages[].asset->url
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
  *[_type == "testimonial"] | order(order asc, _createdAt asc) {
    _id,
    quote,
    author,
    role
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

export const pressItemsQuery = groq`
  *[_type == "pressItem"] | order(coalesce(order, 99) asc) {
    _id,
    url,
    type,
    titleOverride,
    imageOverride { asset, alt },
    sourceOverride,
    order
  }
`


export const featuredShopItemsQuery = groq`
  coalesce(
    *[_type == "siteSettings"][0].featuredShopItems[]->
      [coalesce(purchaseType, "buy") != "privateCollection"] {
      _id,
      title,
      "slug": slug.current,
      desc,
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
      | order(coalesce(displayOrder, 999) asc, _createdAt asc) [0...3] {
        _id,
        title,
        "slug": slug.current,
        desc,
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

// Full shop listing — no slice, used by /shop page.
// The homepage teaser (EditionShop) uses featuredShopItemsQuery which has [0...3].
export const allShopItemsQuery = groq`
  *[_type == "shopItem" && availabilityStatus != "hidden"
      && coalesce(purchaseType, "buy") != "privateCollection"]
    | order(coalesce(displayOrder, 999) asc, _createdAt asc) {
      _id,
      title,
      "slug": slug.current,
      desc,
      basePrice,
      images,
      availabilityStatus,
      editionSize,
      sold,
      stock,
      "purchaseType": coalesce(purchaseType, "buy"),
      stripePriceId
    }
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
