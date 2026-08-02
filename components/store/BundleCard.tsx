'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'
import type { ProductBundle } from '@/lib/supabase/bundles'

export function BundleCard({ bundle }: { bundle: ProductBundle }) {
  const { addItem } = useCart()
  const toast = useToast()

  const listTotal = bundle.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const discount = Math.max(0, Math.min(50, Number(bundle.discount_percent) || 0))
  const saleTotal = Math.round(listTotal * (1 - discount / 100) * 100) / 100

  function addAll() {
    for (const line of bundle.items) {
      if (!line.product.in_stock) continue
      addItem(line.product, line.quantity)
    }
    toast?.show(`Added kit: ${bundle.name}`)
  }

  return (
    <article className="premium-card flex h-full flex-col p-5">
      <Link href={`/bundles/${bundle.slug}`} className="no-underline">
        <h3 className="text-base font-semibold text-earth-900">{bundle.name}</h3>
        {bundle.description && (
          <p className="mt-1 line-clamp-2 text-sm text-earth-600">{bundle.description}</p>
        )}
        <p className="mt-2 text-xs text-earth-500">
          {bundle.items.length} item{bundle.items.length === 1 ? '' : 's'}
          {discount > 0 ? ` · ${discount}% kit price` : ''}
        </p>
        <p className="mt-3 text-lg font-semibold tabular-nums text-earth-900">
          {formatMoney(saleTotal)}
          {discount > 0 && (
            <span className="ml-2 text-sm font-medium text-earth-400 line-through">
              {formatMoney(listTotal)}
            </span>
          )}
        </p>
      </Link>
      <Button type="button" className="mt-auto min-h-11 w-full" onClick={addAll}>
        Add kit to cart
      </Button>
    </article>
  )
}
