/** Shared GROQ projection for prints in /admin. */
export const ADMIN_PRINT_FIELDS = `
  _id, title, "slug": slug.current, basePrice, editionSize, stock, sold, description,
  "purchaseType": coalesce(purchaseType, "buy"),
  "availabilityStatus": coalesce(availabilityStatus, "available"),
  "featuredOnHomepage": coalesce(featuredOnHomepage, false),
  "images": images[]{ _key, alt, "assetId": asset._ref, "url": asset->url }
`

export interface AdminPrint {
  _id: string
  title?: string
  slug?: string
  basePrice?: number
  editionSize?: number
  stock?: number | null
  sold?: number
  description?: string
  purchaseType: 'buy' | 'privateCollection'
  availabilityStatus: 'available' | 'soldOut' | 'hidden'
  featuredOnHomepage: boolean
  images?: { _key: string; alt?: string; assetId: string; url?: string }[]
}
