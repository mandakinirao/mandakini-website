'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { saveAbout, type AboutInput } from '@/lib/admin/singletons'

export async function saveAboutAction(input: AboutInput): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  try {
    await saveAbout(getAdminClient(), {
      portrait: input.portrait,
      bio: String(input.bio ?? ''),
      homeSnippet: String(input.homeSnippet ?? ''),
      teaserLine: String(input.teaserLine ?? ''),
    })
    revalidateSite()
    return { ok: true }
  } catch (err) {
    console.error('[admin] saveAbout failed:', err)
    return { ok: false, error: "Couldn't save. Check your connection and try again." }
  }
}
