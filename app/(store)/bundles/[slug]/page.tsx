import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/store/PageHeader'
import { AddBundleToCart } from '@/components/store/AddBundleToCart'
import { fetchActiveBundles, fetchBundleBySlug } from '@/lib/supabase/bundles'
import { formatMoney } from '@/lib/utils'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bundle = await fetchBundleBySlug(slug)
  if (!bundle) return { title: 'Kit not found', robots: { index: false } }
  return {
    title: bundle.name,
    description: bundle.description ?? `${bundle.name} — kit from the store.`,
  }
}

export async function generateStaticParams() {
  const bundles = await fetchActiveBundles()
  return bundles.map((b) => ({ slug: b.slug }))
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params
  const bundle = await fetchBundleBySlug(slug)
  if (!bundle) notFound()

  const listTotal = bundle.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const discount = Math.max(0, Math.min(50, Number(bundle.discount_percent) || 0))
  const saleTotal = Math.round(listTotal * (1 - discount / 100) * 100) / 100

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        eyebrow="Kit"
        title={bundle.name}
        subtitle={bundle.description ?? undefined}
      />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container max-w-3xl">
          <div className="premium-card p-5 sm:p-6">
            <p className="text-lg font-semibold tabular-nums text-earth-900">
              {formatMoney(saleTotal)}
              {discount > 0 && (
                <span className="ml-2 text-sm font-medium text-earth-400 line-through">
                  {formatMoney(listTotal)}
                </span>
              )}
              {discount > 0 && (
                <span className="ml-2 text-sm font-medium text-accent-700">{discount}% kit price</span>
              )}
            </p>

            <h2 className="mt-6 text-base font-semibold text-earth-900">
              Includes ({bundle.items.length})
            </h2>
            <ul className="mt-3 space-y-2">
              {bundle.items.map((line) => (
                <li key={line.product.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <Link
                    href={`/products/${line.product.id}`}
                    className="font-medium text-earth-800 no-underline hover:text-brand-700"
                  >
                    {line.quantity > 1 ? `${line.quantity}× ` : ''}
                    {line.product.name}
                  </Link>
                  <span className="shrink-0 tabular-nums text-earth-600">
                    {formatMoney(line.product.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <AddBundleToCart bundle={bundle} />
            </div>
          </div>

          <p className="mt-10">
            <Link
              href="/bundles"
              className="text-sm font-semibold text-brand-700 no-underline hover:text-brand-800"
            >
              ← All kits
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
