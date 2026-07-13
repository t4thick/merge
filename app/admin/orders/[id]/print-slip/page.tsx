import { notFound } from 'next/navigation'
import { PrintSlipActions } from '@/components/admin/PrintSlipActions'
import { PrintSlipDocument } from '@/components/admin/PrintSlipDocument'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { supabaseAdmin } from '@/lib/supabase-admin'
import './print-slip.css'

export default async function AdminOrderPrintSlipPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ print?: string }>
}) {
  await requireAdminPage()
  const { id } = await params
  const { print } = await searchParams

  const [{ data: order }, { data: items }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select(
        'id, order_number, customer_name, customer_phone, customer_email, address_line, city, state, postal_code, country, shipping_method, created_at'
      )
      .eq('id', id)
      .single(),
    supabaseAdmin.from('order_items').select('product_name, quantity').eq('order_id', id),
  ])

  if (!order) notFound()

  if (order.shipping_method === 'pickup') {
    return (
      <div className="print-slip-page">
        <PrintSlipActions orderId={id} />
        <p className="text-sm text-earth-600">This is a pickup order — no shipping slip needed.</p>
      </div>
    )
  }

  return (
    <div className="print-slip-page">
      <PrintSlipActions orderId={id} autoPrint={print === '1'} />
      <PrintSlipDocument order={order} items={items ?? []} />
    </div>
  )
}
