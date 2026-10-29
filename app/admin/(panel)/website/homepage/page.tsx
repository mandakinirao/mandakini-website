import Link from 'next/link'
import SortableGrid, { type GridCard } from '@/components/admin/SortableGrid'
import { IMAGE_PROJECTION, toPhoto } from '@/lib/admin/photos'
import { getAdminClient } from '@/lib/admin/sanity'
import HomepageForm from './HomepageForm'
import { reorderHomepage } from './actions'

interface Featured {
  _id: string
  title?: string
  image?: string
}

export default async function HomepageAdmin() {
  const data = await getAdminClient().fetch<{
    hero: { top?: { assetId?: string; url?: string; alt?: string }; bottom?: { assetId?: string; url?: string; alt?: string } } | null
    prints: Featured[]
    projects: Featured[]
    press: Featured[]
  }>(`{
    "hero": *[_id == "homepage"][0]{ "top": heroRevealTop${IMAGE_PROJECTION}, "bottom": heroRevealBottom${IMAGE_PROJECTION} },
    "prints": *[_type == "shopItem" && featuredOnHomepage == true] | order(coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 999) asc) { _id, title, "image": images[0].asset->url },
    "projects": *[_type == "project" && featuredOnHomepage == true] | order(coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 999) asc) { _id, "title": seriesName, "image": gallery[0].asset->url },
    "press": *[_type == "pressItem" && featuredOnHomepage == true] | order(coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 99) asc) { _id, "title": coalesce(headlineOverride, source, link), "image": thumbnailOverride.asset->url }
  }`)

  const cards = (items: Featured[], href: string): GridCard[] =>
    items.map((i) => ({
      id: i._id,
      href: `${href}/${encodeURIComponent(i._id)}`,
      title: i.title || 'Untitled',
      image: i.image ? `${i.image}?w=400&fit=max&auto=format` : '',
      lines: [],
      badges: [],
    }))

  const lists = [
    { title: 'Prints on the homepage', cap: 3, href: '/admin/shop', items: data.prints },
    { title: 'Projects on the homepage', cap: 4, href: '/admin/projects', items: data.projects },
    { title: 'Press on the homepage', cap: 8, href: '/admin/press', items: data.press },
  ]

  return (
    <>
      <Link href="/admin/website" className="mr-admin-back">← Website</Link>
      <div className="mr-admin-head">
        <h1>Homepage</h1>
      </div>

      <HomepageForm top={toPhoto(data.hero?.top)} bottom={toPhoto(data.hero?.bottom)} />

      {lists.map((l) => (
        <section key={l.title} className="mr-admin-panel" style={{ marginTop: 28 }}>
          <h2>{l.title}</h2>
          <p className="mr-admin-muted" style={{ marginTop: 0 }}>
            The homepage shows up to {l.cap}. Drag to change the order. To add or remove one, open it and use the
            “Show on homepage” switch.
          </p>
          {l.items.length ? (
            <SortableGrid cards={cards(l.items, l.href)} onReorder={reorderHomepage} savedText="Order saved. The homepage shows this order now." />
          ) : (
            <p className="mr-admin-empty">Nothing chosen. The first few are shown automatically.</p>
          )}
        </section>
      ))}
    </>
  )
}
