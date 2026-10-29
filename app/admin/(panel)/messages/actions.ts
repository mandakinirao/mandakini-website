'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { setMessageStatus, type MessageStatus } from '@/lib/admin/messages'
import { getAdminClient } from '@/lib/admin/sanity'

export async function setStatusAction(id: string, status: MessageStatus): Promise<{ ok: boolean }> {
  await requireAdmin()
  const client = getAdminClient()
  const type = await client.fetch<string | null>(`*[_id == $id][0]._type`, { id })
  if (type !== 'enquiry') return { ok: false }
  const r = await setMessageStatus(client, id, status)
  revalidatePath('/admin', 'layout')
  return r
}
