'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ScrollTrigger, lockScroll, unlockScroll } from '@/lib/motion'

const menuLinks = [
  { label: 'Home', href: '/' },
  { label: 'Works / Projects', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const THEME_KEY = 'mr2-theme'

export default function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [light, setLight] = useState(false)

  useEffect(() => {
    setLight(localStorage.getItem(THEME_KEY) === 'light')
  }, [])

  const toggleTheme = () => {
    const next = !light
    setLight(next)
    document.body.classList.toggle('mr2-light', next)
    localStorage.setItem(THEME_KEY, next ? 'light' : 'dark')
  }

  // The menu can never survive a navigation (covers back/forward too —
  // link clicks also close it directly for same-route navigations).
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Cream over the hero, ink once past it. Re-evaluated per route: the
  // trigger element belongs to the page, so a mount-once trigger would
  // go stale (or point at a removed node) after client-side navigation.
  useEffect(() => {
    if (!document.querySelector('.mr-hero')) {
      setScrolled(true)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: '.mr-hero',
      start: 'bottom 30%',
      end: 'max',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })

    setScrolled(window.scrollY > window.innerHeight * 1.5)

    return () => {
      trigger.kill()
    }
  }, [pathname])

  // Lenis-safe lock: body overflow alone doesn't stop the smooth-scroll
  // instance — lockScroll stops Lenis and the document together.
  useEffect(() => {
    if (!menuOpen) return
    lockScroll()
    return () => unlockScroll()
  }, [menuOpen])

  return (
    <>
      <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`} aria-label="Primary navigation">
        <Link href="/" className="site-logo" onClick={() => setMenuOpen(false)}>
          <span>Mandakini</span>
          <span>Rao</span>
        </Link>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'menu-toggle--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`menu-overlay canvas-texture ${menuOpen ? 'menu-overlay--open' : ''}`} aria-hidden={!menuOpen}>
        <div className="menu-overlay__inner">
          <p>Studio Directory</p>
          <div className="menu-overlay__links">
            {menuLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="menu-overlay__theme"
            onClick={toggleTheme}
            aria-pressed={light}
          >
            <span className="menu-overlay__theme-dot" aria-hidden="true" />
            {light ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>
    </>
  )
}
