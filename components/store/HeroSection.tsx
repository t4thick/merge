import Image from 'next/image'
import Link from 'next/link'
import { Clock, Package, Truck } from 'lucide-react'
import { formatInStockCount } from '@/lib/catalog-stats'
import { StoreLogo } from '@/components/ui/StoreLogo'
import { Button } from '@/components/ui/button'
import { SearchAutocomplete } from '@/components/store/SearchAutocomplete'

function heroStats(inStockCount: number) {
  const stockLabel = formatInStockCount(inStockCount)
  return [
    { icon: Package, label: stockLabel },
    { icon: Truck, label: 'Store pickup in Columbus' },
    { icon: Clock, label: 'Ships within 24h' },
  ] as const
}

function heroSubtitle(inStockCount: number): string {
  const countPart =
    inStockCount > 0
      ? `${inStockCount.toLocaleString()} products`
      : 'Products'
  return `${countPart} from West Africa & the Caribbean. Pickup in Columbus or shipped nationwide.`
}

function heroSubtitleDesktop(inStockCount: number): string {
  const countPart =
    inStockCount > 0
      ? `${inStockCount.toLocaleString()} products`
      : 'Products'
  return `${countPart} from West Africa & the Caribbean — fufu, palm oil, spices, drinks & more. Pickup in Columbus or shipped nationwide.`
}

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  const stats = heroStats(inStockCount)

  return (
    <section className="overflow-hidden border-b border-earth-200" aria-label="Welcome to Lovely Queen Market">

      {/* ── MOBILE ─────────────────────────────────────────────────────────── */}
      <div className="sm:hidden">
        <div className="relative flex h-[180px]" aria-hidden>
          <div className="relative flex-1 overflow-hidden">
            <Image
              src="/images/hero/grocery-aisle.png"
              alt=""
              fill
              priority
              sizes="50vw"
              quality={75}
              className="object-cover object-[center_30%]"
            />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <Image
              src="/images/hero/textiles-aisle.png"
              alt=""
              fill
              priority
              sizes="50vw"
              quality={75}
              className="object-cover object-center"
            />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-px bg-white/60" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="store-container pb-8 pt-0 text-center">
          <div className="flex justify-center">
            <StoreLogo variant="mark" linked={false} className="mx-auto" />
          </div>
          <h1 className="mt-2 text-balance text-[2rem] font-bold leading-[1.1] tracking-tight text-earth-900">
            African &amp; Caribbean groceries,{' '}
            <span className="text-brand-700">delivered fast.</span>
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-earth-600">
            {heroSubtitle(inStockCount)}
          </p>

          <div className="mt-4 w-full">
            <SearchAutocomplete placeholder="Search for jollof rice, palm oil, plantain…" />
          </div>

          <div className="mt-4">
            <Link href="/shop" className="no-underline">
              <Button size="lg" className="h-12 w-full text-[15px] font-semibold">
                Shop all products
              </Button>
            </Link>
            <p className="mt-3">
              <Link
                href="/shop#categories"
                className="text-sm font-semibold text-brand-700 no-underline hover:text-brand-800"
              >
                Browse categories →
              </Link>
            </p>
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-earth-500">
            {stats.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── DESKTOP ────────────────────────────────────────────────────────── */}
      <div className="hero-split hidden sm:block">
        <div className="hero-split__panel hero-split__panel--left" aria-hidden>
          <Image
            src="/images/hero/grocery-aisle.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 46vw, 42vw"
            quality={75}
            className="object-cover object-[center_35%]"
          />
          <div className="hero-split__panel-mask--left absolute inset-0" />
        </div>

        <div className="hero-split__panel hero-split__panel--right" aria-hidden>
          <Image
            src="/images/hero/textiles-aisle.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 46vw, 42vw"
            quality={75}
            className="object-cover object-center"
          />
          <div className="hero-split__panel-mask--right absolute inset-0" />
        </div>

        <div className="hero-split__center-band" aria-hidden />

        <div className="hero-split__content store-container">
          <div className="mx-auto w-full max-w-3xl text-center">
            <div className="flex justify-center">
              <StoreLogo variant="mark" linked={false} />
            </div>
            <h1 className="mt-4 text-balance text-5xl font-bold tracking-tight text-earth-900 lg:text-[3.5rem] lg:leading-[1.08]">
              African &amp; Caribbean groceries,
              <br />
              <span className="text-brand-700">delivered fast.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-earth-600 sm:text-lg">
              {heroSubtitleDesktop(inStockCount)}
            </p>

            <div className="mx-auto mt-8 max-w-xl shadow-[0_8px_30px_rgb(0_0_0/0.06)]">
              <SearchAutocomplete placeholder="Search for jollof rice, palm oil, plantain…" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/shop" className="no-underline">
                <Button size="lg" className="h-11 min-w-[200px] px-8">
                  Shop all products
                </Button>
              </Link>
              <Link
                href="/shop#categories"
                className="text-sm font-semibold text-brand-700 no-underline hover:text-brand-800"
              >
                Browse categories →
              </Link>
            </div>

            <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-earth-600">
              {stats.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
