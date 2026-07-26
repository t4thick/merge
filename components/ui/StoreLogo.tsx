import Link from 'next/link'
import { ShoppingBasket } from 'lucide-react'
import { STORE } from '@/lib/constants/store'
import { cn } from '@/lib/utils'

type StoreLogoProps = {
  className?: string
  /** `nav` = header. `footer` = expanded lockup. `mark` = standalone. */
  variant?: 'nav' | 'footer' | 'mark'
  linked?: boolean
}

const SIZES = {
  nav: {
    badge: 'h-8 w-8 rounded-[9px]',
    icon: 'h-4 w-4',
    name: 'text-[22px] sm:text-[25px]',
    sub: 'text-[7.5px] tracking-[0.28em] sm:text-[8.5px]',
    tagline: false,
  },
  mark: {
    badge: 'h-10 w-10 rounded-xl',
    icon: 'h-5 w-5',
    name: 'text-[28px]',
    sub: 'text-[9px] tracking-[0.28em]',
    tagline: false,
  },
  footer: {
    badge: 'h-11 w-11 rounded-xl',
    icon: 'h-5 w-5',
    name: 'text-[26px]',
    sub: 'text-[9px] tracking-[0.28em]',
    tagline: true,
  },
} as const

/**
 * Brand mark (basket glyph, inline SVG via lucide — no image request) + Syne
 * wordmark with a Montserrat descriptor. Stays legible at nav size; product
 * photography carries the rest of the visual character.
 */
function Lockup({ variant }: { variant: keyof typeof SIZES }) {
  const s = SIZES[variant]
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center bg-brand-600',
          s.badge
        )}
        aria-hidden
      >
        <ShoppingBasket className={cn(s.icon, 'text-white')} strokeWidth={2.25} />
      </span>
      <span className="inline-flex flex-col">
        <span className={cn('wordmark leading-[0.9]', s.name, 'text-earth-900')}>
          Kintampo<span className="text-brand-600">.</span>
        </span>
        <span
          className={cn(
            'mt-1.5 font-sans font-bold uppercase leading-none',
            s.sub,
            'text-earth-500'
          )}
        >
          African Market
        </span>
        {s.tagline && (
          <span className="mt-2 max-w-[15rem] font-sans text-[11px] font-normal leading-snug normal-case tracking-normal text-earth-500">
            {STORE.tagline}
          </span>
        )}
      </span>
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
        'inline-flex shrink-0 no-underline transition-opacity duration-150 hover:opacity-85',
        className
      )}
      aria-label={`${STORE.name} — home`}
    >
      {inner}
    </Link>
  )
}
