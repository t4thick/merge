import Link from 'next/link'
import { Lock, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { getSupportEmail, STORE } from '@/lib/constants/store'
import { PaymentMethodIcons } from '@/components/store/PaymentMethodIcons'
import { SocialLinks } from '@/components/store/SocialLinks'
import { StoreLogo } from '@/components/ui/StoreLogo'

const SHOP_LINKS = [
  { href: '/shop', label: 'All products' },
  { href: '/shop?category=Spices', label: 'Spices' },
  { href: '/shop?category=Flours%20%26%20Rice', label: 'Rice & flour' },
  { href: '/shop?category=Beverages', label: 'Beverages' },
  { href: '/shop?category=Frozen', label: 'Frozen' },
] as const

const ACCOUNT_LINKS = [
  { href: '/track-order', label: 'Track order' },
  { href: '/account', label: 'My account' },
  { href: '/cart', label: 'Cart' },
  { href: '/checkout', label: 'Checkout' },
] as const

const HELP_LINKS = [
  { href: '/feedback', label: 'Website feedback' },
  { href: '/track-order', label: 'Track order' },
] as const

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const

export function Footer() {
  const supportEmail = getSupportEmail()
  return (
    <footer className="mt-auto bg-earth-900 text-earth-300 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <div className="store-container py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-1">
            <StoreLogo variant="footer" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-earth-400">
              African &amp; Caribbean groceries. Store pickup and US shipping.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium text-earth-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-400" /> Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent-400" /> Stripe
              </span>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-earth-500">Follow</p>
              <SocialLinks className="mt-3" dark />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent-400">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-earth-300 no-underline hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent-400">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-earth-300 no-underline hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent-400">Help</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-earth-300 no-underline hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${supportEmail}`}
                  className="break-all text-earth-300 no-underline hover:text-white"
                >
                  {supportEmail}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent-400">Visit us</p>
            <p className="mt-4 flex items-start gap-2 text-sm text-earth-300">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
              <span>{STORE.address}</span>
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
              <a
                href={STORE.phoneHref}
                className="font-semibold text-white no-underline hover:text-accent-300"
              >
                {STORE.phone}
              </a>
            </p>
            <p className="mt-2 text-xs text-earth-500">{STORE.hours}</p>
          </div>
        </div>

        <div className="mt-10 border-t border-earth-800 pt-8">
          <PaymentMethodIcons />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-earth-800 pt-6 text-xs text-earth-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {STORE.name}. All rights reserved.
          </p>
          <p className="flex gap-5">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-earth-400 no-underline hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}
