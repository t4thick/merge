import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE } from '@/lib/constants/store'

export function HeroSection({ inStockCount }: { inStockCount: number }) {
  const stockLine =
    inStockCount > 0
      ? `${inStockCount.toLocaleString()} products in stock. Pickup, Ohio delivery, or ship nationwide.`
      : 'Pickup in Columbus, Ohio delivery, or ship nationwide.'

  return (
    <section className="border-b border-earth-200 bg-earth-950" aria-label={STORE.name}>
      <div className="relative min-h-[78vh] w-full sm:min-h-[85vh]">
        <Image
          src="/images/store/aisle-front.png"
          alt="Inside Kintampo African Market — stocked aisles with rice, drinks, and grocery shelves"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/50 to-earth-950/20" />

        <div className="store-container relative flex min-h-[78vh] flex-col justify-end pb-12 pt-28 sm:min-h-[85vh] sm:pb-16 lg:pb-20">
          <h1 className="hero-brand animate-fade-in text-[clamp(3.25rem,12vw,7.5rem)] text-white">
            Kintampo<span className="text-accent-400">.</span>
          </h1>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.28em] text-white/70 sm:text-xs">
            African Market
          </p>
          <p className="mt-6 max-w-xl text-balance text-xl font-semibold leading-snug tracking-[-0.03em] text-white sm:text-2xl lg:text-[1.75rem]">
            Groceries from Ghana &amp; the Caribbean — online and in store.
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/78 sm:text-base">
            {stockLine}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="w-full no-underline sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full bg-brand-600 px-8 text-white transition-colors duration-150 hover:bg-brand-700 sm:w-auto"
              >
                Shop all products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link href="#store-photos" className="w-full no-underline sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-white/30 bg-white/10 px-8 text-white shadow-none transition-colors duration-150 hover:bg-white/20 sm:w-auto"
              >
                See the store
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
