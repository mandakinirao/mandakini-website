import type { SanityClient } from 'next-sanity'
import { imageField } from '@/lib/admin/content'
import type { PrintImage } from '@/lib/admin/shop'

export const HOMEPAGE_ID = 'homepage'

/** The homepage record holds only the two hero reveal photos. */
export async function saveHomepage(
  client: Pick<SanityClient, 'createIfNotExists' | 'patch'>,
  input: { top: PrintImage | null; bottom: PrintImage | null }
): Promise<void> {
  await client.createIfNotExists({ _id: HOMEPAGE_ID, _type: 'homepage' })
  const fields = {
    heroRevealTop: imageField(input.top, 'Homepage opening picture'),
    heroRevealBottom: imageField(input.bottom, 'Homepage revealed picture'),
  }
  const set: Record<string, unknown> = {}
  const unset: string[] = []
  for (const [k, v] of Object.entries(fields)) {
    if (v) set[k] = v
    else unset.push(k)
  }
  let p = client.patch(HOMEPAGE_ID).set(set)
  if (unset.length) p = p.unset(unset)
  await p.commit()
}
