import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, CreditCard, MapPin, RotateCcw, Truck } from 'lucide-react'
import { createClientOptional } from '@/lib/supabase/server'
import { fetchFrequentlyBoughtTogether } from '@/lib/supabase/products'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductStickyBar } from '@/components/store/ProductStickyBar'
import { ProductCard } from '@/components/ProductCard'
import { RecordRecentlyViewed } from '@/components/store/RecordRecentlyViewed'
import { RecentlyViewed } from '@/components/store/RecentlyViewed'
import { BackToTop } from '@/components/store/BackToTop'
import { FrequentlyBoughtTogether } from '@/components/store/FrequentlyBoughtTogether'
import { ProductReviews } from '@/components/store/ProductReviews'
import { ProductGallery } from '@/components/store/ProductGallery'
import { WishlistButton } from '@/components/store/WishlistButton'
import { ProductStockLabel } from '@/components/store/ProductStockLabel'
import { extractPackSize } from '@/lib/product-display'
import { formatMoney } from '@/lib/utils'
import type { Product } from '@/types'

export const dynamic = 'force-dynamic'

async function loadProduct(id: string): Promise<Product | null> {
  const supabase = await createClientOptional()
  if (!supabase) return null
  const { data } = await supabase.from('products').select('*, image_urls').eq('id', id).single()
  return (data as Product | null) ?? null
}

async function loadRelated(category: string, excludeId: string): Promise<Product[]> {
  const supabase = await createClientOptional()
  if (!supabase) return []
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('id', excludeId)
    .eq('in_stock', true)
    .limit(4)
  return (data as Product[]) ?? []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await loadProduct(id)
  if (!product) return { title: 'Product not found', robots: { index: false } }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const productUrl = `${siteUrl}/products/${product.id}`
  const description = product.description ?? `${product.name} — ${product.category} from Kintampo African Market, Columbus OH.`

  return {
    title: product.name,
    description,
    openGraph: {
      type: 'website',
      url: productUrl,
      title: product.name,
      description,
      siteName: 'Kintampo African Market',
      ...(product.image_url ? { images: [{ url: product.image_url, alt: product.name }] } : {}),
    },
    twitter: {
      card: product.image_url ? 'summary_large_image' : 'summary',
      title: product.name,
      description,
      ...(product.image_url ? { images: [product.image_url] } : {}),
    },
  }
}

const TRUST = [
  { icon: CreditCard, label: 'Secure checkout' },
  { icon: Truck, label: 'Pickup or shipping' },
  { icon: RotateCcw, label: 'Easy returns' },
] as const

function ProductPurchaseBlock({ product }: { product: Product }) {
  const packSize = extractPackSize(product)

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-3xl font-semibold tracking-tight text-earth-900 tabular-nums sm:text-4xl">
          {formatMoney(product.price)}
        </p>
        {packSize && (
          <span className="text-sm font-medium text-earth-500">{packSize}</span>
        )}
      </div>

      <div className="mt-3">
        <ProductStockLabel inStock={product.in_stock} />
      </div>

      <div id="product-cta" className="mt-5 rounded-xl border border-earth-200 bg-white p-5 lg:sticky lg:top-24">
        <AddToCartButton product={product} />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {TRUST.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-md border border-earth-200 bg-earth-50 px-2.5 py-1.5 text-[11px] font-medium text-earth-700"
          >
            <Icon className="h-3 w-3 shrink-0 text-brand-600" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </>
  )
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await loadProduct(id)
  if (!product) notFound()

  const [related, fbt] = await Promise.all([
    loadRelated(product.category, product.id),
    fetchFrequentlyBoughtTogether(product.category, product.id, 3),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.image_url ?? undefined,
    url: `${siteUrl}/products/${product.id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'LocalBusiness',
        name: 'Kintampo African Market',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1668 E Dublin Granville Rd',
          addressLocality: 'Columbus',
          addressRegion: 'OH',
          postalCode: '43229',
          addressCountry: 'US',
        },
      },
    },
  }

  return (
    <div className="bg-white">
      {/* JSON-LD for Google Shopping / rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecordRecentlyViewed product={product} />
      <div className="store-container py-6 sm:py-8 lg:py-10">
        <Link
          href="/shop"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-earth-600 no-underline transition-colors hover:text-earth-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to shop
        </Link>

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          <ProductGallery
            mainImage={product.image_url}
            extraImages={product.image_urls}
            productName={product.name}
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              {product.category}
            </p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-earth-900 sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>
              <WishlistButton productId={product.id} />
            </div>

            <ProductPurchaseBlock product={product} />
            <ProductStickyBar product={product} sentinelId="product-cta" />

            {product.description && (
              <div className="mt-6 border-t border-earth-100 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-earth-500 mb-2">
                  About this product
                </h2>
                <p className="max-w-xl text-[15px] leading-relaxed text-earth-700">
                  {product.description}
                </p>
              </div>
            )}

            <p className="mt-5 flex items-center gap-2 text-xs text-earth-500">
              <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              In-store pickup available in Columbus, OH
            </p>
          </div>
        </div>

      </div>

      <FrequentlyBoughtTogether anchor={product} suggestions={fbt} />

      {related.length > 0 && (
        <section className="border-t border-earth-200 bg-white py-12 sm:py-16">
          <div className="store-container">
            <h2 className="text-xl font-semibold tracking-tight text-earth-900 sm:text-2xl">
              More in {product.category}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductReviews productId={product.id} />
      <RecentlyViewed excludeId={product.id} />
      <BackToTop />
    </div>
  )
}
