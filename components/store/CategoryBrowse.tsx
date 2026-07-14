import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/store/CategoryIcon'
import { getCategoryImage } from '@/lib/constants/category-images'
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories'

type CategoryBrowseProps = {
  displayCategories: readonly string[]
  categoryCount: Record<string, number>
}

export function CategoryBrowse({ displayCategories, categoryCount }: CategoryBrowseProps) {
  return (
    <section id="categories" className="page-section bg-white">
      <div className="store-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Shop by category</h2>
            <p className="section-subtitle">
              {(() => {
                const total = Object.values(categoryCount).reduce((a, b) => a + b, 0)
                return total > 0
                  ? `${PRODUCT_CATEGORIES.length} departments · ${total.toLocaleString()} products in stock`
                  : `${PRODUCT_CATEGORIES.length} departments`
              })()}
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 no-underline hover:text-brand-800"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {displayCategories.map((cat) => {
            const imageUrl = getCategoryImage(cat)
            const count = categoryCount[cat] ?? 0

            return (
              <li key={cat}>
                <Link
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="category-tile group block no-underline"
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
                        className="object-cover object-center transition-opacity duration-150 group-hover:opacity-95"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center bg-earth-100">
                        <CategoryIcon category={cat} className="h-10 w-10 text-earth-500" />
                      </span>
                    )}
                  </div>
                  <div className="border-t border-earth-100 p-3">
                    <h3 className="line-clamp-1 text-sm font-medium text-earth-900">{cat}</h3>
                    <p className="mt-0.5 text-xs text-earth-500">
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
