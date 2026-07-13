import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE } from '@/lib/constants/store'

export function VisitSection() {
  return (
    <section className="border-t border-earth-200 bg-white py-12 sm:py-16">
      <div className="store-container">
        <div className="grid items-center gap-8 rounded-2xl border border-earth-200 bg-earth-50 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-14">
          <div>
            <h2 className="section-title">Visit the store</h2>
            <p className="section-subtitle">
              Shop online for store pickup or nationwide shipping — or stop by our Columbus location.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="sr-only">Address</dt>
                  <dd className="font-medium text-earth-900">{STORE.address}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="sr-only">Phone</dt>
                  <dd>
                    <a
                      href={STORE.phoneHref}
                      className="font-medium text-earth-900 no-underline hover:text-brand-700"
                    >
                      {STORE.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="text-earth-600">{STORE.hours}</div>
            </dl>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link href="/shop" className="no-underline">
              <Button size="lg" className="h-11 w-full px-6 lg:w-auto">
                Shop online
              </Button>
            </Link>
            <a href={STORE.phoneHref} className="no-underline">
              <Button size="lg" variant="outline" className="h-11 w-full px-6 lg:w-auto">
                Call the store
              </Button>
            </a>
            <Link
              href="/track-order"
              className="text-sm font-medium text-brand-700 no-underline hover:text-brand-800"
            >
              Track an order →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
