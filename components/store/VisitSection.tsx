import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { STORE, STORE_PHONES } from '@/lib/constants/store'
import { StorePhoneLinks } from '@/components/store/StorePhoneLinks'

export function VisitSection() {
  return (
    <section id="visit" className="scroll-mt-28 bg-earth-50 py-12 sm:py-16 lg:py-20 md:scroll-mt-24">
      <div className="store-container">
        <div className="grid overflow-hidden rounded-3xl border border-earth-200 bg-white shadow-[var(--shadow-soft)] lg:grid-cols-2">
          <div className="relative min-h-[280px] bg-earth-100 sm:min-h-[360px]">
            <Image
              src="/images/store/aisle-depth.png"
              alt="Kintampo African Market aisle — jewelry, rice, and grocery shelves"
              fill
              quality={90}
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <h2 className="section-title">Visit the store</h2>
            <p className="section-subtitle mt-2">
              Shop online for store pickup or nationwide shipping — or stop by our Columbus
              location.
            </p>

            <dl className="mt-6 space-y-4 text-sm">
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
              <div className="pl-7 text-earth-600">{STORE.hours}</div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/shop" className="no-underline">
                <Button size="lg" className="h-11 w-full px-6 sm:w-auto">
                  Shop online
                </Button>
              </Link>
              {STORE_PHONES.map((p) => (
                <a key={p.href} href={p.href} className="no-underline">
                  <Button size="lg" variant="outline" className="h-11 w-full px-5 sm:w-auto">
                    Call {p.label}
                  </Button>
                </a>
              ))}
            </div>

            <Link
              href="/track-order"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-earth-600 no-underline hover:text-earth-900"
            >
              Track an order →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
