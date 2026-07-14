import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatInStockCount } from '@/lib/catalog-stats'
import { Button } from '@/components/ui/button'
import { SearchAutocomplete } from '@/components/store/SearchAutocomplete'

function heroStats(inStockCount: number) {
  return [
    formatInStockCount(inStockCount),
    'Store pickup · Columbus OH',
    'Ships in the US within 24h',
  ] as const
}

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  const stats = heroStats(inStockCount)

  return (
    <section className="border-b border-earth-200 bg-white" aria-label="Welcome to Kintampo African Market">
      <div className="store-container py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-earth-500 sm:text-xs">
            Columbus, OH · Pickup &amp; US shipping
          </p>

          <h1 className="mt-4 text-center text-[2.5rem] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] text-earth-950 sm:text-6xl lg:text-[4.5rem]">
            African &amp; Caribbean
            <br />
            groceries
          </h1>

          <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-earth-600 sm:mt-6 sm:max-w-xl sm:text-base">
            {inStockCount > 0
              ? `${inStockCount.toLocaleString()} products — fufu, palm oil, spices, drinks & more. `
              : 'Fufu, palm oil, spices, drinks & more. '}
            Pickup in Columbus or shipped nationwide.
          </p>

          <div className="mx-auto mt-7 max-w-xl sm:mt-8">
            <SearchAutocomplete placeholder="Search jollof rice, palm oil, plantain…" />
          </div>

          <div className="mt-5 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:justify-center">
            <Link href="/shop" className="w-full no-underline sm:w-auto">
              <Button size="lg" className="h-12 w-full px-8 text-[15px] sm:w-auto sm:min-w-[220px]">
                Shop all products
              </Button>
            </Link>
            <Link
              href="/shop#categories"
              className="inline-flex h-11 items-center gap-1 text-sm font-semibold text-earth-900 no-underline underline-offset-4 hover:underline"
            >
              Browse categories
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:mt-10">
            {stats.map((label) => (
              <li
                key={label}
                className="inline-flex items-center rounded-full border border-earth-200 px-3.5 py-1.5 text-xs font-medium text-earth-600"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
