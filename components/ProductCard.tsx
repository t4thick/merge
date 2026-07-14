'use client'

import Link from 'next/link'
import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { ProductImage } from '@/components/store/ProductImage'
import { Button } from '@/components/ui/button'
import { ProductStockLabel } from '@/components/store/ProductStockLabel'
import { extractPackSize } from '@/lib/product-display'
import { formatMoney } from '@/lib/utils'
import type { Product } from '@/types'

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { addItem } = useCart()
  const toast = useToast()
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 900)
    return () => clearTimeout(t)
  }, [justAdded])

  const packSize = extractPackSize(product)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!product.in_stock) return
    addItem(product, 1)
    toast?.show(`Added: ${product.name}`)
    setJustAdded(true)
  }

  return (
    <article className="group premium-card premium-card-hover flex h-full flex-col">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col no-underline">
        <div className="product-image-frame relative">
          {!product.in_stock && (
            <span className="absolute left-2 top-2 z-10 rounded-md bg-earth-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              Out of stock
            </span>
          )}
          <div className="h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.03]">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="rounded-none"
              sizes="(max-width:640px) 50vw, 25vw"
              priority={priority}
              showPlaceholderHint
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-3.5">
          <p className="line-clamp-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-earth-400">
            {product.category}
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-snug text-earth-900 transition-colors duration-150 group-hover:text-brand-700 sm:text-[15px]">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-earth-500">
              {product.description}
            </p>
          )}
          {(product.in_stock || packSize) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              {product.in_stock && <ProductStockLabel inStock compact />}
              {packSize && (
                <span className="text-[11px] font-medium text-earth-500">{packSize}</span>
              )}
            </div>
          )}
          <p className="mt-auto pt-2.5 text-[17px] font-bold tabular-nums tracking-tight text-brand-700">
            {formatMoney(product.price)}
          </p>
        </div>
      </Link>
      <div className="border-t border-earth-100 p-2">
        <Button
          type="button"
          variant={product.in_stock ? 'default' : 'outline'}
          size="sm"
          className="h-11 w-full gap-1.5 text-[13px]"
          disabled={!product.in_stock}
          onClick={handleAdd}
          aria-label={product.in_stock ? `Add ${product.name} to cart` : 'Unavailable'}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Added
            </>
          ) : product.in_stock ? (
            <>
              <Plus className="h-4 w-4" aria-hidden />
              Add to cart
            </>
          ) : (
            'Unavailable'
          )}
        </Button>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="premium-card flex h-full flex-col">
      <div className="skeleton aspect-square" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton mt-auto h-5 w-1/3 rounded pt-3" />
      </div>
      <div className="border-t border-earth-100 p-2">
        <div className="skeleton h-11 w-full rounded-md" />
      </div>
    </div>
  )
}

export function ProductCardMini({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="flex gap-3 no-underline">
      <ProductImage
        src={product.image_url}
        alt={product.name}
        className="h-16 w-16 rounded-md"
        sizes="64px"
        framed={false}
      />
      <div>
        <p className="line-clamp-2 text-sm font-medium text-earth-900">{product.name}</p>
        <p className="text-sm font-bold text-brand-700">{formatMoney(product.price)}</p>
      </div>
    </Link>
  )
}
