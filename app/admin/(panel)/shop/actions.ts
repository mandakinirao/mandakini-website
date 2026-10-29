'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { reorderDocs } from '@/lib/admin/content'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { slugify, splitNulls, toShopItemFields, uniqueSlug, validatePrintInput, type PrintErrors } from '@/lib/admin/shop'

export type SaveResult = { ok: true; id: string; slug: string } | { ok: false; errors: PrintErrors; message?: string }

function refresh() {
  revalidateSite()
}


export async function createPrint(raw: Record<string, unknown>): Promise<SaveResult> {
  await requireAdmin()
  const v = validatePrintInput(raw, 'create')
  if (!v.ok) return v
  const client = getAdminClient()
  const existing = await client.fetch<{ slugs: string[]; maxOrder: number | null }>(`{
    "slugs": *[_type == "shopItem" && defined(slug.current)].slug.current,
    "maxOrder": math::max(*[_type == "shopItem"].displayOrder)
  }`)
  const slug = uniqueSlug(slugify(v.value.title), existing.slugs ?? [])
  try {
    const doc = await client.create({
      _type: 'shopItem',
      ...splitNulls(toShopItemFields(v.value)).set,
      slug: { _type: 'slug', current: slug },
      sold: 0,
      displayOrder: (existing.maxOrder ?? 0) + 1,
    })
    refresh()
    return { ok: true, id: doc._id, slug }
  } catch (err) {
    console.error('[admin] createPrint failed:', err)
    return { ok: false, errors: {}, message: "Couldn't save. Check your connection and try again." }
  }
}

export async function updatePrint(id: string, raw: Record<string, unknown>): Promise<SaveResult> {
  await requireAdmin()
  const v = validatePrintInput(raw, 'edit')
  if (!v.ok) return v
  const client = getAdminClient()
  const current = await client.fetch<{ slug?: string } | null>(
    `*[_type == "shopItem" && _id == $id][0]{ "slug": slug.current }`,
    { id }
  )
  if (!current) return { ok: false, errors: {}, message: 'This print could not be found.' }
  try {
    // Blank "how many left" means "not tracked", so the field is removed.
    const { set, unset } = splitNulls(toShopItemFields(v.value))
    let patch = client.patch(id).set(set)
    if (unset.length) patch = patch.unset(unset)
    await patch.commit()
    refresh()
    return { ok: true, id, slug: current.slug ?? '' }
  } catch (err) {
    console.error('[admin] updatePrint failed:', err)
    return { ok: false, errors: {}, message: "Couldn't save. Check your connection and try again." }
  }
}

export async function deletePrint(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const client = getAdminClient()
  const orders = await client.fetch<number>(`count(*[_type == "order" && references($id)])`, { id })
  if (orders > 0) {
    return { ok: false, error: 'This print has orders, so it can’t be deleted. Turn off “Show in shop” instead.' }
  }
  await client.delete(id)
  refresh()
  return { ok: true }
}

export async function reorderPrints(ids: string[]): Promise<{ ok: boolean }> {
  await requireAdmin()
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) return { ok: false }
  await reorderDocs(getAdminClient(), ids, 'displayOrder')
  refresh()
  return { ok: true }
}
