import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { assertSameOrigin } from '@/lib/security/same-origin'
import { normalizeOrderStatus, ORDER_STATUS_TIMESTAMP_COLUMN } from '@/lib/order-status'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const ids: string[] = Array.isArray(body.ids) ? body.ids.slice(0, 100) : []
    const status = typeof body.status === 'string' ? normalizeOrderStatus(body.status) : null

    if (!ids.length || !status) {
      return NextResponse.json({ error: 'ids and status are required.' }, { status: 400 })
    }

    // Fetch current statuses before updating so audit log has from_status
    const { data: currentOrders } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .in('id', ids)

    const fromStatusMap = new Map(
      (currentOrders ?? []).map((o) => [o.id, normalizeOrderStatus(o.status)])
    )

    const nowIso = new Date().toISOString()
    const updatePayload: Record<string, unknown> = { status }
    updatePayload[ORDER_STATUS_TIMESTAMP_COLUMN[status]] = nowIso

    const { error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .in('id', ids)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Log each status change with correct from_status
    await supabaseAdmin.from('order_status_logs').insert(
      ids.map((id) => ({
        order_id: id,
        from_status: fromStatusMap.get(id) ?? null,
        to_status: status,
        changed_by: 'admin-bulk',
        note: `Bulk update to ${status}`,
      }))
    )

    return NextResponse.json({ ok: true, updated: ids.length })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
