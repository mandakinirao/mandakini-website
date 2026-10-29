import Link from 'next/link'
import { formatDate } from '@/lib/admin/format'
import { getAdminClient } from '@/lib/admin/sanity'

export default async function JournalAdmin() {
  const posts = await getAdminClient().fetch<{ _id: string; title?: string; publishedAt?: string; featured?: boolean; image?: string }[]>(
    `*[_type == "journalPost"] | order(coalesce(publishedAt, _createdAt) desc) { _id, title, publishedAt, featured, "image": coverImage.asset->url }`
  )
  return (
    <>
      <div className="mr-admin-head">
        <div>
          <h1>Journal</h1>
          <p className="mr-admin-muted" style={{ margin: '6px 0 0' }}>Your posts, newest first.</p>
        </div>
        <Link href="/admin/journal/new" className="mr-admin-btn mr-admin-btn--primary">+ Write a post</Link>
      </div>
      {posts.length ? (
        <div className="mr-admin-grid">
          {posts.map((p) => (
            <Link key={p._id} href={`/admin/journal/${encodeURIComponent(p._id)}`} className="mr-admin-card">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${p.image}?w=600&fit=max&auto=format`} alt="" className="mr-admin-card__img" />
              ) : (
                <div className="mr-admin-card__img" />
              )}
              <div className="mr-admin-card__body">
                <strong>{p.title || 'Untitled post'}</strong>
                <span className="mr-admin-muted">{formatDate(p.publishedAt)}</span>
                {p.featured && (
                  <div className="mr-admin-card__badges"><span className="mr-admin-badge">Featured</span></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mr-admin-rows"><p className="mr-admin-empty">No posts yet. Write your first one.</p></div>
      )}
    </>
  )
}
