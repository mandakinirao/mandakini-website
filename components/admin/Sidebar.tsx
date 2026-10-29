'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/admin/(auth)/login/actions'

const ITEMS = [
  { href: '/admin', label: 'Home' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/shop', label: 'Shop' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/press', label: 'Press' },
  { href: '/admin/journal', label: 'Journal' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/website', label: 'Website' },
]

export default function Sidebar({ toShip, newMessages }: { toShip: number; newMessages: number }) {
  const counts: Record<string, { n: number; label: string }> = {
    '/admin/orders': { n: toShip, label: 'to ship' },
    '/admin/messages': { n: newMessages, label: 'new' },
  }
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <nav className="mr-admin-side" aria-label="Admin">
      <p className="mr-admin-side__name">Mandakini Rao</p>
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="mr-admin-side__link"
          aria-current={isActive(item.href) ? 'page' : undefined}
        >
          {item.label}
          {counts[item.href]?.n > 0 && (
            <span className="mr-admin-side__count" aria-label={`${counts[item.href].n} ${counts[item.href].label}`}>
              {counts[item.href].n}
            </span>
          )}
        </Link>
      ))}
      <div className="mr-admin-side__foot">
        <a href="/" target="_blank" rel="noreferrer" className="mr-admin-side__link">
          View the website ↗
        </a>
        <form action={logout}>
          <button type="submit" className="mr-admin-btn mr-admin-btn--quiet">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}
