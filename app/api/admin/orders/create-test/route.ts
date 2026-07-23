import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { assertSameOrigin } from '@/lib/security/same-origin'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Creates a fake US shipping order so staff can practice the Print label flow.
 * Does not charge Stripe. Buying a label in Shippo still charges postage.
 */
export async function POST(req: NextRequest) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const baseOrder = {
      customer_name: 'TEST Label Practice',
      customer_email: 'test-label@kintampoafricanmarket.com',
      customer_phone: '6143778297',
      // Real-format Chicago address so Shippo/USPS can quote/validate.
      address_line: '233 S Wacker Dr',
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      postal_code: '60606',
      subtotal_amount: 24.99,
      shipping_fee: 9.99,
      tax_amount: 0,
      shipping_method: 'standard',
      shipping_zone: 'zone_4',
      total_amount: 34.98,
      status: 'ordered',
      ordered_at: new Date().toISOString(),
      payment_method: 'manual',
    }

    let { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(baseOrder)
      .select('id, order_number')
      .single()

    // Retry without optional columns if an older schema is missing them.
    if (
      orderError &&
      /column .* does not exist|could not find the .* column/i.test(orderError.message)
    ) {
      ;({ data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_name: baseOrder.customer_name,
          customer_email: baseOrder.customer_email,
          customer_phone: baseOrder.customer_phone,
          address_line: baseOrder.address_line,
          city: baseOrder.city,
          state: baseOrder.state,
          country: baseOrder.country,
          postal_code: baseOrder.postal_code,
          total_amount: baseOrder.total_amount,
          status: 'ordered',
          payment_method: 'manual',
          shipping_method: 'standard',
        })
        .select('id, order_number')
        .single())
    }

    if (orderError || !order) {
      console.error('[create-test-order]', orderError?.message)
      return NextResponse.json(
        { error: orderError?.message ?? 'Could not create test order.' },
        { status: 500 }
      )
    }

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert({
      order_id: order.id,
      product_name: `TEST shipping sample (${stamp})`,
      product_price: 24.99,
      quantity: 1,
      subtotal: 24.99,
    })

    if (itemsError) {
      // Clean up orphan order if items fail
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    await supabaseAdmin.from('order_status_logs').insert({
      order_id: order.id,
      from_status: null,
      to_status: 'ordered',
      changed_by: 'admin',
      note: 'Admin-created TEST order for label practice — not a real customer payment',
    })

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number ?? null,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Server error.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
