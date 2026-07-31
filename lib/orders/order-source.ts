/** How the order entered the system. */
export type OrderSource = 'online' | 'phone' | 'whatsapp' | 'in_store'

export type PaymentStatus = 'paid' | 'unpaid'

export function normalizeOrderSource(raw: unknown): OrderSource {
  if (raw === 'phone' || raw === 'whatsapp' || raw === 'in_store' || raw === 'online') {
    return raw
  }
  return 'online'
}

export function normalizePaymentStatus(raw: unknown): PaymentStatus {
  return raw === 'unpaid' ? 'unpaid' : 'paid'
}

export const ORDER_SOURCE_LABEL: Record<OrderSource, string> = {
  online: 'Online',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  in_store: 'In store',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
}
