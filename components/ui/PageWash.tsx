'use client'
import { useEffect } from 'react'

export default function PageWash({ className }: { className: string }) {
  useEffect(() => {
    const tokens = className.split(' ').filter(Boolean)
    document.body.classList.add(...tokens)
    return () => document.body.classList.remove(...tokens)
  }, [className])
  return null
}
