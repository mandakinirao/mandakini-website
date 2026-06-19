import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  // CDN disabled: published content appears within the ISR window (revalidate=60)
  // rather than stacking CDN staleness on top. Re-enable only if query volume
  // becomes a cost concern.
  useCdn: false,
  // Only surface published documents — never drafts.
  perspective: 'published',
})
