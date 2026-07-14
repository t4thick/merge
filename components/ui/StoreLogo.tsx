import Link from 'next/link'
import { STORE } from '@/lib/constants/store'
import { cn } from '@/lib/utils'

type StoreLogoProps = {
  className?: string
  /** `nav` = header. `footer` = larger lockup with tagline. `mark` = hero eyebrow. */
  variant?: 'nav' | 'footer' | 'mark'
  linked?: boolean
}

/**
 * Type-led wordmark — KINTAMPO set tight with a solid square full stop,
 * "AFRICAN MARKET" letterspaced beneath. Monochrome, editorial, crisp at
 * any size. No image request, no icon box.
 */
const SIZES = {
  nav: {
    name: 'text-[17px] sm:text-[19px]',
    dot: 'h-[5px] w-[5px] sm:h-[6px] sm:w-[6px]',
    sub: 'text-[7.5px] tracking-[0.32em] sm:text-[8.5px]',
    tagline: false,
  },
  mark: {
    name: 'text-[20px] sm:text-[22px]',
    dot: 'h-[6px] w-[6px] sm:h-[7px] sm:w-[7px]',
    sub: 'text-[8.5px] tracking-[0.32em] sm:text-[9.5px]',
    tagline: false,
  },
  footer: {
    name: 'text-[22px]',
    dot: 'h-[7px] w-[7px]',
    sub: 'text-[9.5px] tracking-[0.32em]',
    tagline: true,
  },
} as const

function Lockup({ variant }: { variant: keyof typeof SIZES }) {
  const s = SIZES[variant]
  return (
    <span className="inline-flex flex-col">
      <span className="inline-flex items-baseline gap-[3px]">
        <span
          className={cn(
            'font-extrabold uppercase leading-none tracking-[-0.02em] text-earth-950',
            s.name
          )}
        >
          Kintampo
        </span>
        <span className={cn('inline-block shrink-0 bg-earth-950', s.dot)} aria-hidden />
      </span>
      <span
        className={cn(
          'mt-[5px] font-semibold uppercase leading-none text-earth-500',
          s.sub
        )}
      >
        African Market
      </span>
      {s.tagline && (
        <span className="mt-2 max-w-[15rem] text-[11px] font-medium leading-snug normal-case tracking-normal text-earth-500">
          {STORE.tagline}
        </span>
      )}
    </span>
  )
}

export function StoreLogo({ className, variant = 'nav', linked = true }: StoreLogoProps) {
  const inner = <Lockup variant={variant} />

  if (!linked) {
    return <div className={cn('inline-flex shrink-0', className)}>{inner}</div>
  }

  return (
    <Link
      href="/"
      className={cn(
        'inline-flex shrink-0 no-underline transition-opacity duration-150 hover:opacity-80',
        className
      )}
      aria-label={`${STORE.name} — home`}
    >
      {inner}
    </Link>
  )
}
