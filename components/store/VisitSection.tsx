import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE } from '@/lib/constants/store'
import { StorePhoneLinks } from '@/components/store/StorePhoneLinks'

export function VisitSection() {
  return (
    <section className="bg-earth-50 py-12 sm:py-16 lg:py-20">
      <div className="store-container">
        <div className="grid items-center gap-8 rounded-3xl border border-earth-200 bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div>
            <h2 className="section-title">Visit the store</h2>
            <p className="section-subtitle">
              Shop online for store pickup or nationwide shipping — or stop by our Columbus location.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-earth-500" strokeWidth={1.75} aria-hidden />
                <div>
                  <dt className="sr-only">Address</dt>
                  <dd className="font-medium text-earth-900">{STORE.address}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-earth-500" strokeWidth={1.75} aria-hidden />
                <div>
                  <dt className="sr-only">Phone</dt>
                  <dd>
                    <StorePhoneLinks />
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
                Call {STORE.phone}
              </Button>
            </a>
            <a href={STORE.phoneAltHref} className="no-underline">
              <Button size="lg" variant="outline" className="h-11 w-full px-6 lg:w-auto">
                Call {STORE.phoneAlt}
              </Button>
            </a>
            <Link
              href="/track-order"
              className="inline-flex min-h-11 items-center text-sm font-medium text-earth-600 no-underline hover:text-earth-900"
            >
              Track an order →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
