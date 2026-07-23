import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, PackageCheck, Store, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchAutocomplete } from '@/components/store/SearchAutocomplete'

const SERVICE_ITEMS = [
  { label: 'Pickup in Columbus', icon: MapPin },
  { label: 'Ohio delivery', icon: Truck },
  { label: 'US shipping', icon: PackageCheck },
  { label: 'Mobile market', icon: Store },
] as const

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  return (
    <section className="border-b border-earth-200 bg-earth-950" aria-label="Kintampo African Market">
      {/* Full-bleed store photo */}
      <div className="relative min-h-[70vh] w-full sm:min-h-[78vh]">
        <Image
          src="/images/store/aisle-front.png"
          alt="Inside Kintampo African Market — stocked aisles with rice, drinks, and grocery shelves"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/55 to-earth-950/25" />

        <div className="store-container relative flex min-h-[70vh] flex-col justify-end pb-10 pt-28 sm:min-h-[78vh] sm:pb-14 lg:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            African &amp; Caribbean grocery · Columbus, Ohio
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Your market. Online and in store.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
            {inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock. ` : ''}
            Rice, drinks, spices, beauty oils, produce — pickup, Ohio delivery, or ship nationwide.
          </p>

          <div className="mt-6 hidden max-w-xl rounded-2xl border border-white/15 bg-white/95 p-2 shadow-[var(--shadow-premium)] backdrop-blur-sm sm:block">
            <SearchAutocomplete placeholder="Search products, brands, or categories" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="w-full no-underline sm:w-auto">
              <Button size="lg" className="h-12 w-full bg-brand-600 px-7 text-white hover:bg-brand-700 sm:w-auto">
                Shop all products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="#store-photos" className="w-full no-underline sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-white/30 bg-white/10 px-7 text-white shadow-none hover:bg-white/20 sm:w-auto"
              >
                See the store
              </Button>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-sm text-white/75">
            {SERVICE_ITEMS.map(({ label, icon: Icon }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4 text-white/55" strokeWidth={1.75} aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
