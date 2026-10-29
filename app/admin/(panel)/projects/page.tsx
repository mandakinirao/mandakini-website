import Link from 'next/link'
import SortableGrid from '@/components/admin/SortableGrid'
import { getAdminClient } from '@/lib/admin/sanity'
import { reorderProjects } from './actions'

export default async function ProjectsAdmin() {
  const items = await getAdminClient().fetch<{ _id: string; name?: string; year?: string; image?: string; home?: boolean; count: number }[]>(
    `*[_type == "project"] | order(coalesce(displayOrder, 999) asc, _createdAt asc) {
      _id, "name": seriesName, year, "image": gallery[0].asset->url, "home": featuredOnHomepage, "count": count(gallery)
    }`
  )
  return (
    <>
      <div className="mr-admin-head">
        <div>
          <h1>Projects</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>Your series of work. Drag to change their order on the Projects page.</p>
        </div>
        <Link href="/admin/projects/new" className="mr-admin-btn mr-admin-btn--primary">+ Add a project</Link>
      </div>
      {items.length ? (
        <SortableGrid
          onReorder={reorderProjects}
          savedText="Order saved. The Projects page shows this order now."
          cards={items.map((p) => ({
            id: p._id,
            href: `/admin/projects/${encodeURIComponent(p._id)}`,
            title: p.name || 'Untitled project',
            image: p.image ? `${p.image}?w=600&fit=max&auto=format` : '',
            lines: [[p.year, `${p.count ?? 0} photo${p.count === 1 ? '' : 's'}`].filter(Boolean).join(' · ')],
            badges: p.home ? ['On homepage'] : [],
          }))}
        />
      ) : (
        <div className="mr-admin-rows"><p className="mr-admin-empty">No projects yet. Add your first series.</p></div>
      )}
    </>
  )
}
