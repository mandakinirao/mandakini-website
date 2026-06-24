'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ThemeV2() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    const isV1 = pathname === '/' && search.get('v') === '1'
    const isStudio = pathname.startsWith('/studio')
    document.body.classList.toggle('mr2-mode', !isV1 && !isStudio)
    document.body.classList.remove('mr2-light')
  }, [pathname, search])

  return null
}
