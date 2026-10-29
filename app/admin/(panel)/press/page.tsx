import Link from 'next/link'
import SortableGrid from '@/components/admin/SortableGrid'
import { getAdminClient } from '@/lib/admin/sanity'
import { reorderPress } from './actions'

const TYPE: Record<string, string> = { article: 'Article', video: 'Video', podcast: 'Podcast' }

export default async function PressAdmin() {
  const items = await getAdminClient().fetch<{ _id: string; headline?: string; source?: string; link?: string; type?: string; image?: string; home?: boolean }[]>(
    `*[_type == "pressItem"] | order(coalesce(displayOrder, 99) asc, _createdAt asc) {
      _id, "headline": headlineOverride, source, link, type, "image": thumbnailOverride.asset->url, "home": featuredOnHomepage
    }`
  )
  return (
    <>
      <div className="mr-admin-head">
        <div>
          <h1>Press</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>Articles, videos, podcasts and newspaper clippings. Drag to change their order.</p>
        </div>
        <Link href="/admin/press/new" className="mr-admin-btn mr-admin-btn--primary">+ Add press</Link>
      </div>
      {items.length ? (
        <SortableGrid
          onReorder={reorderPress}
          savedText="Order saved. The Press page shows this order now."
          cards={items.map((p) => ({
            id: p._id,
            href: `/admin/press/${encodeURIComponent(p._id)}`,
            title: p.headline || p.source || p.link?.replace(/^https?:\/\//, '').slice(0, 40) || 'Untitled',
            image: p.image ? `${p.image}?w=600&fit=max&auto=format` : '',
            lines: [p.source && p.headline ? p.source : ''].filter(Boolean),
            badges: [TYPE[p.type ?? 'article'] ?? 'Article', ...(p.link ? [] : ['Clipping']), ...(p.home ? ['On homepage'] : [])],
          }))}
        />
      ) : (
        <div className="mr-admin-rows"><p className="mr-admin-empty">No press yet.</p></div>
      )}
    </>
  )
}
