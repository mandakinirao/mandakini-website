import type { Metadata } from 'next'
import Sidebar from '@/components/admin/Sidebar'
import { requireAdmin } from '@/lib/admin/auth'
import { getAdminClient } from '@/lib/admin/sanity'
import '../admin.css'

export const metadata: Metadata = {
  title: 'Your website | Mandakini Rao',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const toShip = await getAdminClient().fetch<number>(
    `count(*[_type == "order" && status == "paid"])`
  )

  return (
    <div className="mr-admin mr-admin-shell">
      <Sidebar toShip={toShip} />
      <main className="mr-admin-main">{children}</main>
    </div>
  )
}
