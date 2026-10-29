import type { SanityClient } from 'next-sanity'

export type MessageStatus = 'new' | 'responded' | 'closed'

export const MESSAGE_TABS = [
  { key: 'new', label: 'New', status: 'new' },
  { key: 'replied', label: 'Replied', status: 'responded' },
  { key: 'archived', label: 'Archived', status: 'closed' },
] as const

const VALID: MessageStatus[] = ['new', 'responded', 'closed']

export async function setMessageStatus(
  client: Pick<SanityClient, 'patch'>,
  id: string,
  status: MessageStatus
): Promise<{ ok: boolean }> {
  if (!VALID.includes(status)) return { ok: false }
  await client.patch(id).set({ status }).commit()
  return { ok: true }
}
