'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { reorderDocs } from '@/lib/admin/content'
import { lookUpLink, toPressFields, validatePress } from '@/lib/admin/press'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { splitNulls } from '@/lib/admin/shop'

export type PressSave = { ok: true; id: string } | { ok: false; errors: Record<string, string>; message?: string }

export async function savePress(id: string | null, raw: Record<string, unknown>): Promise<PressSave> {
  await requireAdmin()
  const v = validatePress(raw)
  if (!v.ok) return { ok: false, errors: v.errors }
  const client = getAdminClient()
  const { set, unset } = splitNulls(toPressFields(v.value))
  try {
    if (id) {
      let p = client.patch(id).set(set)
      if (unset.length) p = p.unset(unset)
      await p.commit()
    } else {
      const max = await client.fetch<number | null>(`math::max(*[_type == "pressItem"].displayOrder)`)
      id = (await client.create({ _type: 'pressItem', ...set, displayOrder: (max ?? 0) + 1 }))._id
    }
    revalidateSite()
    return { ok: true, id }
  } catch (err) {
    console.error('[admin] savePress failed:', err)
    return { ok: false, errors: {}, message: "Couldn't save. Check your connection and try again." }
  }
}

export async function lookUpAction(url: string): Promise<{ headline?: string; source?: string; image?: string }> {
  await requireAdmin()
  if (!/^https?:\/\/\S+\.\S+/.test(String(url ?? '').trim())) return {}
  const { enrichPressItems } = await import('@/lib/press')
  return lookUpLink(url.trim(), enrichPressItems)
}

export async function deletePress(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const client = getAdminClient()
  const type = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id })
  if (type !== 'pressItem') return { ok: false, error: 'This press item could not be found.' }
  await client.delete(id)
  revalidateSite()
  return { ok: true }
}

export async function reorderPress(ids: string[]): Promise<{ ok: boolean }> {
  await requireAdmin()
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) return { ok: false }
  await reorderDocs(getAdminClient(), ids, 'displayOrder')
  revalidateSite()
  return { ok: true }
}
