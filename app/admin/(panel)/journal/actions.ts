'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { toPostFields, validatePost } from '@/lib/admin/journal'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { slugify, splitNulls, uniqueSlug } from '@/lib/admin/shop'

export type PostSave = { ok: true; id: string; slug: string } | { ok: false; errors: Record<string, string>; message?: string }

export async function savePost(id: string | null, raw: Record<string, unknown>): Promise<PostSave> {
  await requireAdmin()
  const v = validatePost(raw)
  if (!v.ok) return { ok: false, errors: v.errors }
  const client = getAdminClient()
  const { set, unset } = splitNulls(toPostFields(v.value))
  try {
    if (id) {
      const slug = await client.fetch<string | null>(`*[_type == "journalPost" && _id == $id][0].slug.current`, { id })
      let p = client.patch(id).set(set)
      if (unset.length) p = p.unset(unset)
      await p.commit()
      revalidateSite()
      return { ok: true, id, slug: slug ?? '' }
    }
    const slugs = await client.fetch<string[]>(`*[_type == "journalPost" && defined(slug.current)].slug.current`)
    const slug = uniqueSlug(slugify(v.value.title), slugs ?? [])
    const doc = await client.create({ _type: 'journalPost', ...set, slug: { _type: 'slug', current: slug } })
    revalidateSite()
    return { ok: true, id: doc._id, slug }
  } catch (err) {
    console.error('[admin] savePost failed:', err)
    return { ok: false, errors: {}, message: "Couldn't save. Check your connection and try again." }
  }
}

export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const client = getAdminClient()
  const type = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id })
  if (type !== 'journalPost') return { ok: false, error: 'This post could not be found.' }
  await client.delete(id)
  revalidateSite()
  return { ok: true }
}
