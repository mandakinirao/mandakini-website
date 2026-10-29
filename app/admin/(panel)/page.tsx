import Link from 'next/link'
import { getAdminClient } from '@/lib/admin/sanity'

interface Summary {
  toShip: number
  newMessages: number
  inShop: number
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export default async function AdminHome() {
  const s = await getAdminClient().fetch<Summary>(`{
    "toShip": count(*[_type == "order" && status == "paid"]),
    "newMessages": count(*[_type == "enquiry" && coalesce(status, "new") == "new"]),
    "inShop": count(*[_type == "shopItem" && coalesce(availabilityStatus, "available") != "hidden"])
  }`)

  return (
    <>
      <div className="mr-admin-head">
        <h1>Hello, Mandakini</h1>
      </div>
      <p className="mr-admin-summary">
        <Link href="/admin/orders">
          {s.toShip ? plural(s.toShip, 'order to ship', 'orders to ship') : 'Nothing to ship'}
        </Link>
        {' · '}
        <span>{plural(s.newMessages, 'new message', 'new messages')}</span>
        {' · '}
        <Link href="/admin/shop">{plural(s.inShop, 'print in the shop', 'prints in the shop')}</Link>
      </p>
      <div className="mr-admin-head" style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/admin/shop/new" className="mr-admin-btn mr-admin-btn--primary">
            + Add a print
          </Link>
          <Link href="/admin/orders" className="mr-admin-btn">
            See orders
          </Link>
        </div>
      </div>
    </>
  )
}
