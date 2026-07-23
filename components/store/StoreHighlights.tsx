import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Every store photo, large and early on the homepage — not buried under product grids.
 */
export function StoreHighlights() {
  return (
    <section
      id="store-photos"
      className="scroll-mt-28 border-b border-earth-200 bg-white py-10 sm:py-14 md:scroll-mt-24"
      aria-labelledby="store-photos-title"
    >
      <div className="store-container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-earth-500">
              Real store · Columbus, OH
            </p>
            <h2 id="store-photos-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-earth-900 sm:text-3xl">
              Look inside Kintampo.
            </h2>
          </div>
          <Link href="/shop" className="no-underline">
            <Button variant="outline" className="min-h-11">
              Shop what you see
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>

        {/* Large mosaic — all photos visible without scrolling past products */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2 lg:gap-5">
          {/* Big drinks shot */}
          <Link
            href="/shop?category=Beverages"
            className="group relative col-span-2 row-span-2 min-h-[280px] overflow-hidden rounded-2xl bg-earth-100 no-underline sm:min-h-[360px] lg:min-h-0"
          >
            <Image
              src="/images/store/house-drinks.png"
              alt="Kintampo Amuduro and Sobolo house drinks"
              fill
              quality={90}
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-150 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-950/80 to-transparent p-5 pt-20">
              <p className="text-lg font-semibold text-white">Amuduro &amp; Sobolo</p>
              <p className="mt-1 text-sm text-white/75">House drinks · Shop beverages</p>
            </div>
          </Link>

          <Link
            href="/shop?category=Dairy%20And%20Tea"
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-earth-100 no-underline lg:aspect-auto lg:min-h-[170px]"
          >
            <Image
              src="/images/store/pantry-shelf.png"
              alt="Pantry staples — powdered milk, malt drinks, cereals"
              fill
              quality={88}
              sizes="(max-width:1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-950/75 to-transparent p-3 pt-12">
              <p className="text-sm font-semibold text-white">Pantry staples</p>
            </div>
          </Link>

          <Link
            href="/shop?category=Cosmetics"
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-earth-100 no-underline lg:aspect-auto lg:min-h-[170px]"
          >
            <Image
              src="/images/store/beauty-oils.png"
              alt="Beauty oils and skin care on the shelf"
              fill
              quality={88}
              sizes="(max-width:1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-150 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-950/75 to-transparent p-3 pt-12">
              <p className="text-sm font-semibold text-white">Beauty &amp; oils</p>
            </div>
          </Link>

          <Link
            href="/shop"
            className="group relative col-span-2 aspect-[16/7] overflow-hidden rounded-2xl bg-earth-100 no-underline lg:col-span-2 lg:aspect-auto lg:min-h-[170px]"
          >
            <Image
              src="/images/store/aisle-depth.png"
              alt="Store aisle with jewelry, rice, and grocery shelves"
              fill
              quality={88}
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-150 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth-950/75 to-transparent p-3 pt-12 sm:p-4">
              <p className="text-sm font-semibold text-white sm:text-base">Full aisles · snacks, spices, jewelry</p>
            </div>
          </Link>
        </div>

        {/* Second aisle angle — full width strip */}
        <div className="relative mt-3 min-h-[200px] overflow-hidden rounded-2xl sm:mt-4 sm:min-h-[260px] lg:min-h-[300px]">
          <Image
            src="/images/store/aisle-front.png"
            alt="Wide view of Kintampo African Market floor"
            fill
            quality={90}
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-950/70 via-earth-950/35 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-end p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
              1668 E Dublin Granville Rd
            </p>
            <p className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Same shelves you shop in person.
            </p>
            <Link href="#visit" className="mt-4 no-underline">
              <Button
                variant="outline"
                className="min-h-11 border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Store hours &amp; phones
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
