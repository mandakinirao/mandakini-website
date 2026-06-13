'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/**
 * V2 is the site theme everywhere — home, works, shop, all of it —
 * honouring the saved dark/light choice. The only exception is the
 * retired V1 reference at /?v=1.
 */
export default function ThemeV2() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    const isV1 = pathname === '/' && search.get('v') === '1'
    const light = localStorage.getItem('mr2-theme') === 'light'
    document.body.classList.toggle('mr2-mode', !isV1)
    document.body.classList.toggle('mr2-light', !isV1 && light)
  }, [pathname, search])

  return null
}
