import Link from 'next/link'
import SortableGrid, { type GridCard } from '@/components/admin/SortableGrid'
import { formatINR } from '@/lib/admin/format'
import { ADMIN_PRINT_FIELDS, type AdminPrint } from '@/lib/admin/print-query'
import { getAdminClient } from '@/lib/admin/sanity'

function stockLine(p: AdminPrint): string {
  if (p.availabilityStatus === 'soldOut' || p.stock === 0) return 'Sold out'
  if (typeof p.stock !== 'number') return 'Not counted'
  return p.editionSize ? `${p.stock} of ${p.editionSize} left` : `${p.stock} left`
}

export default async function ShopPage() {
  const prints = await getAdminClient().fetch<AdminPrint[]>(
    `*[_type == "shopItem"] | order(coalesce(displayOrder, 999) asc, _createdAt asc) {${ADMIN_PRINT_FIELDS}}`
  )

  const cards: GridCard[] = prints.map((p) => ({
    id: p._id,
    href: `/admin/shop/${encodeURIComponent(p._id)}`,
    title: p.title || 'Untitled print',
    image: p.images?.[0]?.url ? `${p.images[0].url}?w=600&fit=max&auto=format` : '',
    lines: [p.purchaseType === 'privateCollection' ? 'Enquiry only' : formatINR(p.basePrice ?? 0), stockLine(p)],
    badges: [
      ...(p.availabilityStatus === 'hidden' ? ['Hidden'] : []),
      ...(p.availabilityStatus === 'soldOut' ? ['Sold out'] : []),
      ...(p.featuredOnHomepage ? ['On homepage'] : []),
      ...(p.purchaseType === 'privateCollection' ? ['Enquiry only'] : []),
    ],
  }))

  return (
    <>
      <div className="mr-admin-head">
        <div>
          <h1>Shop</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>
            Drag the prints to change their order in the shop.
          </p>
        </div>
        <Link href="/admin/shop/new" className="mr-admin-btn mr-admin-btn--primary">
          + Add a print
        </Link>
      </div>
      {cards.length ? (
        <SortableGrid cards={cards} />
      ) : (
        <div className="mr-admin-rows">
          <p className="mr-admin-empty">No prints yet. Add your first one.</p>
        </div>
      )}
    </>
  )
}
