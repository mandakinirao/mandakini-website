'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { saveWebsiteWords } from '@/lib/admin/singletons'

export async function saveWordsAction(raw: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  try {
    await saveWebsiteWords(getAdminClient(), raw)
    revalidateSite()
    return { ok: true }
  } catch (err) {
    console.error('[admin] saveWebsiteWords failed:', err)
    return { ok: false, error: "Couldn't save. Check your connection and try again." }
  }
}
