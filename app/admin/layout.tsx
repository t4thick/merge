import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminOrderNotifier } from '@/components/admin/AdminOrderNotifier'

export const metadata = { title: 'Admin' }
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <AdminOrderNotifier />
      <div className="admin-content">{children}</div>
    </div>
  )
}
