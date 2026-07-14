import Link from 'next/link'
import { STORE } from '@/lib/constants/store'
import { cn } from '@/lib/utils'

type StoreLogoProps = {
  className?: string
  /** `nav` = header. `footer` = light-on-dark lockup with tagline. `mark` = standalone tile. */
  variant?: 'nav' | 'footer' | 'mark'
  linked?: boolean
}

/**
 * Kintampo mark — a market-stall tile: red rounded square, gold scalloped
 * awning across the top, bold white K. Hand-drawn paths, no font dependency.
 */
function KintampoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-hidden
      focusable="false"
    >
      <rect x="0" y="0" width="48" height="48" rx="10" fill="#CE1126" />
      {/* Awning: gold band with scalloped bottom edge */}
      <path
        d="M0 10 Q0 0 10 0 H38 Q48 0 48 10 V11 H40 A4 4 0 0 1 32 11 A4 4 0 0 1 24 11 A4 4 0 0 1 16 11 A4 4 0 0 1 8 11 H0 Z"
        fill="#FCD116"
      />
      {/* K letterform */}
      <path d="M14 18 H20.5 V44 H14 Z" fill="#FFFFFF" />
      <path d="M20.5 31 L31.5 18 H39.5 L28.5 31 L39.5 44 H31.5 Z" fill="#FFFFFF" />
    </svg>
  )
}

const SIZES = {
  nav: {
    tile: 'h-9 w-9 sm:h-10 sm:w-10',
    name: 'text-[16px] sm:text-[18px]',
    sub: 'text-[7.5px] tracking-[0.3em] sm:text-[8.5px]',
    dark: false,
    tagline: false,
  },
  mark: {
    tile: 'h-12 w-12',
    name: 'text-[20px]',
    sub: 'text-[9px] tracking-[0.3em]',
    dark: false,
    tagline: false,
  },
  footer: {
    tile: 'h-11 w-11',
    name: 'text-[20px]',
    sub: 'text-[9px] tracking-[0.3em]',
    dark: true,
    tagline: true,
  },
} as const

function Lockup({ variant }: { variant: keyof typeof SIZES }) {
  const s = SIZES[variant]
  return (
    <span className="inline-flex items-center gap-2.5">
      <KintampoMark className={cn('shrink-0', s.tile)} />
      <span className="inline-flex flex-col">
        <span
          className={cn(
            'font-extrabold uppercase leading-none tracking-[-0.01em]',
            s.name,
            s.dark ? 'text-white' : 'text-earth-950'
          )}
        >
          Kintampo
        </span>
        <span
          className={cn(
            'mt-1 font-bold uppercase leading-none',
            s.sub,
            s.dark ? 'text-accent-400' : 'text-brand-600'
          )}
        >
          African Market
        </span>
        {s.tagline && (
          <span className="mt-2 max-w-[15rem] text-[11px] font-medium leading-snug normal-case tracking-normal text-earth-400">
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
