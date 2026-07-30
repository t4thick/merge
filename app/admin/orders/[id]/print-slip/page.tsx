import { notFound } from 'next/navigation'
import { PrintSlipActions } from '@/components/admin/PrintSlipActions'
import { PrintSlipDocument } from '@/components/admin/PrintSlipDocument'
import { PickupTicketDocument } from '@/components/admin/PickupTicketDocument'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { STORE, storePhonesPlain } from '@/lib/constants/store'
import { formatOrderNumber } from '@/lib/orders/order-number'
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
    // `*` keeps this resilient to installs that have not run pickup-flow.sql yet.
    supabaseAdmin.from('orders').select('*').eq('id', id).single(),
    supabaseAdmin.from('order_items').select('product_name, quantity').eq('order_id', id),
  ])

  if (!order) notFound()

  if (order.shipping_method === 'pickup') {
    return (
      <div className="print-slip-page">
        <PrintSlipActions orderId={id} autoPrint={print === '1'} />
        <PickupTicketDocument order={order} items={items ?? []} />
      </div>
    )
  }

  const orderLabel = formatOrderNumber(order.order_number) || order.id.slice(0, 8)
  const cityLine = [
    order.city,
    order.state ? `, ${order.state}` : '',
    order.postal_code ? ` ${order.postal_code}` : '',
  ]
    .join('')
    .trim()

  const sharePayload = {
    name: order.customer_name,
    lines: [order.address_line, cityLine, order.country].filter(Boolean),
    orderLabel,
    phone: order.customer_phone,
    shipFromLines: [
      STORE.name,
      STORE.shipFrom.street1,
      `${STORE.shipFrom.city}, ${STORE.shipFrom.state} ${STORE.shipFrom.zip}`,
      storePhonesPlain(),
    ],
  }

  return (
    <div className="print-slip-page">
      <PrintSlipActions orderId={id} autoPrint={print === '1'} sharePayload={sharePayload} />
      <PrintSlipDocument order={order} items={items ?? []} />
    </div>
  )
}
