import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JournalIndex from '@/components/journal/JournalIndex'
import PageWash from '@/components/ui/PageWash'
import { getAllJournalPosts } from '@/lib/journal'
import '@/styles/pages.css'
import '@/styles/journal.css'

export const metadata: Metadata = {
  title: 'Journal — Mandakini Rao',
  description: 'Notes from the studio — process, inspiration, and stories behind the work.',
}

export const revalidate = 60

export default async function JournalPage() {
  const posts = await getAllJournalPosts()
  // Nothing published yet — the nav/footer links are already hidden in
  // this case (see SiteLayout's hasJournalPosts() check); a direct visit
  // to the URL should behave the same as any other nonexistent route.
  if (posts.length === 0) notFound()

  return (
    <>
      <PageWash className="journal-cream page-wash-light" />
      <JournalIndex posts={posts} />
    </>
  )
}
