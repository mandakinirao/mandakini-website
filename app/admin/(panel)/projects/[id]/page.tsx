import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/ProjectForm'
import { IMAGE_PROJECTION, toPhoto } from '@/lib/admin/photos'
import { getAdminClient } from '@/lib/admin/sanity'
import type { Photo } from '@/components/admin/PhotoDropzone'

export default async function EditProject({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const p = await getAdminClient().fetch<{
    _id: string
    name?: string
    slug?: string
    year?: string
    description?: string
    home?: boolean
    gallery?: { _key?: string; assetId?: string; url?: string; alt?: string }[]
  } | null>(
    `*[_type == "project" && _id == $id][0]{ _id, "name": seriesName, "slug": slug.current, year, description, "home": featuredOnHomepage, "gallery": gallery[]${IMAGE_PROJECTION} }`,
    { id }
  )
  if (!p) notFound()
  return (
    <>
      <Link href="/admin/projects" className="mr-admin-back">← Projects</Link>
      <div className="mr-admin-head">
        <h1>{p.name || 'Untitled project'}</h1>
        {p.slug && <a href={`/works/${p.slug}`} target="_blank" rel="noreferrer" className="mr-admin-btn">View on the site ↗</a>}
      </div>
      <ProjectForm
        id={p._id}
        initial={{
          name: p.name ?? '',
          year: p.year ?? '',
          description: p.description ?? '',
          showOnHomepage: Boolean(p.home),
          photos: (p.gallery ?? []).map((g) => toPhoto(g, p.name)).filter((x): x is Photo => Boolean(x)),
        }}
      />
    </>
  )
}
