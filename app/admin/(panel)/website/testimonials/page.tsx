import Link from 'next/link'
import SortableGrid from '@/components/admin/SortableGrid'
import { getAdminClient } from '@/lib/admin/sanity'
import { reorderTestimonials } from './actions'

export default async function TestimonialsAdmin() {
  const items = await getAdminClient().fetch<{ _id: string; quote?: string; personName?: string; image?: string }[]>(
    `*[_type == "testimonial"] | order(coalesce(displayOrder, 99) asc, _createdAt asc) { _id, quote, personName, "image": personImage.asset->url }`
  )
  return (
    <>
      <Link href="/admin/website" className="mr-admin-back">← Website</Link>
      <div className="mr-admin-head">
        <div>
          <h1>Testimonials</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>Drag to change the order they appear in.</p>
        </div>
        <Link href="/admin/website/testimonials/new" className="mr-admin-btn mr-admin-btn--primary">+ Add a testimonial</Link>
      </div>
      {items.length ? (
        <SortableGrid
          onReorder={reorderTestimonials}
          savedText="Order saved."
          cards={items.map((t) => ({
            id: t._id,
            href: `/admin/website/testimonials/${encodeURIComponent(t._id)}`,
            title: t.personName || 'Unnamed',
            image: t.image ? `${t.image}?w=400&h=400&fit=crop&auto=format` : '',
            lines: [t.quote ? `“${t.quote.slice(0, 90)}${t.quote.length > 90 ? '…' : ''}”` : ''],
            badges: [],
          }))}
        />
      ) : (
        <div className="mr-admin-rows"><p className="mr-admin-empty">No testimonials yet.</p></div>
      )}
    </>
  )
}
