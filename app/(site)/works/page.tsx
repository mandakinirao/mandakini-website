import type { Metadata } from 'next'
import WorksIndex from '@/components/works/WorksIndex'
import PageWash from '@/components/ui/PageWash'
import { getAllSeries, getFeaturedSeries } from '@/lib/home-data'
import { getSiteSettings } from '@/lib/site-settings'
import '@/styles/pages.css'

export const metadata: Metadata = {
  title: 'Projects — Mandakini Rao',
  description: 'Bodies of work by Mandakini Rao — series of paintings and photographs from the Hyderabad studio.',
}

export const revalidate = 60

export default async function WorksPage() {
  const [series, featured, settings] = await Promise.all([
    getAllSeries(),
    getFeaturedSeries(),
    getSiteSettings(),
  ])
  return (
    <>
      <PageWash className="works-amber page-wash-light" />
      <WorksIndex
        series={series}
        featured={featured}
        headline={settings.worksPageHeadline}
        emptyHeadline={settings.worksEmptyHeadline}
        emptyBody={settings.worksEmptyBody}
      />
    </>
  )
}
