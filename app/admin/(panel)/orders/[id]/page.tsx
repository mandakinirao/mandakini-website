import Link from 'next/link'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatDate, formatINR } from '@/lib/admin/format'
import { fetchOrder } from '@/lib/admin/orders'
import { getAdminClient } from '@/lib/admin/sanity'
import OrderActions from './OrderActions'
import CopyButton from '@/components/admin/CopyButton'

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await fetchOrder(getAdminClient(), decodeURIComponent(params.id))
  if (!order) notFound()

  return (
    <>
      <Link href="/admin/orders" className="mr-admin-back">← All orders</Link>
      <div className="mr-admin-head">
        <div>
          <h1>{order.orderNumber}</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>
            Paid on {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mr-admin-order">
        <div>
          <section className="mr-admin-panel">
            <h2>Buyer</h2>
            <dl className="mr-admin-dl">
              <dt>Name</dt>
              <dd>{order.customerName || 'Not given'}</dd>
              <dt>Phone</dt>
              <dd>{order.customerPhone ? <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a> : 'Not given'}</dd>
              <dt>Email</dt>
              <dd>{order.customerEmail ? <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a> : 'Not given'}</dd>
            </dl>
          </section>

          <section className="mr-admin-panel">
            <h2>Ship to</h2>
            <p className="mr-admin-address">{order.shippingAddress || 'No address was given.'}</p>
            {order.shippingAddress && (
              <CopyButton text={`${order.customerName}\n${order.shippingAddress}\n${order.customerPhone ?? ''}`.trim()} label="Copy address" />
            )}
          </section>

          <section className="mr-admin-panel">
            <h2>What they bought</h2>
            <table className="mr-admin-items">
              <tbody>
                {order.items?.map((i, n) => (
                  <tr key={n}>
                    <td>{i.title} × {i.quantity}</td>
                    <td>{formatINR(i.priceAtPurchase * i.quantity)}</td>
                  </tr>
                ))}
                <tr>
                  <td>Total paid</td>
                  <td>{formatINR(order.amountTotal)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <OrderActions
          orderId={order._id}
          status={order.status}
          firstName={(order.customerName || 'The buyer').split(' ')[0]}
          customerName={order.customerName || 'the buyer'}
          amount={formatINR(order.amountTotal)}
          courierName={order.courierName}
          awbNumber={order.awbNumber}
          shippedEmailSent={Boolean(order.shippedEmailSent)}
          shippedAt={formatDate(order.shippedAt)}
          deliveredAt={formatDate(order.deliveredAt)}
          refundId={order.refundId}
          refundedAt={formatDate(order.refundedAt)}
        />
      </div>
    </>
  )
}
