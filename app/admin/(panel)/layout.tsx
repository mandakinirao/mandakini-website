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
  const { toShip, newMessages } = await getAdminClient().fetch<{ toShip: number; newMessages: number }>(`{
    "toShip": count(*[_type == "order" && coalesce(status, "paid") == "paid"]),
    "newMessages": count(*[_type == "enquiry" && coalesce(status, "new") == "new"])
  }`)

  return (
    <div className="mr-admin mr-admin-shell">
      <Sidebar toShip={toShip} newMessages={newMessages} />
      <main className="mr-admin-main">{children}</main>
    </div>
  )
}
