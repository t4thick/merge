export const revalidate = 60 // Refresh homepage data every 60 seconds — keeps stock status current

import { HeroSection } from '@/components/store/HeroSection'
import { TrustStrip } from '@/components/store/TrustStrip'
import { CategoryBrowse } from '@/components/store/CategoryBrowse'
import { FeaturedCollections } from '@/components/store/FeaturedCollections'
import { StoreHighlights } from '@/components/store/StoreHighlights'
import { HomepageReviews } from '@/components/store/HomepageReviews'
import { ProductShowcase } from '@/components/store/ProductShowcase'
import { RecentlyViewed } from '@/components/store/RecentlyViewed'
import { VisitSection } from '@/components/store/VisitSection'
import { AdditionalServices } from '@/components/store/AdditionalServices'
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories'
import { fetchHomepageReviews } from '@/lib/supabase/homepage-reviews'
import { fetchHomepageProducts } from '@/lib/supabase/products'

const HOME_CATEGORY_ORDER = [
  'Flours & Rice',
  'Fresh Produce',
  'Beverages',
  'Meat and Seafood',
  'Spices',
  'Dairy And Tea',
  'Bread',
  'Snack',
  'Canned',
  'Cosmetics',
] as const

export default async function Home() {
  const [
    { staples, trending, newArrivals, categoryCount, inStockCount, errorMessage },
    reviewData,
  ] = await Promise.all([fetchHomepageProducts(), fetchHomepageReviews()])

  const withStock = PRODUCT_CATEGORIES.filter((c) => (categoryCount[c] ?? 0) > 0)
  const ordered = HOME_CATEGORY_ORDER.filter((c) => (categoryCount[c] ?? 0) > 0)
  const rest = withStock.filter((c) => !(HOME_CATEGORY_ORDER as readonly string[]).includes(c))
  const displayCategories =
    ordered.length > 0 ? [...ordered, ...rest].slice(0, 12) : PRODUCT_CATEGORIES.slice(0, 12)

  return (
    <>
      <HeroSection inStockCount={inStockCount} />
      <StoreHighlights />
      <CategoryBrowse displayCategories={displayCategories} categoryCount={categoryCount} />
      {staples.length > 0 && (
        <ProductShowcase
          title="Yam, fufu & staples"
          subtitle="Plantain, fufu flour, yam box & pantry essentials."
          products={staples}
          errorMessage={errorMessage}
          viewAllHref="/shop?category=Flours%20%26%20Rice"
          priorityCount={4}
        />
      )}
      <ProductShowcase
        title="Trending this week"
        subtitle="Popular across departments — drinks, spices, snacks & more."
        products={trending}
        errorMessage={errorMessage}
        priorityCount={2}
      />
      <FeaturedCollections />
      <ProductShowcase
        title="New arrivals"
        subtitle="Latest products added to inventory."
        products={newArrivals}
        errorMessage={errorMessage}
      />
      <RecentlyViewed />
      <HomepageReviews
        reviews={reviewData.reviews}
        totalCount={reviewData.totalCount}
        averageRating={reviewData.averageRating}
      />
      <TrustStrip inStockCount={inStockCount} />
      <AdditionalServices />
      <VisitSection />
    </>
  )
}
