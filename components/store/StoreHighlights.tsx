import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const HIGHLIGHTS = [
  {
    src: '/images/store/pantry-shelf.png',
    title: 'Pantry staples',
    blurb: 'Powdered milk, malt drinks, cereals & more',
    href: '/shop?category=Dairy%20And%20Tea',
  },
  {
    src: '/images/store/beauty-oils.png',
    title: 'Beauty & oils',
    blurb: 'Natural oils, cocoa butter, skin care',
    href: '/shop?category=Cosmetics',
  },
  {
    src: '/images/store/aisle-depth.png',
    title: 'Full aisles',
    blurb: 'Snacks, spices, jewelry & grocery',
    href: '/shop',
  },
] as const

export function StoreHighlights() {
  return (
    <section className="page-section border-t border-earth-200 bg-white" aria-labelledby="store-highlights-title">
      <div className="store-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-earth-500">
              From our Columbus store
            </p>
            <h2 id="store-highlights-title" className="section-title mt-2">
              What you’ll find on the shelves.
            </h2>
            <p className="section-subtitle mt-2">
              Real inventory from the floor — same products available for pickup and shipping.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-earth-700 no-underline hover:text-earth-900"
          >
            Shop all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {HIGHLIGHTS.map((item) => (
            <Link
              key={item.src}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-earth-200 bg-white shadow-[var(--shadow-card)] no-underline transition-all duration-150 hover:-translate-y-0.5 hover:border-earth-300 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="relative aspect-[4/3] bg-earth-100">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  quality={88}
                  sizes="(max-width:640px) 100vw, 33vw"
                  className="object-cover object-center transition-transform duration-150 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-earth-900 sm:text-base">{item.title}</h3>
                <p className="mt-1 text-xs text-earth-500 sm:text-sm">{item.blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid overflow-hidden rounded-2xl border border-earth-200 bg-earth-50 shadow-[var(--shadow-card)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[240px] bg-earth-100 sm:min-h-[300px]">
            <Image
              src="/images/store/house-drinks.png"
              alt="Kintampo house drinks — Amuduro herbal drink and Sobolo hibiscus drink"
              fill
              quality={90}
              sizes="(max-width:1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-earth-500">
              House drinks
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-earth-900 sm:text-2xl">
              Amuduro &amp; Sobolo — made for the store.
            </h3>
            <p className="mt-3 text-sm leading-6 text-earth-600">
              Natural herbal Amuduro and traditional hibiscus Sobolo. Ask in-store or search the
              shop for bottled drinks.
            </p>
            <Link href="/shop?category=Beverages" className="mt-6 no-underline">
              <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
                Shop beverages
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
