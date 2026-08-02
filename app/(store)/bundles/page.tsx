import type { Metadata } from 'next'
import { PageHeader } from '@/components/store/PageHeader'
import { BundleCard } from '@/components/store/BundleCard'
import { fetchActiveBundles } from '@/lib/supabase/bundles'

export const metadata: Metadata = {
  title: 'Kits & Bundles',
  description: 'Meal kits and product bundles — add the full set in one tap.',
}

export const revalidate = 60

export default async function BundlesPage() {
  const bundles = await fetchActiveBundles()

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        eyebrow="Shop"
        title="Kits & bundles"
        subtitle="Add a full set in one tap."
      />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container">
          {bundles.length === 0 ? (
            <div className="premium-card px-6 py-12 text-center text-sm text-earth-500">
              No kits available right now.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((bundle) => (
                <li key={bundle.id}>
                  <BundleCard bundle={bundle} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
