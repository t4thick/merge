import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/store/PageHeader'
import { STORE, getSupportEmail, storePhonesPlain } from '@/lib/constants/store'

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Return and refund policy for grocery orders.',
}

export default function ReturnsPage() {
  const supportEmail = getSupportEmail()

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        eyebrow="Policies"
        title="Returns & refunds"
        subtitle="How we handle damaged, incorrect, or missing items."
      />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container max-w-3xl space-y-8 text-base leading-relaxed text-earth-700">
          <div className="premium-card space-y-3 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-earth-900">Damaged or incorrect items</h2>
            <p>
              Contact us within 7 days of delivery if an item arrives damaged, incorrect, or
              defective. We will arrange a replacement or refund.
            </p>
          </div>

          <div className="premium-card space-y-3 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-earth-900">Perishable food</h2>
            <p>
              Due to the perishable nature of food products, we cannot accept returns on food items
              unless they are damaged or incorrect. Non-food items in original, unopened condition
              may be returned within 14 days.
            </p>
          </div>

          <div className="premium-card space-y-3 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-earth-900">Partial fulfillment</h2>
            <p>
              If an item is unavailable after you order, we contact you promptly and refund that
              line — or offer a substitute if you prefer. You are only charged for items we fulfill.
            </p>
          </div>

          <div className="premium-card space-y-3 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-earth-900">Refund timing</h2>
            <p>
              Approved refunds go back to the original payment method within 5–10 business days,
              depending on your bank or card issuer.
            </p>
          </div>

          <div className="premium-card space-y-3 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-earth-900">How to contact us</h2>
            <p>
              Email{' '}
              <a
                href={`mailto:${supportEmail}`}
                className="font-medium text-brand-700 no-underline hover:text-brand-800"
              >
                {supportEmail}
              </a>{' '}
              with your order number, or call {storePhonesPlain()}. Store address: {STORE.address}.
            </p>
          </div>

          <p className="text-sm text-earth-600">
            Related:{' '}
            <Link href="/faq" className="font-medium text-brand-700 no-underline hover:text-brand-800">
              FAQ
            </Link>
            {' · '}
            <Link
              href="/shipping"
              className="font-medium text-brand-700 no-underline hover:text-brand-800"
            >
              Shipping &amp; pickup
            </Link>
            {' · '}
            <Link href="/terms" className="font-medium text-brand-700 no-underline hover:text-brand-800">
              Terms
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
