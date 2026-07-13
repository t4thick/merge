/** Stored in `orders.payment_method` */
export type PaymentMethod = 'cod' | 'zelle' | 'manual' | 'stripe'

export function normalizePaymentMethod(raw: unknown): PaymentMethod {
  if (raw === 'zelle' || raw === 'manual' || raw === 'cod' || raw === 'stripe') return raw
  return 'cod'
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: 'Cash on delivery',
  zelle: 'Zelle',
  manual: 'Manual / other',
  stripe: 'Card (Stripe)',
}
