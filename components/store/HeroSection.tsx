import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, PackageCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE } from '@/lib/constants/store'

/**
 * Real in-store photos only (kente textiles aisle + grocery aisle) —
 * light washed background, not AI/cartoon patterning.
 */
export function HeroSection({ inStockCount }: { inStockCount: number }) {
  const stockLabel =
    inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock` : 'Products in stock'

  return (
    <section
      className="relative overflow-hidden border-b border-earth-200 bg-earth-50"
      aria-label={STORE.name}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2">
          <div className="relative">
            <Image
              src="/images/hero/textiles-aisle.png"
              alt=""
              fill
              priority
              quality={60}
              sizes="(max-width:640px) 100vw, 25vw"
              className="object-cover object-[center_30%] opacity-[0.34]"
            />
          </div>
          <div className="relative hidden sm:block">
            <Image
              src="/images/hero/grocery-aisle.png"
              alt=""
              fill
              priority
              quality={60}
              sizes="25vw"
              className="object-cover object-center opacity-[0.34]"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-white/85" />
      </div>

      <div className="store-container relative grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-20">
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
              <Button
                size="lg"
                className="h-12 w-full bg-brand-600 px-7 text-white hover:bg-brand-700 sm:w-auto"
              >
                Shop all products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="#categories" className="w-full no-underline sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 w-full bg-white/80 px-7 sm:w-auto">
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

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-earth-100 shadow-[var(--shadow-card)]">
            <Image
              src="/images/hero/textiles-aisle.png"
              alt="Real kente and African textiles on the shelf at Kintampo"
              fill
              priority
              quality={75}
              sizes="(max-width:1024px) 40vw, 20vw"
              className="object-cover object-[center_25%]"
            />
          </div>
          <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-2xl bg-earth-100 shadow-[var(--shadow-card)] sm:mt-10">
            <Image
              src="/images/hero/grocery-aisle.png"
              alt="Real grocery aisle at Kintampo African Market"
              fill
              quality={75}
              sizes="(max-width:1024px) 40vw, 20vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
