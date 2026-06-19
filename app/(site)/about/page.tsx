import type { Metadata } from 'next'
import AboutHero from '@/components/about/AboutHero'
import AboutEdgeWords from '@/components/about/AboutEdgeWords'
import CanvasCards from '@/components/home/v2/CanvasCards'
import { urlForImage } from '@/sanity/lib/image'
import '@/styles/about.css'
import type { AboutData } from '@/components/AboutSection'

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

  // Resolve portrait URL for the amber panel (Section 3) server-side
  const portraitUrl = data?.aboutBlockPortrait
    ? urlForImage(data.aboutBlockPortrait).width(900).height(1200).fit('crop').url()
    : '/art/about-portrait.jpg'

  return (
    <>
      {/* Section 1 — Flanking arch hero */}
      <AboutHero
        leadIn={data?.heroLeadIn}
        displayWord={data?.heroDisplayWord}
        subhead={data?.heroSubhead}
        leftImage={data?.heroLeftImage}
        rightImage={data?.heroRightImage}
      />

      {/* Section 2 — Edge-word scroll layer */}
      <AboutEdgeWords
        bodyParagraph={data?.bodyParagraph}
        edgeWords={data?.edgeWords}
        seriesTitles={data?.seriesTitles}
        colophon={data?.colophon}
      />

      {/* Section 3 — Amber panel (CanvasCards reuse; CTA points to contact) */}
      <CanvasCards
        bio={data?.aboutBlockBio ?? ''}
        portrait={portraitUrl}
        ctaHref="/contact"
        ctaLabel="Say hello"
      />
    </>
  )
}
