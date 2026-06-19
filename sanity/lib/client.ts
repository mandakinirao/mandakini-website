import { createClient } from 'next-sanity'

// projectId and dataset are public — already hardcoded in sanity.config.ts.
// Fallbacks make the client resilient when NEXT_PUBLIC_* vars are absent
// (e.g. Vercel builds that don't have them configured).
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i4t9kzxg',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  // CDN disabled: published content appears within the ISR window (revalidate=60)
  // rather than stacking CDN staleness on top. Re-enable only if query volume
  // becomes a cost concern.
  useCdn: false,
  // Only surface published documents — never drafts.
  perspective: 'published',
})
