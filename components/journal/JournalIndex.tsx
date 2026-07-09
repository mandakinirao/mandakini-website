'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import PillCta from '@/components/ui/PillCta'
import type { JournalPost } from '@/lib/journal'
import { mandaGsap, revealImage, revealLines } from '@/lib/motion'

export default function JournalIndex({ posts }: { posts: JournalPost[] }) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-page__head p'))
      revealLines(root.querySelector('.mr-page__head h1'), { delay: 0.1 })
      root.querySelectorAll<HTMLElement>('.mr-journal-card__frame').forEach((frame, i) =>
        revealImage(frame, { scrollTrigger: true, delay: (i % 2) * 0.1 })
      )
    }, root)
    return () => ctx.revert()
  }, [posts])

  if (posts.length === 0) {
    return (
      <section ref={rootRef} className="mr-page" aria-label="Journal">
        <header className="mr-page__head">
          <p>Journal</p>
          <h1>New entries are being written</h1>
        </header>
        <div className="mr-page__note">
          <p>Check back soon for notes from the studio.</p>
          <PillCta href="/">Back home</PillCta>
        </div>
      </section>
    )
  }

  return (
    <section ref={rootRef} className="mr-page" aria-label="Journal">
      <header className="mr-page__head">
        <p>Journal</p>
        <h1>Notes from the studio</h1>
      </header>

      <div className="mr-journal-grid">
        {posts.map((post, i) => (
          <article key={post._id} className={`mr-journal-card${i === 0 ? ' mr-journal-card--featured' : ''}`}>
            <Link href={`/journal/${post.slug}`}>
              <span className="mr-journal-card__frame mr-mask">
                {post.coverImage && (
                  <Image
                    src={post.coverImage.url}
                    alt={post.coverImage.alt}
                    fill
                    sizes={i === 0 ? '(max-width: 800px) 92vw, 1160px' : '(max-width: 800px) 92vw, 560px'}
                    priority={i === 0}
                  />
                )}
              </span>
              {post.kicker && <p className="mr-journal-card__kicker">{post.kicker}</p>}
              <h2 className="mr-journal-card__title">{post.title}</h2>
              <p className="mr-journal-card__excerpt">{post.excerpt}</p>
              <span className="mr-journal-card__cta">Read more →</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
