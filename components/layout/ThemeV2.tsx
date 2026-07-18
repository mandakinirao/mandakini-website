'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ThemeV2() {
  const pathname = usePathname()

  useEffect(() => {
    const isStudio = pathname.startsWith('/studio')
    document.body.classList.toggle('mr2-mode', !isStudio)
    document.body.classList.remove('mr2-light')
  }, [pathname])

  return null
}
