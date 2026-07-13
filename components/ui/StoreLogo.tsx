import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type StoreLogoProps = {
  className?: string
  /** `nav` = header. `footer` = full lockup with tagline. `mark` = small wordmark for hero eyebrows. */
  variant?: 'nav' | 'footer' | 'mark'
  linked?: boolean
}

const LOGO = {
  nav: {
    src: '/brand/logo-wordmark.png',
    width: 884,
    height: 225,
    sizes: '(max-width: 640px) 140px, 168px',
    className: 'h-8 w-auto sm:h-9',
    alt: 'Lovely Queen African Market',
  },
  footer: {
    src: '/brand/logo-full.png',
    width: 913,
    height: 353,
    sizes: '(max-width: 640px) 240px, 280px',
    className: 'h-auto w-full max-w-[17rem] sm:max-w-[19rem]',
    alt: 'Lovely Queen African Market',
  },
  mark: {
    src: '/brand/logo-wordmark.png',
    width: 884,
    height: 225,
    sizes: '(max-width: 640px) 160px, 200px',
    className: 'h-8 w-auto sm:h-9',
    alt: 'Lovely Queen African Market',
  },
} as const

function LogoImage({ variant }: { variant: keyof typeof LOGO }) {
  const logo = LOGO[variant]
  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      sizes={logo.sizes}
      className={cn('shrink-0 object-contain object-left', logo.className)}
      priority={variant === 'nav'}
    />
  )
}

export function StoreLogo({ className, variant = 'nav', linked = true }: StoreLogoProps) {
  const inner = <LogoImage variant={variant} />

  if (!linked) {
    return <div className={cn('inline-flex shrink-0', className)}>{inner}</div>
  }

  return (
    <Link
      href="/"
      className={cn('inline-flex shrink-0 no-underline transition-opacity duration-150 hover:opacity-90', className)}
      aria-label="Lovely Queen African Market — home"
    >
      {inner}
    </Link>
  )
}
