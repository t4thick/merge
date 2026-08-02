import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { PageHeader } from '@/components/store/PageHeader'
import { StorePhoneLinks } from '@/components/store/StorePhoneLinks'
import { STORE, STORE_PHONES } from '@/lib/constants/store'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About & Visit',
  description: `${STORE.name} — address, hours, and directions in Columbus, OH.`,
}

export default function AboutPage() {
  const mapsQuery = encodeURIComponent(STORE.address)
  const embedSrc = `https://www.google.com/maps?q=${mapsQuery}&output=embed`
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        eyebrow="Visit"
        title={STORE.name}
        subtitle="African & Caribbean groceries. Store pickup and US shipping."
      />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="premium-card space-y-6 p-5 sm:p-6">
            <dl className="space-y-4 text-sm">
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="no-underline">
                <Button size="lg" className="h-11 w-full min-w-[11rem]">
                  Get directions
                </Button>
              </a>
              <Link href="/shop" className="no-underline">
                <Button size="lg" variant="outline" className="h-11 w-full min-w-[11rem]">
                  Shop online
                </Button>
              </Link>
            </div>

            <div className="grid gap-2 border-t border-earth-100 pt-5 sm:grid-cols-1">
              {STORE_PHONES.map((p) => (
                <a key={p.href} href={p.href} className="no-underline">
                  <Button size="lg" variant="outline" className="h-11 w-full">
                    Call {p.label}
                  </Button>
                </a>
              ))}
            </div>
          </div>

          <div className="premium-card overflow-hidden p-0">
            <iframe
              title={`Map — ${STORE.name}`}
              src={embedSrc}
              className="h-[320px] w-full border-0 sm:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  )
}
