import Link from 'next/link'
import { notFound } from 'next/navigation'
import PrintForm, { type PrintFormValues } from '@/components/admin/PrintForm'
import { ADMIN_PRINT_FIELDS, type AdminPrint } from '@/lib/admin/print-query'
import { getAdminClient } from '@/lib/admin/sanity'
import DeletePrint from './DeletePrint'

const num = (n?: number | null) => (typeof n === 'number' ? String(n) : '')

export default async function EditPrintPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { saved?: string }
}) {
  const id = decodeURIComponent(params.id)
  const p = await getAdminClient().fetch<AdminPrint | null>(
    `*[_type == "shopItem" && _id == $id][0]{${ADMIN_PRINT_FIELDS}}`,
    { id }
  )
  if (!p) notFound()

  const initial: PrintFormValues = {
    title: p.title ?? '',
    price: num(p.basePrice),
    editionSize: num(p.editionSize),
    howManyLeft: num(p.stock),
    description: p.description ?? '',
    height: num(p.height),
    width: num(p.width),
    sizeUnit: p.sizeUnit,
    purchaseType: p.purchaseType,
    showInShop: p.availabilityStatus !== 'hidden',
    showOnHomepage: p.featuredOnHomepage,
    photos: (p.images ?? [])
      .filter((i) => i.assetId)
      .map((i) => ({ key: i._key, name: i.alt || p.title || 'photo', alt: i.alt ?? '', status: 'done' as const, assetId: i.assetId, url: i.url })),
  }

  return (
    <>
      <Link href="/admin/shop" className="mr-admin-back">← Shop</Link>
      <div className="mr-admin-head">
        <h1>{p.title || 'Untitled print'}</h1>
        {p.slug && p.availabilityStatus !== 'hidden' && (
          <a href={`/shop/${p.slug}`} target="_blank" rel="noreferrer" className="mr-admin-btn">
            View on the site ↗
          </a>
        )}
      </div>
      {searchParams.saved && (
        <p className="mr-admin-notice" role="status">
          {initial.showInShop ? `${initial.title} is live.` : `Saved. ${initial.title} is hidden from the shop.`}
        </p>
      )}
      <PrintForm id={p._id} initial={initial} />
      <div style={{ marginTop: 48, maxWidth: 520 }}>
        <DeletePrint id={p._id} title={p.title || 'this print'} />
      </div>
    </>
  )
}
