import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { PAYMENT_LABEL, type PaymentMethod } from '@/lib/payment-methods'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'
import { RefundButton } from '@/components/admin/RefundButton'
import { ManualRefundButton } from '@/components/admin/ManualRefundButton'
import { DeleteOrderButton } from '@/components/admin/DeleteOrderButton'
import { AdminNotePanel } from '@/components/admin/AdminNotePanel'
import { FulfillOrderShipping } from '@/components/admin/FulfillOrderShipping'
import { PrintAddressSlipLink } from '@/components/admin/PrintAddressSlipLink'
import {
  ORDER_STATUS_LABEL,
  getStatusFlow,
  getStatusStepIndex,
  isPickupShippingMethod,
  normalizeOrderStatus,
  orderStatusLabel,
  type OrderStatus,
} from '@/lib/order-status'
import { STORE } from '@/lib/constants/store'
import { SHIPPING_METHOD_LABEL, type ShippingMethod } from '@/lib/shipping'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { formatOrderNumber } from '@/lib/orders/order-number'
import { getDefaultParcel } from '@/lib/shipping/label-config'
import { isShippoConfigured, isUspsLabelsLive } from '@/lib/shipping/admin-ship-methods'
import { getUspsConfigPublic, isUspsConfigured } from '@/lib/shipping/usps-config'

