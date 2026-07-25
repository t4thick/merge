import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin, PackageCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE } from '@/lib/constants/store'

const GROCERY_BG = [
  { src: '/images/store/aisle-front.png', alt: '', className: 'object-[center_35%]' },
  { src: '/images/store/house-drinks.png', alt: '', className: 'object-center' },
  { src: '/images/store/pantry-shelf.png', alt: '', className: 'object-center' },
  { src: '/images/store/beauty-oils.png', alt: '', className: 'object-center' },
] as const

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  const stockLabel =
    inStockCount > 0 ? `${inStockCount.toLocaleString()} products in stock` : 'Products in stock'

  return (
    <section
      className="relative overflow-hidden border-b border-earth-200 bg-earth-50"
      aria-label={STORE.name}
    >
      {/* Real grocery photos — light wash, not a dark full-bleed */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 grid grid-cols-2 lg:grid-cols-4">
          {GROCERY_BG.map((shot) => (
            <div key={shot.src} className="relative min-h-full">
              <Image
                src={shot.src}
                alt=""
                fill
                priority={shot.src.includes('aisle-front')}
                quality={75}
                sizes="(max-width:1024px) 50vw, 25vw"
                className={`object-cover opacity-[0.28] ${shot.className}`}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/72" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/80" />
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
              src="/images/store/house-drinks.png"
              alt="House drinks on the shelf at Kintampo"
              fill
              priority
              quality={88}
              sizes="(max-width:1024px) 45vw, 22vw"
              className="object-cover"
            />
          </div>
          <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-2xl bg-earth-100 shadow-[var(--shadow-card)] sm:mt-10">
            <Image
              src="/images/store/pantry-shelf.png"
              alt="Pantry staples on the shelf at Kintampo"
              fill
              quality={88}
              sizes="(max-width:1024px) 45vw, 22vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
