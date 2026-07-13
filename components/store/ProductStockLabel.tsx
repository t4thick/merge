import { cn } from '@/lib/utils'

type Props = {
  inStock: boolean
  className?: string
  /** Shorter copy for product cards */
  compact?: boolean
}

export function ProductStockLabel({ inStock, className, compact }: Props) {
  if (!inStock) {
    return (
      <span
        className={cn(
          'inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-earth-500',
          className
        )}
      >
        Out of stock
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-brand-700',
        className
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden />
      {compact ? 'In stock' : 'In stock · ships in 24h'}
    </span>
  )
}
