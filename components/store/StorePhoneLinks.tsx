import { STORE } from '@/lib/constants/store'
import { cn } from '@/lib/utils'

type StorePhoneLinksProps = {
  className?: string
  linkClassName?: string
  separator?: string
}

/** Both store numbers as tap-to-call links. */
export function StorePhoneLinks({
  className,
  linkClassName,
  separator = ' · ',
}: StorePhoneLinksProps) {
  const link =
    linkClassName ??
    'inline-flex min-h-11 items-center font-medium text-earth-900 no-underline hover:text-earth-600'

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-x-1', className)}>
      <a href={STORE.phoneHref} className={link}>
        {STORE.phone}
      </a>
      <span className="text-earth-400" aria-hidden>
        {separator}
      </span>
      <a href={STORE.phoneAltHref} className={link}>
        {STORE.phoneAlt}
      </a>
    </span>
  )
}
