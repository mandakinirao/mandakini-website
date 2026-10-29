import Link from 'next/link'
import { formatDate } from '@/lib/admin/format'
import { MESSAGE_TABS, type MessageStatus } from '@/lib/admin/messages'
import { getAdminClient } from '@/lib/admin/sanity'
import MessageActions from './MessageActions'

interface Message {
  _id: string
  name?: string
  email?: string
  phone?: string
  message?: string
  budgetRange?: string
  submittedAt?: string
  status: MessageStatus
}

const EMPTY: Record<string, string> = {
  new: 'No new messages.',
  replied: 'Nothing here yet.',
  archived: 'Nothing archived.',
}

export default async function MessagesAdmin({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = MESSAGE_TABS.find((t) => t.key === searchParams.tab) ?? MESSAGE_TABS[0]
  const client = getAdminClient()
  const [messages, counts] = await Promise.all([
    client.fetch<Message[]>(
      `*[_type == "enquiry" && coalesce(status, "new") == $status] | order(coalesce(submittedAt, _createdAt) desc) {
        _id, name, email, phone, message, budgetRange, "submittedAt": coalesce(submittedAt, _createdAt), "status": coalesce(status, "new")
      }`,
      { status: tab.status }
    ),
    client.fetch<Record<string, number>>(`{
      "new": count(*[_type == "enquiry" && coalesce(status, "new") == "new"]),
      "responded": count(*[_type == "enquiry" && status == "responded"]),
      "closed": count(*[_type == "enquiry" && status == "closed"])
    }`),
  ])

  return (
    <>
      <div className="mr-admin-head"><h1>Messages</h1></div>
      <nav className="mr-admin-tabs" aria-label="Message status">
        {MESSAGE_TABS.map((t) => (
          <Link key={t.key} href={`/admin/messages?tab=${t.key}`} className="mr-admin-tab" aria-current={t.key === tab.key ? 'page' : undefined}>
            {t.label} ({counts[t.status] ?? 0})
          </Link>
        ))}
      </nav>
      {messages.length === 0 ? (
        <div className="mr-admin-rows"><p className="mr-admin-empty">{EMPTY[tab.key]}</p></div>
      ) : (
        messages.map((m) => (
          <section key={m._id} className="mr-admin-panel">
            <div className="mr-admin-head" style={{ marginBottom: 12 }}>
              <h2>{m.name || 'Someone'}</h2>
              <span className="mr-admin-muted">{formatDate(m.submittedAt)}</span>
            </div>
            <dl className="mr-admin-dl">
              {m.email && (<><dt>Email</dt><dd><a href={`mailto:${m.email}`}>{m.email}</a></dd></>)}
              {m.phone && (<><dt>Phone</dt><dd><a href={`tel:${m.phone}`}>{m.phone}</a></dd></>)}
              {m.budgetRange && (<><dt>Budget</dt><dd>{m.budgetRange}</dd></>)}
            </dl>
            <p style={{ whiteSpace: 'pre-line', margin: '16px 0 0' }}>{m.message}</p>
            <MessageActions id={m._id} status={m.status} email={m.email} />
          </section>
        ))
      )}
    </>
  )
}
