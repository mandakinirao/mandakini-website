import type { Metadata } from 'next'
import AboutPage from '@/components/about/AboutPage'
import { getAboutData } from '@/lib/about-data'

export const metadata: Metadata = {
  title: 'About — Mandakini Rao',
  description: 'Painter, photographer and educator based in Hyderabad.',
}

export const revalidate = 60

export default async function AboutRoute() {
  const data = await getAboutData()
  return <AboutPage {...data} />
}
