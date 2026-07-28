import type { Metadata } from 'next'
import Link from 'next/link'
import { FeedbackForm } from '@/components/store/FeedbackForm'
import { PageHeader } from '@/components/store/PageHeader'
import { getSupportEmail } from '@/lib/constants/store'

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Suggest improvements for the Kintampo African Market website.',
  robots: { index: true, follow: true },
}

export default function FeedbackPage() {
  const supportEmail = getSupportEmail()

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="Help us improve"
        title="Website feedback"
        subtitle="Suggestions for the website."
      />
      <div className="store-container max-w-xl py-8 sm:py-10">
        <div className="rounded-xl border border-earth-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <FeedbackForm />
        </div>
        <p className="mt-8 text-center text-sm text-earth-500">
          Prefer email?{' '}
          <a
            href={`mailto:${supportEmail}?subject=${encodeURIComponent('Kintampo African Market website feedback')}`}
            className="font-medium text-brand-700 no-underline hover:text-brand-800"
          >
            {supportEmail}
          </a>
          <span className="mx-2 text-earth-300">·</span>
          <Link href="/shop" className="font-medium text-brand-700 no-underline hover:text-brand-800">
            Back to shop
          </Link>
        </p>
      </div>
    </div>
  )
}
