import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FEATURED_COLLECTIONS } from '@/lib/constants/collections'
import {
  getBeveragesCollectionImage,
  getCategoryImage,
  getCosmeticsCollectionImage,
} from '@/lib/constants/category-images'

const COLLECTION_CATEGORY: Record<string, string> = {
  staples: 'Flours & Rice',
  produce: 'Fresh Produce',
}

export function FeaturedCollections() {
  const collections = FEATURED_COLLECTIONS.map((col) => {
    if (col.id === 'beverages') {
      return { ...col, image: getBeveragesCollectionImage() }
    }
    if (col.id === 'beauty') {
      return { ...col, image: getCosmeticsCollectionImage() }
    }
    const cat = COLLECTION_CATEGORY[col.id]
    const fromCat = cat ? getCategoryImage(cat) : undefined
    return fromCat ? { ...col, image: fromCat } : col
  })

  return (
    <section className="page-section bg-earth-50">
      <div className="store-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Shop by department</h2>
            <p className="section-subtitle">Rice &amp; flour, fresh produce, drinks, beauty &amp; more.</p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 no-underline hover:text-brand-800"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="-mx-4 mt-8 sm:mx-0">
          <div className="flex gap-4 overflow-x-auto scrollbar-none px-4 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={col.href}
                className="group relative block aspect-[4/3] min-w-[260px] shrink-0 overflow-hidden rounded-xl border border-earth-200 bg-white shadow-[var(--shadow-card)] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-card-hover)] sm:min-w-0 sm:shrink"
              >
                <Image
                  src={col.image}
                  alt=""
                  fill
                  quality={90}
                  unoptimized={col.image.startsWith('/images/categories/')}
                  className="object-cover object-center transition-opacity duration-150 group-hover:opacity-95"
                  sizes="(max-width:640px) 75vw, 25vw"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-950/80 via-earth-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-semibold text-white">{col.title}</h3>
                  <p className="mt-0.5 text-xs text-white/80">{col.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
