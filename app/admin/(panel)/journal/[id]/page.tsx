import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Photo } from '@/components/admin/PhotoDropzone'
import PostEditor from '@/components/admin/journal/PostEditor'
import type { PhotoDisplay, PhotoPosition } from '@/lib/admin/journal'
import { IMAGE_PROJECTION, toPhoto } from '@/lib/admin/photos'
import type { PTBlock } from '@/lib/admin/richtext'
import { getAdminClient } from '@/lib/admin/sanity'

interface RawPost {
  _id: string
  title?: string
  slug?: string
  kicker?: string
  excerpt?: string
  publishedAt?: string
  featured?: boolean
  cover?: { assetId?: string; url?: string; alt?: string }
  body?: {
    _key: string
    text?: PTBlock[]
    position?: PhotoPosition
    displayMode?: PhotoDisplay
    pullQuote?: boolean
    images?: { _key?: string; assetId?: string; url?: string; alt?: string; caption?: string }[]
  }[]
}

export default async function EditPost({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const p = await getAdminClient().fetch<RawPost | null>(
    `*[_type == "journalPost" && _id == $id][0]{
      _id, title, "slug": slug.current, kicker, excerpt, publishedAt, featured,
      "cover": coverImage${IMAGE_PROJECTION},
      body[]{ _key, text, position, displayMode, pullQuote, images[]{ _key, alt, caption, "assetId": asset._ref, "url": asset->url } }
    }`,
    { id }
  )
  if (!p) notFound()

  const date = p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) : ''

  return (
    <>
      <Link href="/admin/journal" className="mr-admin-back">← Journal</Link>
      <div className="mr-admin-head">
        <h1>{p.title || 'Untitled post'}</h1>
        {p.slug && <a href={`/journal/${p.slug}`} target="_blank" rel="noreferrer" className="mr-admin-btn">View on the site ↗</a>}
      </div>
      <PostEditor
        id={p._id}
        initial={{
          title: p.title ?? '',
          kicker: p.kicker ?? '',
          excerpt: p.excerpt ?? '',
          date,
          featured: Boolean(p.featured),
          cover: toPhoto(p.cover, p.title),
          paragraphs: (p.body ?? []).map((b) => ({
            key: b._key,
            text: b.text ?? [],
            position: b.position ?? 'right',
            displayMode: b.displayMode ?? 'collage',
            pullQuote: Boolean(b.pullQuote),
            photos: (b.images ?? []).flatMap((img): Photo[] => {
              const ph = toPhoto(img, p.title)
              return ph ? [{ ...ph, caption: img.caption ?? '' }] : []
            }),
          })),
        }}
      />
    </>
  )
}
