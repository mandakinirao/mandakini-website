'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState, useTransition } from 'react'
import type { OrderStatus } from '@/lib/admin/orders'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { cancelAction, deliverAction, resendAction, shipAction, type ActionState } from './actions'

interface Props {
  orderId: string
  status: OrderStatus
  firstName: string
  customerName: string
  amount: string
  courierName?: string
  awbNumber?: string
  shippedEmailSent: boolean
  shippedAt: string
  deliveredAt: string
  refundId?: string
  refundedAt: string
}

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="mr-admin-btn mr-admin-btn--primary" disabled={pending}>
      {pending ? 'Saving…' : children}
    </button>
  )
}

function Notice({ state }: { state: ActionState }) {
  if (state.error) return <p className="mr-admin-notice mr-admin-notice--error" role="alert">{state.error}</p>
  if (!state.message) return null
  const warn = state.message.includes("didn't")
  return <p className={`mr-admin-notice${warn ? ' mr-admin-notice--warn' : ''}`} role="status">{state.message}</p>
}

export default function OrderActions(p: Props) {
  const [shipState, ship] = useFormState(shipAction.bind(null, p.orderId, p.firstName), {} as ActionState)
  const [other, setOther] = useState<ActionState>({})
  const [pending, start] = useTransition()
  const run = (fn: () => Promise<ActionState>) => start(async () => setOther(await fn()))

  return (
    <aside className="mr-admin-panel">
      {p.status === 'shipped' && <Notice state={shipState} />}
      <Notice state={other} />

      {p.status === 'paid' && (
        <>
          <h2>Ready to ship?</h2>
          <p className="mr-admin-muted">Pack the print, then add the courier details. {p.firstName} gets an email with the tracking number.</p>
          <form action={ship} className="mr-admin-form">
            <label className="mr-admin-field">
              <span>Courier name</span>
              <input name="courierName" placeholder="e.g. Delhivery" required maxLength={100} />
            </label>
            <label className="mr-admin-field">
              <span>Tracking number</span>
              <input name="awbNumber" required maxLength={100} />
            </label>
            <Submit>Mark as shipped</Submit>
          </form>
        </>
      )}

      {(p.status === 'shipped' || p.status === 'delivered') && (
        <>
          <h2>{p.status === 'shipped' ? 'On its way' : 'Delivered'}</h2>
          <dl className="mr-admin-dl">
            <dt>Courier</dt>
            <dd>{p.courierName}</dd>
            <dt>Tracking</dt>
            <dd>{p.awbNumber}</dd>
            {p.shippedAt && (<><dt>Shipped</dt><dd>{p.shippedAt}</dd></>)}
            {p.deliveredAt && (<><dt>Delivered</dt><dd>{p.deliveredAt}</dd></>)}
          </dl>
          {p.status === 'shipped' && !p.shippedEmailSent && (
            <p className="mr-admin-notice mr-admin-notice--warn" style={{ marginTop: 16 }}>
              The shipping email didn&apos;t send.{' '}
              <button type="button" className="mr-admin-btn mr-admin-btn--quiet" disabled={pending} onClick={() => run(() => resendAction(p.orderId))}>
                Send it again
              </button>
            </p>
          )}
          {p.status === 'shipped' && (
            <button
              type="button"
              className="mr-admin-btn mr-admin-btn--primary"
              style={{ marginTop: 20, width: '100%' }}
              disabled={pending}
              onClick={() => run(() => deliverAction(p.orderId))}
            >
              {pending ? 'Saving…' : 'Mark as delivered'}
            </button>
          )}
        </>
      )}

      {(p.status === 'paid' || p.status === 'shipped') && (
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--a-line)' }}>
          <ConfirmButton
            label="Cancel order"
            question={`Cancel this order and refund ${p.amount} to ${p.customerName}? This can't be undone.`}
            confirmLabel="Yes, cancel and refund"
            keepLabel="Keep the order"
            onConfirm={async () => {
              const r = await cancelAction(p.orderId)
              if (r.error) return r.error
              setOther(r)
            }}
          />
        </div>
      )}

      {p.status === 'cancelled' && (
        <>
          <h2>Cancelled and refunded</h2>
          <dl className="mr-admin-dl">
            <dt>Refunded</dt>
            <dd>{p.amount}{p.refundedAt ? ` on ${p.refundedAt}` : ''}</dd>
            {p.refundId && (<><dt>Reference</dt><dd>{p.refundId}</dd></>)}
          </dl>
        </>
      )}
    </aside>
  )
}
