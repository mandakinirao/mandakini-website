import Link from 'next/link'
import { notFound } from 'next/navigation'
import PressForm from '@/components/admin/PressForm'
import { IMAGE_PROJECTION, toPhoto } from '@/lib/admin/photos'
import { getAdminClient } from '@/lib/admin/sanity'

export default async function EditPress({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const p = await getAdminClient().fetch<{
    _id: string
    link?: string
    type?: string
    headline?: string
    source?: string
    logoCard?: boolean
    home?: boolean
    thumb?: { assetId?: string; url?: string; alt?: string }
  } | null>(
    `*[_type == "pressItem" && _id == $id][0]{ _id, link, type, "headline": headlineOverride, source, logoCard, "home": featuredOnHomepage, "thumb": thumbnailOverride${IMAGE_PROJECTION} }`,
    { id }
  )
  if (!p) notFound()
  const type = p.type === 'video' || p.type === 'podcast' ? p.type : 'article'
  return (
    <>
      <Link href="/admin/press" className="mr-admin-back">← Press</Link>
      <div className="mr-admin-head"><h1>{p.headline || p.source || 'Press item'}</h1></div>
      <PressForm
        id={p._id}
        initial={{
          link: p.link ?? '',
          type,
          headline: p.headline ?? '',
          source: p.source ?? '',
          thumbnail: toPhoto(p.thumb, p.headline),
          logoCard: Boolean(p.logoCard),
          showOnHomepage: Boolean(p.home),
        }}
      />
    </>
  )
}
