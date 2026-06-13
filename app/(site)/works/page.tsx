import type { Metadata } from 'next'
import WorksIndex from '@/components/works/WorksIndex'
import { getAllSeries, getFeaturedSeries } from '@/lib/home-data'

export const metadata: Metadata = {
  title: 'Projects — Mandakini Rao',
  description: 'Bodies of work by Mandakini Rao — series of paintings and photographs from the Hyderabad studio.',
}

// ISR: static page, refreshed every 60s and on the Sanity publish webhook.
export const revalidate = 60

export default async function WorksPage() {
  const [series, featured] = await Promise.all([
    getAllSeries(),
    getFeaturedSeries(),
  ])
  return <WorksIndex series={series} featured={featured} />
}
