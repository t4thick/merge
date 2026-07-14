import Link from 'next/link'
import { STORE } from '@/lib/constants/store'
import { cn } from '@/lib/utils'

type StoreLogoProps = {
  className?: string
  /** `nav` = header. `footer` = light-on-dark lockup with tagline. `mark` = standalone. */
  variant?: 'nav' | 'footer' | 'mark'
  linked?: boolean
}

const SIZES = {
  nav: {
    name: 'text-[24px] sm:text-[27px]',
    sub: 'text-[7.5px] tracking-[0.34em] sm:text-[8.5px]',
    dark: false,
    tagline: false,
  },
  mark: {
    name: 'text-[30px]',
    sub: 'text-[9px] tracking-[0.34em]',
    dark: false,
    tagline: false,
  },
  footer: {
    name: 'text-[28px]',
    sub: 'text-[9px] tracking-[0.34em]',
    dark: true,
    tagline: true,
  },
} as const

/**
 * Wordmark — "Kintampo" in Fraunces Black Italic (fat, high-contrast,
 * 9924-style script energy) with a brand-red full stop, and
 * "AFRICAN MARKET" letterspaced beneath in sans.
 */
function Lockup({ variant }: { variant: keyof typeof SIZES }) {
  const s = SIZES[variant]
  return (
    <span className="inline-flex flex-col">
      <span
        className={cn(
          'wordmark leading-[0.9]',
          s.name,
          s.dark ? 'text-white' : 'text-earth-950'
        )}
      >
        Kintampo<span className="text-brand-600">.</span>
      </span>
      <span
        className={cn(
          'mt-1.5 font-sans font-bold uppercase leading-none',
          s.sub,
          s.dark ? 'text-accent-400' : 'text-earth-500'
        )}
      >
        African Market
      </span>
      {s.tagline && (
        <span className="mt-2 max-w-[15rem] font-sans text-[11px] font-medium leading-snug normal-case tracking-normal text-earth-400">
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
        'inline-flex shrink-0 no-underline transition-opacity duration-150 hover:opacity-85',
        className
      )}
      aria-label={`${STORE.name} — home`}
    >
      {inner}
    </Link>
  )
}
