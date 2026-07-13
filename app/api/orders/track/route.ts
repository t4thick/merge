import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { normalizeOrderStatus } from '@/lib/order-status'
import { parseOrderRef } from '@/lib/orders/order-number'
import { normalizeGuestEmail } from '@/lib/orders/guest-checkout'

export async function GET(req: NextRequest) {
  const idRaw = req.nextUrl.searchParams.get('id')?.trim()
  const emailRaw = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let order: Record<string, unknown> | null = null

  if (!user) {
    const email = normalizeGuestEmail(emailRaw)
    const ref = parseOrderRef(idRaw)
    if (!ref || !email) {
      return NextResponse.json(
        { error: 'Enter your order number and the email used at checkout.' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin.from('orders').select('*').ilike('customer_email', email)
    query = ref.type === 'uuid' ? query.eq('id', ref.value) : query.eq('order_number', ref.value)
    const { data, error: orderError } = await query.maybeSingle()
    if (orderError || !data) {
      return NextResponse.json({ error: 'Order not found. Check your order number and email.' }, { status: 404 })
    }
    order = data
  } else if (emailRaw && !idRaw) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .ilike('customer_email', emailRaw)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    order = data
    if (!order) {
      return NextResponse.json(
        { error: 'No orders found for that email address on your account.' },
        { status: 404 }
      )
    }
  } else {
    const ref = parseOrderRef(idRaw)
    if (!ref) {
      return NextResponse.json(
        { error: 'Enter your order number (e.g. LQ-1042) or order ID.' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin.from('orders').select('*').eq('user_id', user.id)
    query = ref.type === 'uuid' ? query.eq('id', ref.value) : query.eq('order_number', ref.value)
    const { data, error: orderError } = await query.maybeSingle()
    if (orderError || !data) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }
    order = data
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }

  const [{ data: items }, logsResult] = await Promise.all([
    supabaseAdmin
      .from('order_items')
      .select('id,product_name,product_price,quantity,subtotal')
      .eq('order_id', order.id),
    supabaseAdmin
      .from('order_status_logs')
      .select('id,from_status,to_status,changed_at,changed_by,note')
      .eq('order_id', order.id)
      .order('changed_at', { ascending: true }),
  ])

  const missingTable =
    !!logsResult.error &&
    (logsResult.error.code === 'PGRST205' || logsResult.error.code === '42P01')

  if (logsResult.error && !missingTable) {
    console.warn('[orders/track] logs query:', logsResult.error.message)
  }

  const logs = missingTable ? [] : (logsResult.data ?? [])

  return NextResponse.json({
    order: { ...order, status: normalizeOrderStatus(order.status as string) },
    items: items ?? [],
    logs,
  })
}
