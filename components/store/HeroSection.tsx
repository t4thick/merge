import Image from 'next/image'
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
      <div className="store-container py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-earth-500">
              African &amp; Caribbean grocery · Columbus, Ohio
            </p>

            <h1 className="mt-4 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-earth-900 sm:text-5xl lg:text-6xl">
              <span className="block">Stocked shelves.</span>
              <span className="block">Ready to order.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-earth-600 sm:text-lg">
              {inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock. ` : ''}
              Rice, drinks, spices, beauty oils, produce, and more — pickup in Columbus, Ohio
              delivery, nationwide shipping, or mobile market.
            </p>

            <div className="mt-7 hidden max-w-xl rounded-2xl border border-earth-200 bg-white p-2 shadow-[var(--shadow-premium)] sm:block">
              <SearchAutocomplete placeholder="Search products, brands, or categories" />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="w-full no-underline sm:w-auto">
                <Button size="lg" className="h-12 w-full px-7 sm:w-auto">
                  Shop all products
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link href="#visit" className="w-full no-underline sm:w-auto">
                <Button size="lg" variant="outline" className="h-12 w-full px-7 sm:w-auto">
                  Visit the store
                </Button>
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-earth-200 pt-5 text-sm text-earth-600">
              {SERVICE_ITEMS.map(({ label, icon: Icon }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-earth-500" strokeWidth={1.75} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-earth-200 bg-earth-100 shadow-[var(--shadow-premium)]">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="/images/store/aisle-front.png"
                alt="Inside Kintampo African Market — stocked aisles with rice, drinks, and grocery shelves"
                fill
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-950/75 to-transparent p-5 pt-16">
              <p className="text-sm font-semibold text-white">1668 E Dublin Granville Rd</p>
              <p className="mt-0.5 text-xs text-white/75">Columbus, OH · Open 7 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
