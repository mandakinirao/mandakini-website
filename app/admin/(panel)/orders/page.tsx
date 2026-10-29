import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatDate, formatINR, itemsSummary } from '@/lib/admin/format'
import { ORDER_FIELDS, ORDER_TABS, type AdminOrder } from '@/lib/admin/orders'
import { getAdminClient } from '@/lib/admin/sanity'

const EMPTY: Record<string, string> = {
  'to-ship': 'Nothing waiting to be shipped.',
  shipped: 'No orders on their way right now.',
  completed: 'No delivered orders yet.',
  cancelled: 'No cancelled orders.',
}

export default async function OrdersPage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = ORDER_TABS.find((t) => t.key === searchParams.tab) ?? ORDER_TABS[0]
  const client = getAdminClient()
  const [orders, counts] = await Promise.all([
    client.fetch<AdminOrder[]>(
      `*[_type == "order" && coalesce(status, "paid") == $status] | order(createdAt desc) {${ORDER_FIELDS}}`,
      { status: tab.status }
    ),
    client.fetch<Record<string, number>>(`{
      "paid": count(*[_type == "order" && coalesce(status, "paid") == "paid"]),
      "shipped": count(*[_type == "order" && status == "shipped"]),
      "delivered": count(*[_type == "order" && status == "delivered"]),
      "cancelled": count(*[_type == "order" && status == "cancelled"])
    }`),
  ])

  return (
    <>
      <div className="mr-admin-head">
        <h1>Orders</h1>
      </div>
      <nav className="mr-admin-tabs" aria-label="Order status">
        {ORDER_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/orders?tab=${t.key}`}
            className="mr-admin-tab"
            aria-current={t.key === tab.key ? 'page' : undefined}
          >
            {t.label} ({counts[t.status] ?? 0})
          </Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        <div className="mr-admin-rows">
          <p className="mr-admin-empty">{EMPTY[tab.key]}</p>
        </div>
      ) : (
        <div className="mr-admin-rows">
          {orders.map((o) => (
            <Link key={o._id} href={`/admin/orders/${encodeURIComponent(o._id)}`} className="mr-admin-row">
              <strong>{o.orderNumber}</strong>
              <span className="mr-admin-muted">{formatDate(o.createdAt)}</span>
              <span>{o.customerName}</span>
              <span>{itemsSummary(o.items)}</span>
              <span>{formatINR(o.amountTotal)}</span>
              <span>
                <StatusBadge status={o.status} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
