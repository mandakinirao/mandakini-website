'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { reorderDocs } from '@/lib/admin/content'
import { saveHomepage } from '@/lib/admin/homepage'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import type { PrintImage } from '@/lib/admin/shop'

export async function saveHomepageAction(input: { top: PrintImage | null; bottom: PrintImage | null }): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  try {
    await saveHomepage(getAdminClient(), input)
    revalidateSite()
    return { ok: true }
  } catch (err) {
    console.error('[admin] saveHomepage failed:', err)
    return { ok: false, error: "Couldn't save. Check your connection and try again." }
  }
}

export async function reorderHomepage(ids: string[]): Promise<{ ok: boolean }> {
  await requireAdmin()
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== 'string')) return { ok: false }
  await reorderDocs(getAdminClient(), ids, 'homepageOrder')
  revalidateSite()
  return { ok: true }
}
