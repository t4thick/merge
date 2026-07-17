import Image from 'next/image'
import Link from 'next/link'
import { Phone, Scissors } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { FASHION_CATEGORIES } from '@/lib/constants/categories'
import { getCategoryImage } from '@/lib/constants/category-images'
import type { Product } from '@/types'

const SERVICE_PHONE = '(614) 377-8297'
const SERVICE_PHONE_HREF = 'tel:+16143778297'

const DEPARTMENT_COPY: Record<(typeof FASHION_CATEGORIES)[number], { title: string; blurb: string }> = {
  'African Prints': {
    title: 'African Prints',
    blurb: 'Ankara & wax by the yard',
  },
  Lace: {
    title: 'Lace',
    blurb: 'Lace fabric & trim',
  },
  'Ready-to-wear': {
    title: 'Ready-to-wear',
    blurb: 'Dresses, tops & sets',
  },
  'Hair & Braiding': {
    title: 'Hair & Braiding',
    blurb: 'Extensions, tools & supplies',
  },
}

type FashionSectionProps = {
  products: Product[]
  categoryCount: Record<string, number>
}

export function FashionSection({ products, categoryCount }: FashionSectionProps) {
  const fashionStock = FASHION_CATEGORIES.reduce(
    (sum, cat) => sum + (categoryCount[cat] ?? 0),
    0
  )
  const live = fashionStock > 0

  return (
    <section
      id="fashion"
      className="page-section border-t border-earth-200 bg-earth-50"
      aria-labelledby="fashion-title"
    >
      <div className="store-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-earth-500">
                Fashion &amp; hair
              </p>
              {!live && (
                <span className="rounded-md bg-accent-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-800">
                  Coming soon
                </span>
              )}
            </div>
            <h2 id="fashion-title" className="section-title mt-2">
              {live
                ? 'Prints, lace, ready-to-wear & braiding.'
                : 'Fashion & braiding — launching soon.'}
            </h2>
            <p className="section-subtitle mt-2">
              {live
                ? `Shop fabric and apparel online · ${fashionStock} in stock. Book braiding by phone.`
                : 'Prints, lace, ready-to-wear, and hair supplies are on the way. Braiding appointments are open now — call to book.'}
            </p>
          </div>
          <a href={SERVICE_PHONE_HREF} className="no-underline">
            <Button variant="outline" className="min-h-11">
              <Phone className="h-4 w-4" aria-hidden />
              Book braiding · {SERVICE_PHONE}
            </Button>
          </a>
        </div>

        <div className="relative mt-10">
          {!live && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-6 sm:items-center sm:pt-0">
              <span className="rounded-full border border-earth-200 bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-earth-800 shadow-[var(--shadow-card)]">
                Online shop coming soon
              </span>
            </div>
          )}

          <div
            className={
              live
                ? 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5'
                : 'grid grid-cols-2 gap-3 opacity-70 sm:gap-4 lg:grid-cols-4 lg:gap-5'
            }
          >
            {FASHION_CATEGORIES.map((category) => {
              const copy = DEPARTMENT_COPY[category]
              const image = getCategoryImage(category)
              const count = categoryCount[category] ?? 0
              const href = `/shop?category=${encodeURIComponent(category)}`
              const tileClass =
                'group overflow-hidden rounded-2xl border border-earth-200 bg-white shadow-[var(--shadow-card)] transition-all duration-150'

              const body = (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden bg-earth-100">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        quality={90}
                        className={
                          live
                            ? 'object-cover object-center transition-transform duration-150 group-hover:scale-[1.02]'
                            : 'object-cover object-center'
                        }
                        sizes="(max-width:640px) 50vw, 25vw"
                        aria-hidden
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-earth-400">
                        <Scissors className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-earth-900 sm:text-base">{copy.title}</h3>
                    <p className="mt-1 text-xs text-earth-500 sm:text-sm">{copy.blurb}</p>
                    {live && count > 0 && (
                      <p className="mt-2 text-xs font-medium text-brand-700">{count} in stock</p>
                    )}
                    {!live && (
                      <p className="mt-2 text-xs font-medium text-earth-400">Coming soon</p>
                    )}
                  </div>
                </>
              )

              if (!live) {
                return (
                  <div key={category} className={tileClass} aria-disabled>
                    {body}
                  </div>
                )
              }

              return (
                <Link
                  key={category}
                  href={href}
                  className={`${tileClass} no-underline hover:-translate-y-0.5 hover:border-earth-300 hover:shadow-[var(--shadow-card-hover)]`}
                >
                  {body}
                </Link>
              )
            })}
          </div>
        </div>

        {live && products.length > 0 && (
          <div className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-earth-900">
                  Featured fashion
                </h3>
                <p className="mt-1 text-sm text-earth-500">Latest prints, lace &amp; apparel in stock.</p>
              </div>
              <Link
                href="/shop?category=Ready-to-wear"
                className="inline-flex min-h-11 shrink-0 items-center px-1 text-sm font-medium text-earth-600 no-underline hover:text-earth-900"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {products.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 2} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-earth-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-earth-100 text-earth-700">
              <Scissors className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-earth-900">Braiding appointments — open now</p>
              <p className="mt-1 text-sm text-earth-500">
                Call to book. Custom sewn pieces available on request.
              </p>
            </div>
          </div>
          <a href={SERVICE_PHONE_HREF} className="shrink-0 no-underline">
            <Button className="min-h-11 w-full sm:w-auto">Call {SERVICE_PHONE}</Button>
          </a>
        </div>
      </div>
    </section>
  )
}
