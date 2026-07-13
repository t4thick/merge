import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { normalizeOrderStatus, ORDER_STATUS_TIMESTAMP_COLUMN } from '@/lib/order-status'
import { assertSameOrigin } from '@/lib/security/same-origin'
import { sendOrderStatusEmail } from '@/lib/email/send-order-emails'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = await req.json()
    const { status, trackingNumber } = body
    // Cap note length to prevent oversized payloads from reaching the DB.
    const noteRaw = typeof body.note === 'string' ? body.note.slice(0, 500) : ''
    const note = noteRaw
    const normalized = normalizeOrderStatus(status)
    const nowIso = new Date().toISOString()

    const { data: existingOrder, error: existingError } = await supabaseAdmin
      .from('orders')
      .select('status, order_number, customer_name, customer_email, total_amount, shipping_method')
      .eq('id', id)
      .single()

    if (existingError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    const fromStatus = normalizeOrderStatus(existingOrder.status)
    const updatePayload: Record<string, unknown> = {
      status: normalized,
      tracking_number:
        typeof trackingNumber === 'string' && trackingNumber.trim()
          ? trackingNumber.trim()
          : null,
    }
    updatePayload[ORDER_STATUS_TIMESTAMP_COLUMN[normalized]] = nowIso

    let updateResult = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (
      updateResult.error &&
      (/column .* does not exist/i.test(updateResult.error.message) ||
        /could not find the .* column/i.test(updateResult.error.message))
    ) {
      updateResult = await supabaseAdmin
        .from('orders')
        .update({ status: normalized })
        .eq('id', id)
        .select()
        .single()
    }

    if (updateResult.error) return NextResponse.json({ error: updateResult.error.message }, { status: 500 })

    const trackingNote = updatePayload.tracking_number ? `Tracking: ${String(updatePayload.tracking_number)}` : null
    const combinedNote = [typeof note === 'string' ? note.trim() : '', trackingNote].filter(Boolean).join(' · ') || null

    if (fromStatus !== normalized || combinedNote) {
      const { error: logError } = await supabaseAdmin
        .from('order_status_logs')
        .insert({
          order_id: id,
          from_status: fromStatus,
          to_status: normalized,
          changed_by: 'admin',
          note: combinedNote,
        })

      if (
        logError &&
        !/relation .* does not exist|could not find the table|column .* does not exist|could not find the .* column/i.test(
          logError.message
        )
      ) {
        console.error('Status log insert warning:', logError)
      }
    }

    // Notify the customer when the status actually changed. We intentionally do
    // NOT notify when admin only updates a tracking number or note on the same
    // status — that would spam customers with duplicate updates.
    if (fromStatus !== normalized && existingOrder.customer_email) {
      try {
        await sendOrderStatusEmail(
          {
            id,
            order_number: existingOrder.order_number ?? null,
            customer_name: existingOrder.customer_name ?? 'there',
            customer_email: existingOrder.customer_email,
            total_amount: Number(existingOrder.total_amount ?? 0),
            tracking_number: updatePayload.tracking_number
              ? String(updatePayload.tracking_number)
              : null,
            shipping_method: existingOrder.shipping_method ?? null,
          },
          normalized,
          typeof note === 'string' && note.trim() ? note.trim() : null,
        )
      } catch (emailErr) {
        console.error('[admin/orders PATCH] status email failed:', emailErr)
      }
    }

    return NextResponse.json(updateResult.data)
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
