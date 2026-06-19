import type { Metadata } from 'next'
import CanvasCards from '@/components/home/v2/CanvasCards'
import { urlForImage } from '@/sanity/lib/image'
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

  const data = await client.fetch<{
    aboutBlockBio?: string
    aboutBlockPortrait?: { asset?: { _ref?: string }; alt?: string; [key: string]: unknown }
  } | null>(aboutPageQuery, {}, { next: { revalidate: 60 } })

  const portraitUrl = data?.aboutBlockPortrait
    ? urlForImage(data.aboutBlockPortrait as Parameters<typeof urlForImage>[0])
        .width(900)
        .height(1200)
        .fit('crop')
        .url()
    : '/art/about-portrait.jpg'

  return (
    <CanvasCards
      bio={data?.aboutBlockBio ?? ''}
      portrait={portraitUrl}
      ctaHref="/contact"
      ctaLabel="Say hello"
    />
  )
}
