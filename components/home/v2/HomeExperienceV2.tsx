'use client'

import { useEffect, useRef, useState } from 'react'
import CanvasCards from '@/components/home/v2/CanvasCards'
import ContactStage from '@/components/home/v2/ContactStage'
import EditionShop from '@/components/home/v2/EditionShop'
import HeroScene, { type HeroSceneHandle } from '@/components/home/v2/HeroScene'
import LoadingScreenStripes from '@/components/home/v2/LoadingScreenStripes'
import MarqueePress from '@/components/home/v2/MarqueePress'
import RisingSunWorks from '@/components/home/v2/RisingSunWorks'
import StripeBand from '@/components/home/v2/StripeBand'
import type { HomeData } from '@/lib/home-data'
import { ScrollTrigger, unlockScroll } from '@/lib/motion'

export default function HomeExperienceV2({
  series,
  prints,
  press,
  testimonials,
  tagline,
  aboutBio,
  aboutPortrait,
}: HomeData) {
  const heroRef = useRef<HeroSceneHandle>(null)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('mr2-intro-seen')) {
      setShowLoader(false)
      unlockScroll()
      heroRef.current?.playEntrance()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleComplete = () => {
    setShowLoader(false)
    unlockScroll()
    heroRef.current?.playEntrance()
    ScrollTrigger.refresh()
  }

  return (
    <div className="mr2-home">
      {showLoader && (
        <LoadingScreenStripes onComplete={handleComplete} tagline={tagline} />
      )}
      <HeroScene ref={heroRef} tagline={tagline} />
      <CanvasCards portrait={aboutPortrait} bio={aboutBio} />
      <StripeBand />
      <RisingSunWorks series={series} />
      <EditionShop prints={prints} />
      <ContactStage />
      <MarqueePress items={press} testimonials={testimonials} />
    </div>
  )
}
