import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/store/PageHeader'
import { STORE, getSupportEmail, storePhonesPlain } from '@/lib/constants/store'
import { PICKUP_HOLD_HOURS } from '@/lib/orders/pickup-hold'
import {
  FREE_STANDARD_SHIPPING_SUBTOTAL,
  LOCAL_DELIVERY_FEE,
  LOCAL_DELIVERY_MIN_SUBTOTAL,
} from '@/lib/shipping'
import { LOCAL_DELIVERY_MAX_MINUTES } from '@/lib/delivery/local-delivery-eligibility'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Pickup, shipping, delivery, returns, and payment answers.',
}

const FAQS: Array<{ q: string; a: ReactNode }> = [
  {
    q: 'What are store pickup hours?',
    a: (
      <>
        Pickup is available during store hours at {STORE.address}: {STORE.hours}. Ready orders
        are held at the counter for {PICKUP_HOLD_HOURS} hours.
      </>
    ),
  },
  {
    q: 'How long does US shipping take?',
    a: (
      <>
        Standard shipping usually arrives in 3–7 business days after we ship. Express options
        (when offered at checkout) are faster. Tracking appears on your confirmation email and at{' '}
        <Link href="/track-order" className="font-medium text-brand-700 no-underline hover:text-brand-800">
          Track order
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Do you offer local delivery?',
    a: (
      <>
        Yes — within about {LOCAL_DELIVERY_MAX_MINUTES} minutes drive of the store. Minimum order $
        {LOCAL_DELIVERY_MIN_SUBTOTAL} (before delivery fee). Delivery fee is ${LOCAL_DELIVERY_FEE}.
        Driver tip is optional at checkout.
      </>
    ),
  },
  {
    q: 'Can I order by phone or WhatsApp?',
    a: (
      <>
        Yes. Call {storePhonesPlain()} during store hours, or WhatsApp the store line. Online
        checkout is still the fastest path for card payment and tracking.
      </>
    ),
  },
  {
    q: 'What is your return policy?',
    a: (
      <>
        Damaged, incorrect, or defective items: contact us within 7 days of delivery. Perishable
        food cannot be returned unless damaged or incorrect. Full details on the{' '}
        <Link href="/returns" className="font-medium text-brand-700 no-underline hover:text-brand-800">
          Returns
        </Link>{' '}
        page.
      </>
    ),
  },
  {
    q: 'What payment methods do you accept?',
    a: (
      <>
        Cards and digital wallets via Stripe at checkout. We do not store full card numbers on our
        servers.
      </>
    ),
  },
  {
    q: 'How do I track my order?',
    a: (
      <>
        Use{' '}
        <Link href="/track-order" className="font-medium text-brand-700 no-underline hover:text-brand-800">
          Track order
        </Link>{' '}
        with your order number and email. Shipped orders also include a carrier tracking link in
        status emails.
      </>
    ),
  },
  {
    q: 'When is shipping free?',
    a: (
      <>
        Standard US shipping is free on orders of ${FREE_STANDARD_SHIPPING_SUBTOTAL}+ merchandise
        subtotal. See{' '}
        <Link href="/shipping" className="font-medium text-brand-700 no-underline hover:text-brand-800">
          Shipping &amp; pickup
        </Link>{' '}
        for rates and pickup details.
      </>
    ),
  },
]

export default function FaqPage() {
  const supportEmail = getSupportEmail()

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        subtitle="Pickup, shipping, delivery, payments, and returns."
      />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container max-w-3xl">
          <ul className="space-y-4">
            {FAQS.map((item) => (
              <li key={item.q} className="premium-card p-5 sm:p-6">
                <h2 className="text-base font-semibold text-earth-900">{item.q}</h2>
                <p className="mt-2 text-sm leading-relaxed text-earth-600">{item.a}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-earth-600">
            Still need help?{' '}
            <a
              href={`mailto:${supportEmail}`}
              className="font-medium text-brand-700 no-underline hover:text-brand-800"
            >
              {supportEmail}
            </a>
            {' · '}
            {storePhonesPlain()}
          </p>
        </div>
      </section>
    </div>
  )
}
