'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { reorderDocs } from '@/lib/admin/content'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { splitNulls } from '@/lib/admin/shop'
import { toTestimonialFields, validateTestimonial } from '@/lib/admin/testimonials'

export type TestimonialSave =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string>; message?: string }

const FAIL = "Couldn't save. Check your connection and try again."

export async function saveTestimonial(id: string | null, raw: Record<string, unknown>): Promise<TestimonialSave> {
  await requireAdmin()
  const v = validateTestimonial(raw)
  if (!v.ok) return { ok: false, errors: v.errors }
  const client = getAdminClient()
  const { set, unset } = splitNulls(toTestimonialFields(v.value))
  try {
    if (id) {
      let p = client.patch(id).set(set)
      if (unset.length) p = p.unset(unset)
      await p.commit()
    } else {
      const max = await client.fetch<number | null>(`math::max(*[_type == "testimonial"].displayOrder)`)
      const doc = await client.create({ _type: 'testimonial', ...set, displayOrder: (max ?? 0) + 1 })
      id = doc._id
    }
    revalidateSite()
    return { ok: true, id }
  } catch (err) {
    console.error('[admin] saveTestimonial failed:', err)
    return { ok: false, errors: {}, message: FAIL }
  }
}

export async function deleteTestimonial(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const client = getAdminClient()
  const type = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id })
  if (type !== 'testimonial') return { ok: false, error: 'This testimonial could not be found.' }
  await client.delete(id)
  revalidateSite()
  return { ok: true }
}

export async function reorderTestimonials(ids: string[]): Promise<{ ok: boolean }> {
  await requireAdmin()
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) return { ok: false }
  await reorderDocs(getAdminClient(), ids, 'displayOrder')
  revalidateSite()
  return { ok: true }
}
