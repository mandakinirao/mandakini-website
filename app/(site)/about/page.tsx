import type { Metadata } from 'next'
import AboutSection, { type AboutData } from '@/components/AboutSection'
import '@/styles/about.css'

export const metadata: Metadata = {
  title: 'About — Mandakini Rao',
  description: 'Painter, photographer and educator based in Hyderabad.',
}

export const revalidate = 60

export default async function AboutRoute() {
  let data: AboutData | null = null
  try {
    const [{ client }, { aboutPageQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/queries'),
    ])
    data = await client.fetch<AboutData | null>(aboutPageQuery)
  } catch {}

  if (!data) {
    return (
      <section className="mr2-page-shell">
        <p>About — coming soon</p>
      </section>
    )
  }

  return <AboutSection data={data} />
}
