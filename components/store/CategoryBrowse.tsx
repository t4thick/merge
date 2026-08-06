import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/store/CategoryIcon'
import { getCategoryImage } from '@/lib/constants/category-images'
import { isFashionCategory } from '@/lib/constants/categories'

type CategoryBrowseProps = {
  displayCategories: readonly string[]
  categoryCount: Record<string, number>
  fashionCount?: number
}

export function CategoryBrowse({
  displayCategories,
  categoryCount,
  fashionCount = 0,
}: CategoryBrowseProps) {
  const fashionImage =
    getCategoryImage('African Prints') ?? getCategoryImage('Ready-to-wear')

  return (
    <section id="categories" className="page-section bg-white">
      <div className="store-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Shop by category</h2>
            <p className="section-subtitle">
              {(() => {
                const stocked = Object.values(categoryCount).filter((n) => n > 0).length
                const total = Object.values(categoryCount).reduce((a, b) => a + b, 0)
                return total > 0
                  ? `${stocked} departments · ${total.toLocaleString()} products in stock`
                  : `${stocked} departments`
              })()}
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 px-1 text-sm font-medium text-earth-600 no-underline hover:text-earth-900"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {fashionCount > 0 && (
          <Link
            href="/fashion"
            className="group relative mt-8 flex min-h-[7.5rem] overflow-hidden rounded-2xl border border-earth-200 bg-earth-950 no-underline shadow-[var(--shadow-card)] transition-shadow duration-150 hover:shadow-[var(--shadow-card-hover)] sm:min-h-[8.5rem]"
          >
            {fashionImage && (
              <Image
                src={fashionImage}
                alt=""
                fill
                quality={80}
                sizes="(max-width:768px) 100vw, 1100px"
                className="object-cover object-center opacity-55 transition-transform duration-200 group-hover:scale-[1.02]"
                aria-hidden
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-earth-950/90 via-earth-950/55 to-transparent" />
            <span className="relative flex w-full items-end justify-between gap-4 p-5 sm:p-6">
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  Department
                </span>
                <span className="mt-1 block text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Fashion
                </span>
                <span className="mt-1 block text-sm text-white/80">
                  {fashionCount.toLocaleString()} items · prints, lace, ready-to-wear &amp; hair
                </span>
              </span>
              <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-earth-900 transition-transform duration-150 group-hover:translate-x-0.5">
                Shop fashion
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </span>
          </Link>
        )}

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {displayCategories.map((cat) => {
            const imageUrl = getCategoryImage(cat)
            const count = categoryCount[cat] ?? 0

            return (
              <li key={cat} className="min-w-0">
                <Link
                  href={
                    isFashionCategory(cat)
                      ? `/fashion?category=${encodeURIComponent(cat)}`
                      : `/shop?category=${encodeURIComponent(cat)}`
                  }
                  className="category-tile group block min-w-0 no-underline"
                >
                  <div className="relative aspect-square overflow-hidden bg-earth-50">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={cat}
                        fill
                        quality={90}
                        unoptimized={imageUrl.startsWith('/images/categories/')}
                        priority={cat === 'Beverages' || cat === 'Bread'}
                        className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center bg-earth-100">
                        <CategoryIcon category={cat} className="h-10 w-10 text-earth-500" />
                      </span>
                    )}
                  </div>
                  <div className="border-t border-earth-100 p-4">
                    <h3 className="line-clamp-1 text-sm font-medium text-earth-900">{cat}</h3>
                    <p className="mt-1 text-xs text-earth-500">
                      {count > 0 ? `${count} item${count === 1 ? '' : 's'}` : 'View'}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
