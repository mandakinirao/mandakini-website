'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/admin/(auth)/login/actions'

const ITEMS = [
  { href: '/admin', label: 'Home' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/shop', label: 'Shop' },
]

export default function Sidebar({ toShip }: { toShip: number }) {
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
          {item.href === '/admin/orders' && toShip > 0 && (
            <span className="mr-admin-side__count" aria-label={`${toShip} to ship`}>
              {toShip}
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
