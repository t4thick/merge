import Link from 'next/link'
import { Suspense } from 'react'
import { ProductCard } from '@/components/ProductCard'
import {
  ActiveFilterChips,
  ShopFiltersBar,
  ShopFiltersSidebar,
  SortMenu,
} from '@/components/shop/ShopFilters'
import { fetchCategoryCounts, fetchDistinctBrands, fetchProductsForShop, type SortOption } from '@/lib/supabase/products'
import { RecentlyViewed } from '@/components/store/RecentlyViewed'
import { BackToTop } from '@/components/store/BackToTop'
import type { Product } from '@/types'

export const dynamic = 'force-dynamic'

const VALID_SORTS: SortOption[] = ['featured', 'newest', 'price-asc', 'price-desc', 'name-asc']

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    brand?: string
    dietary?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    sort?: string
  }>
}) {
  const p = await searchParams
  const minN = p.minPrice ? parseFloat(p.minPrice) : NaN
  const maxN = p.maxPrice ? parseFloat(p.maxPrice) : NaN
  const sort = (VALID_SORTS as string[]).includes(p.sort ?? '')
    ? (p.sort as SortOption)
    : 'featured'

  const [{ products, errorMessage }, categoryCount, brands] = await Promise.all([
    fetchProductsForShop({
      q: p.q,
      category: p.category,
      brand: p.brand,
      dietary: p.dietary,
      minPrice: Number.isNaN(minN) ? undefined : minN,
      maxPrice: Number.isNaN(maxN) ? undefined : maxN,
      inStockOnly: p.inStock === '1',
      sort,
    }),
    fetchCategoryCounts(),
    fetchDistinctBrands(),
  ])

  const title = p.category
    ? p.category
    : p.brand
      ? p.brand
      : p.q
        ? `Results for "${p.q}"`
        : 'All products'
  const subtitle = p.category
    ? `${products.length} product${products.length === 1 ? '' : 's'} in ${p.category.toLowerCase()}`
    : p.q
      ? `${products.length} match${products.length === 1 ? '' : 'es'}`
      : `${products.length} product${products.length === 1 ? '' : 's'} across all departments`

  return (
    <>
    <div className="min-h-screen bg-white">
      <div className="border-b border-earth-200 bg-white">
        <div className="store-container py-6 sm:py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-earth-500">Shop</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-earth-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1.5 text-base font-semibold tabular-nums text-earth-900">{subtitle}</p>
            </div>
            <div className="hidden lg:block">
              <SortMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="store-container py-6 sm:py-8 lg:py-10">
        <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden md:block">
            <div className="sticky top-24">
              <Suspense fallback={<p className="muted">Loading filters…</p>}>
                <ShopFiltersSidebar categoryCount={categoryCount} brands={brands} />
              </Suspense>
            </div>
          </aside>

          <div>
            <div className="sticky top-14 z-40 -mx-4 border-b border-earth-200 bg-white/95 px-4 py-2.5 backdrop-blur-sm sm:top-16 md:hidden lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
              <Suspense fallback={null}>
                <ShopFiltersBar categoryCount={categoryCount} />
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <div className="mt-3 lg:mt-4">
                <ActiveFilterChips />
              </div>
            </Suspense>

            {errorMessage && (
              <p className="error mt-4">
                {errorMessage} <Link href="/shop">Reload</Link>
              </p>
            )}

            {products.length === 0 && !errorMessage ? (
              <div className="mt-8 rounded-xl border border-dashed border-earth-300 bg-earth-50 px-6 py-16 text-center">
                <p className="text-base font-semibold text-earth-900">No products found</p>
                <p className="mt-1 text-sm text-earth-600">
                  Try a different category or remove some filters.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block text-sm font-semibold text-brand-700 no-underline hover:underline"
                >
                  Clear all filters →
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <RecentlyViewed />
    <BackToTop />
    </>
  )
}
