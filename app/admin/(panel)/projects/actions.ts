'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { reorderDocs } from '@/lib/admin/content'
import { toProjectFields, validateProject } from '@/lib/admin/projects'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { slugify, splitNulls, uniqueSlug } from '@/lib/admin/shop'

export type ProjectSave = { ok: true; id: string; slug: string } | { ok: false; errors: Record<string, string>; message?: string }

const FAIL = "Couldn't save. Check your connection and try again."

export async function saveProject(id: string | null, raw: Record<string, unknown>): Promise<ProjectSave> {
  await requireAdmin()
  const v = validateProject(raw)
  if (!v.ok) return { ok: false, errors: v.errors }
  const client = getAdminClient()
  const { set, unset } = splitNulls(toProjectFields(v.value))
  try {
    if (id) {
      const slug = await client.fetch<string | null>(`*[_type == "project" && _id == $id][0].slug.current`, { id })
      let p = client.patch(id).set(set)
      if (unset.length) p = p.unset(unset)
      await p.commit()
      revalidateSite()
      return { ok: true, id, slug: slug ?? '' }
    }
    const existing = await client.fetch<{ slugs: string[]; max: number | null }>(`{
      "slugs": *[_type == "project" && defined(slug.current)].slug.current,
      "max": math::max(*[_type == "project"].displayOrder)
    }`)
    const slug = uniqueSlug(slugify(v.value.name), existing.slugs ?? [])
    const doc = await client.create({
      _type: 'project',
      ...set,
      slug: { _type: 'slug', current: slug },
      displayOrder: (existing.max ?? 0) + 1,
    })
    revalidateSite()
    return { ok: true, id: doc._id, slug }
  } catch (err) {
    console.error('[admin] saveProject failed:', err)
    return { ok: false, errors: {}, message: FAIL }
  }
}

export async function deleteProject(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const client = getAdminClient()
  const type = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id })
  if (type !== 'project') return { ok: false, error: 'This project could not be found.' }
  await client.delete(id)
  revalidateSite()
  return { ok: true }
}

export async function reorderProjects(ids: string[]): Promise<{ ok: boolean }> {
  await requireAdmin()
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) return { ok: false }
  await reorderDocs(getAdminClient(), ids, 'displayOrder')
  revalidateSite()
  return { ok: true }
}
