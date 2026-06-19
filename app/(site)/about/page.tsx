import type { Metadata } from 'next'
import AboutSection, { type AboutData } from '@/components/AboutSection'
import '@/styles/about.css'

export const metadata: Metadata = {
  title: 'About — Mandakini Rao',
  description: 'Painter, photographer and educator based in Hyderabad.',
}

export const revalidate = 60

export default async function AboutRoute() {
  // Guard matches the pattern in lib/home-data.ts — avoids instantiating
  // the Sanity client when env vars are absent (e.g. during static generation).
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return <AboutSection data={{}} />
  }

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