const STATUS_PILL_COLORS: Record<OrderStatus, string> = {
  ordered: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  ready_for_pickup: 'bg-teal-50 text-teal-700',
  shipped: 'bg-violet-50 text-violet-700',
  out_for_delivery: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminPage()
  const { id } = await params

  const [{ data: order }, { data: items }, logsResult] = await Promise.all([
    supabaseAdmin.from('orders').select('*').eq('id', id).single(),
    supabaseAdmin.from('order_items').select('*').eq('order_id', id),
    supabaseAdmin
      .from('order_status_logs')
      .select('id,from_status,to_status,changed_at,changed_by,note')
      .eq('order_id', id)
      .order('changed_at', { ascending: true }),
  ])

  if (!order) notFound()

  const pm = (order.payment_method as PaymentMethod | null | undefined) ?? 'cod'
  const paymentLabel = PAYMENT_LABEL[pm] ?? pm
  const normalizedStatus = normalizeOrderStatus(order.status)
  const shippingMethod =
    (order.shipping_method as ShippingMethod | null | undefined) ?? 'standard'
  const isPickup = isPickupShippingMethod(order.shipping_method)
  const statusFlow = getStatusFlow(order.shipping_method)
  const statusIndex = getStatusStepIndex(order.status, statusFlow)
  const shippingLabel = SHIPPING_METHOD_LABEL[shippingMethod] ?? shippingMethod
  const pickupContactName =
    (order as { pickup_contact_name?: string | null }).pickup_contact_name ?? null
  const statusLogs =
    logsResult.error &&
    /relation .* does not exist|could not find the table/i.test(logsResult.error.message)
      ? []
      : (logsResult.data ?? [])

  const uspsConfig = getUspsConfigPublic()
  const defaultParcel = getDefaultParcel()
  const orderRecord = order as Record<string, unknown>

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders?queue=needs_action"
          className="inline-flex items-center gap-1 text-sm font-medium text-earth-600 no-underline transition-colors hover:text-earth-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to orders
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="admin-page-title">
            Order {formatOrderNumber(order.order_number) || 'detail'}
          </h1>
          <p className="mt-1 break-all font-mono text-xs text-earth-400">{order.id}</p>
        </div>
        <span className={`admin-status-pill self-start ${STATUS_PILL_COLORS[normalizedStatus]}`}>
          {orderStatusLabel(normalizedStatus, { pickup: isPickup })}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar — floats to top on mobile so actions are immediately visible */}
        <div className="order-first space-y-6 lg:order-last">
          {/* Timeline */}
          <section className="admin-card">
            <h2 className="admin-section-title">{isPickup ? 'Pickup timeline' : 'Delivery timeline'}</h2>
            <ol className="mt-4 space-y-3">
              {statusFlow.map((step, index) => {
                const done = statusIndex >= index
                const tsColumn =
                  step === 'ordered' ? order.ordered_at
                  : step === 'processing' ? order.processing_at
                  : step === 'ready_for_pickup' ? order.ready_for_pickup_at
                  : step === 'shipped' ? order.shipped_at
                  : step === 'out_for_delivery' ? order.out_for_delivery_at
                  : order.delivered_at
                return (
                  <li key={step} className="flex items-start gap-2.5 text-sm">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-earth-300" strokeWidth={1.5} aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={done ? 'font-medium text-earth-900' : 'text-earth-500'}>
                        {orderStatusLabel(step, { pickup: isPickup })}
                      </p>
                      {done && tsColumn && (
                        <p className="mt-0.5 text-xs text-earth-500">
                          {new Date(tsColumn).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
          {/* Shipping label */}
          <section className="admin-card space-y-4">
            <PrintAddressSlipLink orderId={order.id} isPickup={shippingMethod === 'pickup'} />
            <div>
              <h2 className="admin-section-title">Ship this order</h2>
              <p className="mt-1 text-sm text-earth-500">
                One-click Shippo label — postage billed to your Shippo account.
              </p>
              <div className="mt-4">
                <FulfillOrderShipping
                  orderId={order.id}
                  isPickup={shippingMethod === 'pickup'}
                  currentStatus={normalizedStatus}
                  uspsConfigured={isUspsConfigured()}
                  uspsLabelsLive={isUspsLabelsLive()}
                  shippoConfigured={isShippoConfigured()}
                  mailClass={uspsConfig.mailClass}
                  defaultParcel={defaultParcel}
                  initialLabelUrl={
                    typeof orderRecord.shipping_label_url === 'string'
                      ? orderRecord.shipping_label_url
                      : null
                  }
                  initialTracking={order.tracking_number}
                  initialCarrier={
                    typeof orderRecord.shipping_carrier === 'string'
                      ? orderRecord.shipping_carrier
                      : null
                  }
                  initialService={
                    typeof orderRecord.shipping_service === 'string'
                      ? orderRecord.shipping_service
                      : null
                  }
                />
              </div>
            </div>
          </section>

          {/* Update status */}
          <section className="admin-card">
            <h2 className="admin-section-title">Update status</h2>
            <div className="mt-4">
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={normalizedStatus}
                trackingNumber={order.tracking_number}
                shippingMethod={order.shipping_method}
              />
            </div>
          </section>

          {/* Admin notes */}
          <section className="admin-card">
            <h2 className="admin-section-title">Internal notes</h2>
            <div className="mt-4">
              <AdminNotePanel orderId={order.id} currentStatus={normalizedStatus} />
            </div>
          </section>

          {/* Refund — Stripe */}
          {pm === 'stripe' && !order.refunded_at && (
            <section className="admin-card">
              <h2 className="admin-section-title">Refund</h2>
              <div className="mt-4">
                <RefundButton
                  orderId={order.id}
                  maxAmount={Number(order.total_amount ?? 0)}
                />
              </div>
            </section>
          )}

          {/* Refund — COD / manual */}
          {pm !== 'stripe' && !order.refunded_at && (
            <section className="admin-card">
              <h2 className="admin-section-title">Refund</h2>
              <p className="mt-1 text-sm text-earth-500">Cash or manual payment — mark refunded after returning money.</p>
              <div className="mt-4">
                <ManualRefundButton
                  orderId={order.id}
                  amount={Number(order.total_amount ?? 0)}
                />
              </div>
            </section>
          )}

          <section className="admin-card">
            <h2 className="admin-section-title">Remove from admin</h2>
            <p className="mt-1 text-sm text-earth-500">
              Permanently clears this order from your list. Does not refund the customer.
            </p>
            <div className="mt-4">
              <DeleteOrderButton orderId={order.id} orderNumber={order.order_number} />
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {/* Customer */}
          <section className="admin-card">
            <h2 className="admin-section-title">Customer</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Field label="Name" value={order.customer_name} />
              <Field label="Email" value={order.customer_email} />
              {order.customer_phone && (
                <Field label="Phone" value={order.customer_phone} />
              )}
              <Field
                label="Placed"
                value={new Date(order.created_at).toLocaleString()}
              />
              <Field label="Payment" value={paymentLabel} />
              <Field
                label={isPickup ? 'Fulfillment' : 'Shipping'}
                value={isPickup ? shippingLabel : `${shippingLabel} (zone: ${order.shipping_zone ?? 'n/a'})`}
              />
              {isPickup && pickupContactName && (
                <Field label="Collected by" value={pickupContactName} />
              )}
              {!isPickup && <Field label="Tracking #" value={order.tracking_number ?? '—'} />}
              {order.refunded_at && (
                <Field
                  label="Refunded"
                  value={`${new Date(order.refunded_at).toLocaleString()} ($${Number(order.refund_amount ?? 0).toFixed(2)})`}
                />
              )}
            </dl>
          </section>

          {/* Fulfillment */}
          <section className="admin-card">
            <h2 className="admin-section-title">{isPickup ? 'Pickup' : 'Delivery address'}</h2>
            {isPickup ? (
              <div className="mt-3 text-sm leading-relaxed text-earth-700">
                <p className="font-medium text-earth-900">Store pickup</p>
                <p className="mt-1">{STORE.address}</p>
                <p>{STORE.hours}</p>
                <p className="mt-2">
                  <span className="text-earth-500">Collected by: </span>
                  {pickupContactName || order.customer_name || '—'}
                </p>
              </div>
            ) : (
              <address className="mt-3 not-italic text-sm leading-relaxed text-earth-700">
                {order.address_line}
                <br />
                {order.city}
                {order.state ? `, ${order.state}` : ''}
                {order.postal_code ? ` ${order.postal_code}` : ''}
                <br />
                {order.country}
              </address>
            )}
          </section>

          {/* Items */}
          <section className="admin-card">
            <h2 className="admin-section-title">Items</h2>
            {items && items.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium text-earth-900">{item.product_name}</td>
                        <td className="tabular-nums">${Number(item.product_price ?? 0).toFixed(2)}</td>
                        <td className="tabular-nums">{item.quantity}</td>
                        <td className="text-right tabular-nums">
                          ${Number(item.subtotal ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right text-earth-600">
                        Subtotal
                      </td>
                      <td className="text-right tabular-nums">
                        ${Number(order.subtotal_amount ?? 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="text-right text-earth-600">
                        Shipping
                      </td>
                      <td className="text-right tabular-nums">
                        ${Number(order.shipping_fee ?? 0).toFixed(2)}
                      </td>
                    </tr>
                    {Number(orderRecord.tax_amount ?? 0) > 0 ? (
                      <tr>
                        <td colSpan={3} className="text-right text-earth-600">
                          Sales tax
                        </td>
                        <td className="text-right tabular-nums">
                          ${Number(orderRecord.tax_amount).toFixed(2)}
                        </td>
                      </tr>
                    ) : null}
                    <tr className="border-t border-earth-200">
                      <td colSpan={3} className="pt-2 text-right font-semibold text-earth-900">
                        Total
                      </td>
                      <td className="pt-2 text-right tabular-nums font-semibold text-earth-900">
                        ${Number(order.total_amount ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-earth-500">No items.</p>
            )}
          </section>
        </div>

        {/* Timeline — desktop only alongside main content */}
      </div>

      {/* Audit log — full width below */}
      {statusLogs.length > 0 && (
        <section>
          <h2 className="admin-section-title mb-3">Status log</h2>
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>From</th>
                  <th>To</th>
                  <th>By</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {statusLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-earth-600">
                      {new Date(log.changed_at).toLocaleString()}
                    </td>
                    <td>
                      {log.from_status
                        ? ORDER_STATUS_LABEL[normalizeOrderStatus(log.from_status)]
                        : '—'}
                    </td>
                    <td className="font-medium text-earth-900">
                      {ORDER_STATUS_LABEL[normalizeOrderStatus(log.to_status)]}
                    </td>
                    <td className="text-earth-600">{log.changed_by ?? '—'}</td>
                    <td className="text-earth-600">{log.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-earth-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-earth-900">{value}</dd>
    </div>
  )
}
