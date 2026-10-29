'use client'

import { useTransition } from 'react'
import type { MessageStatus } from '@/lib/admin/messages'
import { setStatusAction } from './actions'

export default function MessageActions({ id, status, email }: { id: string; status: MessageStatus; email?: string }) {
  const [pending, start] = useTransition()
  const move = (s: MessageStatus) => start(async () => { await setStatusAction(id, s) })
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
      {email && (
        <a
          className="mr-admin-btn mr-admin-btn--primary"
          href={`mailto:${email}?subject=${encodeURIComponent('Re: your message to Mandakini Rao')}`}
          onClick={() => status === 'new' && move('responded')}
        >
          Reply by email
        </a>
      )}
      {status === 'new' && (
        <button type="button" className="mr-admin-btn" disabled={pending} onClick={() => move('responded')}>Mark as replied</button>
      )}
      {status !== 'closed' && (
        <button type="button" className="mr-admin-btn" disabled={pending} onClick={() => move('closed')}>Archive</button>
      )}
      {status !== 'new' && (
        <button type="button" className="mr-admin-btn mr-admin-btn--quiet" disabled={pending} onClick={() => move('new')}>Move back to New</button>
      )}
    </div>
  )
}
