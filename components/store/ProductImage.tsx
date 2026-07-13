'use client'

import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProductImageProps = {
  src: string | null
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  framed?: boolean
  /** Subtle zoom on card hover (off by default per design system). */
  hoverZoom?: boolean
  showPlaceholderHint?: boolean
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = '(max-width:640px) 50vw, 25vw',
  priority,
  framed = true,
  hoverZoom = false,
  showPlaceholderHint = false,
}: ProductImageProps) {
  if (!src?.trim()) {
    return (
      <div
        className={cn(
          framed
            ? 'product-image-frame'
            : 'flex aspect-square flex-col items-center justify-center gap-1 bg-earth-50',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <Package className="h-10 w-10 text-earth-400 sm:h-12 sm:w-12" strokeWidth={1.25} aria-hidden />
        {showPlaceholderHint && (
          <span className="text-[10px] font-medium text-earth-400">Photo soon</span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        framed ? 'product-image-frame' : 'relative aspect-square bg-earth-50',
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-contain p-1',
          hoverZoom && 'transition-transform duration-150 ease-out group-hover:scale-[1.02]'
        )}
        sizes={sizes}
        priority={priority}
      />
    </div>
  )
}
