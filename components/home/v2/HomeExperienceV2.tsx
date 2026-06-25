'use client'

import { useEffect, useRef, useState } from 'react'
import EditionShop from '@/components/home/v2/EditionShop'
import PrivateCollection from '@/components/shop/PrivateCollection'
import HeroScene, { type HeroSceneHandle } from '@/components/home/v2/HeroScene'
import LoadingScreenStripes from '@/components/home/v2/LoadingScreenStripes'
import MarqueePress from '@/components/home/v2/MarqueePress'
import Testimonials from '@/components/Testimonials'
import RisingSunWorks from '@/components/home/v2/RisingSunWorks'
import StripeBand from '@/components/home/v2/StripeBand'
import type { HomeData } from '@/lib/home-data'
import { ScrollTrigger, unlockScroll } from '@/lib/motion'

export default function HomeExperienceV2(props: HomeData) {
  const { series, prints, press, testimonials, tagline } = props
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
    document.documentElement.classList.add('mr-intro-seen')
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
      <div className="mr2-home__content">
        <StripeBand />
        <RisingSunWorks series={series} />
        <EditionShop prints={prints} />
        <PrivateCollection />
        <Testimonials items={testimonials} />
        <MarqueePress items={press} />
      </div>
    </div>
  )
}
