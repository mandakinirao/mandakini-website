import { revalidatePath } from 'next/cache'
import { createClient, type SanityClient } from 'next-sanity'

/** Server-only Sanity client with write access — never import from a client component. */
export function getAdminClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!token) throw new Error('SANITY_API_WRITE_TOKEN is not set')
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i4t9kzxg',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token,
    useCdn: false,
    perspective: 'published',
  })
}

/** Save = live: refresh every public page (content volume is small). */
export function revalidateSite(): void {
  revalidatePath('/', 'layout')
}
