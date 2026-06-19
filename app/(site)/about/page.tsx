import type { Metadata } from 'next'
import AboutSection, { type AboutData } from '@/components/AboutSection'
import '@/styles/about.css'

export const metadata: Metadata = {
  title: 'About — Mandakini Rao',
  description: 'Painter, photographer and educator based in Hyderabad.',
}

export const revalidate = 60

export default async function AboutRoute() {
  const [{ client }, { aboutPageQuery }] = await Promise.all([
    import('@/sanity/lib/client'),
    import('@/sanity/lib/queries'),
  ])

  const data = await client.fetch<AboutData | null>(
    aboutPageQuery,
    {},
    { next: { revalidate: 60 } }
  )

  return <AboutSection data={data ?? {}} />
}
