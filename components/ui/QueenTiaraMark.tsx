import Image from 'next/image'
import { cn } from '@/lib/utils'

type QueenTiaraMarkProps = {
  className?: string
  uid?: string
}

/** @deprecated Prefer `StoreLogo variant="mark"` — kept for import compatibility. */
export function QueenTiaraMark({ className }: QueenTiaraMarkProps) {
  return (
    <Image
      src="/brand/logo-wordmark.png"
      alt=""
      width={884}
      height={225}
      sizes="(max-width: 640px) 160px, 200px"
      className={cn('h-7 w-auto shrink-0 object-contain sm:h-8', className)}
    />
  )
}
