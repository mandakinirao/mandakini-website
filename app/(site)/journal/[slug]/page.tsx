import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JournalArticle from '@/components/journal/JournalArticle'
import PageWash from '@/components/ui/PageWash'
import { getAllJournalPosts, getJournalPostBySlug } from '@/lib/journal'
import '@/styles/pages.css'
import '@/styles/journal.css'

interface Params {
  params: { slug: string }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getJournalPostBySlug(params.slug)
  return {
    title: post ? `${post.title} — Mandakini Rao` : 'Journal — Mandakini Rao',
    description: post?.excerpt,
  }
}

export const revalidate = 60

export default async function JournalPostPage({ params }: Params) {
  const [post, all] = await Promise.all([
    getJournalPostBySlug(params.slug),
    getAllJournalPosts(),
  ])
  if (!post) notFound()

  const i = all.findIndex((p) => p.slug === post.slug)
  const prev = all[(i - 1 + all.length) % all.length]
  const next = all[(i + 1) % all.length]

  return (
    <>
      <PageWash className="journal-deepsea page-wash-dark" />
      <JournalArticle post={post} prev={prev} next={next} />
    </>
  )
}
