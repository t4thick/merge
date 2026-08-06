'use client'

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

/**
 * Native <img> for product photos — avoids Vercel /_next/image quota and
 * INVALID_IMAGE_OPTIMIZE_REQUEST failures on large Supabase uploads.
 */
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
            : 'flex aspect-square flex-col items-center justify-center gap-1 bg-white',
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
        framed ? 'product-image-frame' : 'relative aspect-square bg-white',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- product CDN photos must bypass optimizer */}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={cn(
          'absolute inset-0 h-full w-full object-contain p-3 sm:p-4',
          hoverZoom && 'transition-transform duration-150 ease-out group-hover:scale-[1.02]'
        )}
      />
    </div>
  )
}
