'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { JournalPost } from '@/lib/journal'
import { mandaGsap, revealImage, revealLines } from '@/lib/motion'
import JournalSection from './JournalSection'

interface JournalArticleProps {
  post: JournalPost
  prev: JournalPost
  next: JournalPost
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function JournalArticle({ post, prev, next }: JournalArticleProps) {
  const rootRef = useRef<HTMLElement>(null)
  const relatedPosts = [prev, next].filter(
    (related, i, arr) => related.slug !== post.slug && arr.findIndex((r) => r.slug === related.slug) === i
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-journal__kicker'))
      revealLines(root.querySelector('.mr-journal__header h1'), { delay: 0.1 })

      const cover = root.querySelector<HTMLElement>('.mr-journal__cover')
      if (cover) revealImage(cover, { delay: 0.2 })

      root.querySelectorAll<HTMLElement>('[data-journal-section]').forEach((section) => {
        revealLines(section.querySelector('.mr-journal__text'), { scrollTrigger: true })
        section.querySelectorAll<HTMLElement>('[data-reveal-img]').forEach((img, j) => {
          const mask = img.closest<HTMLElement>('.mr-mask')
          revealImage(mask, { scrollTrigger: true, delay: j * 0.1 })
        })
      })
    }, root)
    return () => ctx.revert()
  }, [post])

  return (
    <section ref={rootRef} className="mr-page" aria-label={post.title}>
      <Link href="/journal" className="mr-detail__back">
        ← All entries
      </Link>

      <header className="mr-journal__header">
        {post.kicker && <p className="mr-journal__kicker">{post.kicker}</p>}
        <h1>{post.title}</h1>
        <p className="mr-journal__date">{dateFormatter.format(new Date(post.publishedAt))}</p>
        {post.coverImage && (
          <span className="mr-journal__cover mr-mask">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              fill
              sizes="(max-width: 900px) 92vw, 900px"
              priority
              data-reveal-img
            />
          </span>
        )}
      </header>

      {post.body.map((section) => (
        <JournalSection key={section._key} section={section} />
      ))}

      {relatedPosts.length > 0 && (
        <nav className="mr-journal__more" aria-label="More journal entries">
          <p className="mr-journal__more-label">More from the Journal</p>
          <div className="mr-journal__more-grid">
            {relatedPosts.map((related) => (
              <Link key={related.slug} href={`/journal/${related.slug}`} className="mr-journal-card mr-journal-card--mini">
                <span className="mr-journal-card__frame mr-mask">
                  {related.coverImage && (
                    <Image src={related.coverImage.url} alt={related.coverImage.alt} fill sizes="(max-width: 800px) 92vw, 400px" />
                  )}
                </span>
                {related.kicker && <p className="mr-journal-card__kicker">{related.kicker}</p>}
                <h2 className="mr-journal-card__title">{related.title}</h2>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </section>
  )
}
