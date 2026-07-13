import Link from 'next/link'
import { Download, Search } from 'lucide-react'
import { DateTime } from 'luxon'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  normalizeOrderStatus,
  type OrderStatus,
} from '@/lib/order-status'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseOrderRef } from '@/lib/orders/order-number'
import { getReportTimeZone } from '@/lib/admin/revenue-stats'
import { BulkOrdersTable } from '@/components/admin/BulkOrdersTable'
import { Pagination } from '@/components/admin/Pagination'

const STATUS_PILL_COLORS: Record<OrderStatus, string> = {
  ordered: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  ready_for_pickup: 'bg-teal-50 text-teal-700',
  shipped: 'bg-violet-50 text-violet-700',
  out_for_delivery: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
}

const PAGE_SIZE = 50

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; when?: string; page?: string }>
}) {
  await requireAdminPage()
  const { status: rawStatus, q, when, page: pageParam } = await searchParams
  const activeStatus = rawStatus ? normalizeOrderStatus(rawStatus) : undefined
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const zone = getReportTimeZone()
  const now = DateTime.now().setZone(zone)
  const todayStart = now.startOf('day')
  let whenStart: DateTime | null = null
  let whenEnd: DateTime | null = null
  if (when === 'today') {
    whenStart = todayStart
    whenEnd = todayStart.plus({ days: 1 })
  } else if (when === 'yesterday') {
    whenStart = todayStart.minus({ days: 1 })
    whenEnd = todayStart
  } else if (when === '7d') {
    whenStart = todayStart.minus({ days: 6 })
    whenEnd = todayStart.plus({ days: 1 })
  }

  let query = supabaseAdmin
    .from('orders')
    .select('id, order_number, customer_name, customer_email, city, total_amount, status, created_at, shipping_method')
    .order('created_at', { ascending: false })

  if (whenStart && whenEnd) {
    query = query
      .gte('created_at', whenStart.toUTC().toISO()!)
      .lt('created_at', whenEnd.toUTC().toISO()!)
  }
  if (q?.trim()) {
    const term = q.trim()
    const ref = parseOrderRef(term)
    if (ref?.type === 'number') {
      query = query.or(`customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,order_number.eq.${ref.value}`)
    } else if (ref?.type === 'uuid') {
      query = query.or(`customer_name.ilike.%${term}%,customer_email.ilike.%${term}%,id.eq.${ref.value}`)
    } else {
      query = query.or(`customer_name.ilike.%${term}%,customer_email.ilike.%${term}%`)
    }
  }
  const { data: orders } = await query

  const filtered = activeStatus
    ? (orders ?? []).filter((o) => normalizeOrderStatus(o.status) === activeStatus)
    : (orders ?? [])

  const filteredRevenue = filtered.reduce((s, o) => s + Number(o.total_amount ?? 0), 0)
  const counts = ORDER_STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = (orders ?? []).filter((o) => normalizeOrderStatus(o.status) === status).length
    return acc
  }, {})

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function buildPageHref(p: number) {
    const sp = new URLSearchParams()
    if (activeStatus) sp.set('status', activeStatus)
    if (q) sp.set('q', q)
    if (when) sp.set('when', when)
    if (p > 1) sp.set('page', String(p))
    return `/admin/orders${sp.toString() ? `?${sp.toString()}` : ''}`
  }

  const exportHref =
    when === 'today' ? '/api/admin/orders/export?range=today'
    : when === 'yesterday' ? '/api/admin/orders/export?range=yesterday'
    : when === '7d' ? '/api/admin/orders/export?range=7d'
    : '/api/admin/orders/export?range=all'

  const whenOptions: Array<{ id: 'today' | 'yesterday' | '7d' | undefined; label: string }> = [
    { id: undefined, label: 'Any time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 days' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="mt-1 text-sm text-earth-500">
            {filtered.length} shown · {orders?.length ?? 0} total · ${filteredRevenue.toFixed(2)} gross in view
          </p>
        </div>
        <Link href={exportHref} className="no-underline">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {whenOptions.map((opt) => {
          const active = (opt.id ?? '') === (when ?? '')
          const sp = new URLSearchParams()
          if (opt.id) sp.set('when', opt.id)
          if (q) sp.set('q', q)
          if (activeStatus) sp.set('status', activeStatus)
          const href = `/admin/orders${sp.toString() ? `?${sp.toString()}` : ''}`
          return (
            <Link key={opt.id ?? 'any'} href={href}
              className={`admin-status-pill no-underline ${active ? 'bg-earth-900 text-white' : 'bg-white text-earth-700 ring-1 ring-earth-200 hover:bg-earth-50'}`}
            >
              {opt.label}
            </Link>
          )
        })}
      </div>

      <form method="GET" className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-earth-400" aria-hidden />
          <Input type="search" name="q" defaultValue={q ?? ''} placeholder="Search by name, email, or LQ-1042" className="pl-10" />
        </div>
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        {when && <input type="hidden" name="when" value={when} />}
        <Button type="submit" size="sm">Search</Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {(() => {
          const sp = new URLSearchParams()
          if (q) sp.set('q', q)
          if (when) sp.set('when', when)
          const allHref = `/admin/orders${sp.toString() ? `?${sp.toString()}` : ''}`
          return (
            <Link href={allHref}
              className={`admin-status-pill no-underline ${!activeStatus ? 'bg-earth-900 text-white' : 'bg-white text-earth-700 ring-1 ring-earth-200 hover:bg-earth-50'}`}
            >
              All ({orders?.length ?? 0})
            </Link>
          )
        })()}
        {ORDER_STATUSES.map((status) => {
          const sp = new URLSearchParams()
          sp.set('status', status)
          if (q) sp.set('q', q)
          if (when) sp.set('when', when)
          const href = `/admin/orders?${sp.toString()}`
          const isActive = activeStatus === status
          return (
            <Link key={status} href={href}
              className={`admin-status-pill no-underline ${isActive ? 'bg-earth-900 text-white' : `${STATUS_PILL_COLORS[status]} hover:opacity-80`}`}
            >
              {ORDER_STATUS_LABEL[status]} ({counts[status] ?? 0})
            </Link>
          )
        })}
      </div>

      {paginated.length === 0 ? (
        <div className="admin-card text-center">
          <p className="text-sm text-earth-600">No orders in this view.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <BulkOrdersTable orders={paginated} />
          <Pagination page={safePage} totalPages={totalPages} buildHref={buildPageHref} />
        </div>
      )}
    </div>
  )
}
