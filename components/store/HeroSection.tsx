import Link from 'next/link'
import { ArrowRight, MapPin, Package, ShoppingBasket, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchAutocomplete } from '@/components/store/SearchAutocomplete'

const QUICK_LINKS = [
  { href: '/shop', label: 'Shop all', sub: 'Full catalog', icon: ShoppingBasket },
  { href: '/shop#categories', label: 'Categories', sub: '14 departments', icon: Package },
  { href: '/track-order', label: 'Track order', sub: 'Live status', icon: Truck },
  { href: '/feedback', label: 'Request item', sub: "Can't find it?", icon: MapPin },
] as const

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  return (
    <section aria-label="Welcome to Kintampo African Market">
      {/* Warm banner */}
      <div className="bg-gradient-to-b from-accent-50 to-white">
        <div className="store-container py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Marketplace for African &amp; Caribbean food
            </p>

            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-earth-900 sm:text-5xl lg:text-6xl">
              Everything from the{' '}
              <span className="text-brand-600">Makola market</span>,
              <br className="hidden sm:block" /> delivered to your door
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-earth-600 sm:text-base">
              {inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock — ` : ''}
              fufu, palm oil, egusi, spices, drinks &amp; more. Pickup in Columbus or shipped
              nationwide within 24h.
            </p>

            <div className="mx-auto mt-6 max-w-xl">
              <SearchAutocomplete placeholder="Search jollof rice, palm oil, plantain…" />
            </div>

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/shop" className="w-full no-underline sm:w-auto">
                <Button size="lg" className="h-12 w-full px-8 text-[15px] sm:w-auto sm:min-w-[210px]">
                  Shop all products
                </Button>
              </Link>
              <Link
                href="/shop#categories"
                className="inline-flex h-11 items-center gap-1 text-sm font-bold text-brand-700 no-underline hover:text-brand-800"
              >
                Browse categories
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Quick-access tiles */}
          <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2.5 sm:mt-10 sm:grid-cols-4 sm:gap-3">
            {QUICK_LINKS.map(({ href, label, sub, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-xl border border-earth-200 bg-white p-3 no-underline shadow-[var(--shadow-card)] transition-all duration-150 hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)] sm:p-3.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-earth-900">{label}</span>
                    <span className="block truncate text-xs text-earth-500">{sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
