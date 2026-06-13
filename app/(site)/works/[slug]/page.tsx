import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SeriesDetail from '@/components/works/SeriesDetail'
import { getAllSeries, getSeriesBySlug } from '@/lib/home-data'

interface Params {
  params: { slug: string }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug)
  return {
    title: series ? `${series.name} — Mandakini Rao` : 'Project — Mandakini Rao',
    description: series?.desc,
  }
}

// ISR: static page, refreshed every 60s and on the Sanity publish webhook.
export const revalidate = 60

export default async function SeriesPage({ params }: Params) {
  const [series, all] = await Promise.all([
    getSeriesBySlug(params.slug),
    getAllSeries(),
  ])
  if (!series) notFound()

  const i = all.findIndex((s) => s.slug === series.slug)
  const prev = all[(i - 1 + all.length) % all.length]
  const next = all[(i + 1) % all.length]

  return <SeriesDetail series={series} prev={prev} next={next} />
}
