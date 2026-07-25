import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, PackageCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE } from '@/lib/constants/store'

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  const stockLabel =
    inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock` : 'Products in stock'

  return (
    <section className="border-b border-earth-200 bg-white" aria-label={STORE.name}>
      <div className="store-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-earth-500">
            {STORE.name} · Columbus, OH
          </p>
          <h1 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-earth-950 sm:text-5xl lg:text-[3.25rem]">
            African &amp; Caribbean groceries, delivered fast.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-earth-600 sm:text-lg">
            {inStockCount > 0 ? `${inStockCount.toLocaleString()} products` : 'Groceries'} from West
            Africa &amp; the Caribbean. Pickup in Columbus or shipped nationwide.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="w-full no-underline sm:w-auto">
              <Button size="lg" className="h-12 w-full bg-brand-600 px-7 text-white hover:bg-brand-700 sm:w-auto">
                Shop all products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="#categories" className="w-full no-underline sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 w-full px-7 sm:w-auto">
                Browse categories
              </Button>
            </Link>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 text-sm text-earth-700 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li className="inline-flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden />
              {stockLabel}
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden />
              Store pickup in Columbus
            </li>
            <li className="inline-flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-600" strokeWidth={1.75} aria-hidden />
              Ships within 24h
            </li>
          </ul>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-earth-100 shadow-[var(--shadow-card)] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[420px]">
          <Image
            src="/images/store/aisle-front.png"
            alt="Inside Kintampo African Market — stocked grocery aisles"
            fill
            priority
            quality={90}
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover object-[center_40%]"
          />
        </div>
      </div>
    </section>
  )
}
