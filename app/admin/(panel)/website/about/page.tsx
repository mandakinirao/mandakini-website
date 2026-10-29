import Link from 'next/link'
import { IMAGE_PROJECTION, toPhoto } from '@/lib/admin/photos'
import { getAdminClient } from '@/lib/admin/sanity'
import AboutForm from './AboutForm'

export default async function AboutAdmin() {
  const d = await getAdminClient().fetch<{
    portrait?: { assetId?: string; url?: string; alt?: string }
    bio?: string
    homeSnippet?: string
    teaserLine?: string
  } | null>(`*[_type == "aboutPage"][0]{
    "portrait": aboutBlockPortrait${IMAGE_PROJECTION},
    "bio": aboutBlockBio,
    homeSnippet,
    "teaserLine": aboutTeaserLine
  }`)

  return (
    <>
      <Link href="/admin/website" className="mr-admin-back">← Website</Link>
      <div className="mr-admin-head">
        <h1>About</h1>
        <a href="/about" target="_blank" rel="noreferrer" className="mr-admin-btn">View the About page ↗</a>
      </div>
      <AboutForm
        initial={{
          portrait: toPhoto(d?.portrait, 'Portrait'),
          bio: d?.bio ?? '',
          homeSnippet: d?.homeSnippet ?? '',
          teaserLine: d?.teaserLine ?? '',
        }}
      />
    </>
  )
}
