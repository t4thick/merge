import {
  buildAuthoritativeOrderItems,
  type AuthoritativeProduct,
  type SanitizedCartLine,
} from '@/lib/order-pricing'
import {
  calculateShipping,
  normalizeShippingCountry,
  normalizeShippingMethod,
  normalizeShippingRegion,
  type ShippingMethod,
  type ShippingQuote,
} from '@/lib/shipping'
import { calculateSalesTax, type SalesTaxQuote, type TaxLineInput } from '@/lib/tax/sales-tax'

export type ProductWithCategory = AuthoritativeProduct & { category: string }

export const CHECKOUT_PRODUCT_SELECT = 'id,name,price,in_stock,category'

export type CheckoutTotals = {
  orderItems: ReturnType<typeof buildAuthoritativeOrderItems>['orderItems']
  subtotal: number
  shipping: ShippingQuote
  tax: SalesTaxQuote
  tip: number
  total: number
}

export function computeCheckoutTotals(input: {
  items: SanitizedCartLine[]
  productMap: Map<string, ProductWithCategory>
  country?: string
  state?: string
  shippingMethod?: string
  tipAmount?: number
}): CheckoutTotals {
  const { orderItems, subtotal } = buildAuthoritativeOrderItems(input.items, input.productMap)
  const shipping_method = normalizeShippingMethod(input.shippingMethod)
  const country = normalizeShippingCountry(input.country)
  const state = normalizeShippingRegion(input.state)

  const shipping = calculateShipping({
    subtotal,
    country,
    state,
    method: shipping_method,
  })

  const taxLines: TaxLineInput[] = orderItems.map((item) => ({
    category: input.productMap.get(item.product_id)?.category ?? '',
    lineSubtotal: item.subtotal,
  }))

  const tax = calculateSalesTax(taxLines, {
    country,
    state,
    shippingMethod: shipping_method as ShippingMethod,
  })

  const tipRaw = Number(input.tipAmount ?? 0)
  const tip =
    Number.isFinite(tipRaw) && tipRaw > 0
      ? Math.round(Math.min(tipRaw, 100) * 100) / 100
      : 0

  const total = Math.round((subtotal + shipping.fee + tax.taxAmount + tip) * 100) / 100

  return { orderItems, subtotal, shipping, tax, tip, total }
}
