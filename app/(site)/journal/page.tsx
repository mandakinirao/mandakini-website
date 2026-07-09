import type { Metadata } from 'next'
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
  return (
    <>
      <PageWash className="journal-cream page-wash-light" />
      <JournalIndex posts={posts} />
    </>
  )
}
