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
 * Vector brand lockup — renders as SVG + live text, so it is pixel-crisp at
 * every size, needs no image download, and sits on any background.
 */
function KMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="var(--color-brand-700)" />
      <path
        d="M13 9h7.5v13.4L32.3 9h9.2L28.4 24l13.1 15h-9.2L20.5 25.6V39H13Z"
        fill="#F0D56A"
      />
      <path d="M13 9h3.4v30H13Z" fill="#C9A227" />
    </svg>
  )
}

const SIZES = {
  nav: {
    mark: 'h-9 w-9 sm:h-10 sm:w-10',
    name: 'text-[15px] sm:text-[17px]',
    sub: 'text-[8px] tracking-[0.24em] sm:text-[9px]',
    gap: 'gap-2.5',
    tagline: false,
  },
  mark: {
    mark: 'h-10 w-10 sm:h-11 sm:w-11',
    name: 'text-[17px] sm:text-[19px]',
    sub: 'text-[9px] tracking-[0.24em] sm:text-[10px]',
    gap: 'gap-3',
    tagline: false,
  },
  footer: {
    mark: 'h-11 w-11',
    name: 'text-[19px]',
    sub: 'text-[10px] tracking-[0.24em]',
    gap: 'gap-3',
    tagline: true,
  },
} as const

function Lockup({ variant }: { variant: keyof typeof SIZES }) {
  const s = SIZES[variant]
  return (
    <span className={cn('inline-flex items-center', s.gap)}>
      <KMark className={cn('shrink-0', s.mark)} />
      <span className="flex flex-col justify-center">
        <span className={cn('font-bold uppercase leading-none tracking-tight text-earth-900', s.name)}>
          Kintampo
        </span>
        <span className={cn('mt-1 font-semibold uppercase leading-none text-gold-600', s.sub)}>
          African Market
        </span>
        {s.tagline && (
          <span className="mt-1.5 text-[11px] font-medium leading-none text-earth-500">
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
