import type { OrderStatus } from '@/lib/admin/orders'

const LABELS: Record<OrderStatus, string> = {
  paid: 'To ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`mr-admin-badge mr-admin-badge--${status}`}>{LABELS[status] ?? status}</span>
}
