import Link from 'next/link'
import { ArrowRight, MapPin, PackageCheck, Store, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchAutocomplete } from '@/components/store/SearchAutocomplete'

const SERVICE_ITEMS = [
  { label: 'Pickup in Columbus', icon: MapPin },
  { label: 'Fast Ohio delivery', icon: Truck },
  { label: 'Nationwide shipping', icon: PackageCheck },
  { label: 'Mobile market', icon: Store },
] as const

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  return (
    <section className="border-b border-earth-200 bg-earth-50" aria-label="Kintampo African Market">
      <div className="store-container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[850px] text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-earth-500">
            Grocery, fashion &amp; hair · Columbus, Ohio
          </p>

          <h1 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-earth-900 sm:text-6xl lg:text-7xl">
            <span className="block">The products you need,</span>
            <span className="block">ready to order.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-earth-600 sm:text-lg">
            {inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock. ` : ''}
            Shop fufu, palm oil, egusi, spices, drinks, produce, and more. Choose nationwide
            shipping, fast Ohio delivery, store pickup, or our mobile market.
          </p>

          {/* Desktop/tablet only — mobile already has sticky search in the header */}
          <div className="mx-auto mt-8 hidden max-w-2xl rounded-2xl border border-earth-200 bg-white p-2 shadow-[var(--shadow-premium)] sm:block">
            <SearchAutocomplete placeholder="Search products, brands, or categories" />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row">
            <Link href="/shop" className="w-full no-underline sm:w-auto">
              <Button size="lg" className="h-12 w-full px-7 sm:w-auto">
                Shop all products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="#mobile-market" className="w-full no-underline sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 w-full px-7 sm:w-auto">
                Mobile market &amp; delivery
              </Button>
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-earth-200 pt-6 text-sm text-earth-600">
            {SERVICE_ITEMS.map(({ label, icon: Icon }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-earth-500" strokeWidth={1.75} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
