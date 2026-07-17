import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FileCheck2, GraduationCap, Landmark, PackageCheck, Phone, ShieldCheck, Store, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SERVICE_PHONE = '(614) 377-8297'
const SERVICE_PHONE_HREF = 'tel:+16143778297'
const SECONDARY_SERVICE_PHONE = '(614) 323-7385'
const SECONDARY_SERVICE_PHONE_HREF = 'tel:+16143237385'

const SERVICE_GROUPS = [
  {
    title: 'Insurance & planning',
    description: 'Term life, whole life, indexed universal life, annuities and retirement planning.',
    icon: ShieldCheck,
  },
  {
    title: 'Family finances',
    description: 'College fund planning and mortgage payoff planning.',
    icon: GraduationCap,
  },
  {
    title: 'Notary & documents',
    description: 'Notary services, trusts and document support.',
    icon: FileCheck2,
  },
  {
    title: 'Ghana services',
    description: 'Visa assistance and funeral rite coordination.',
    icon: Landmark,
  },
] as const

export function AdditionalServices() {
  return (
    <section
      className="page-section scroll-mt-28 border-t border-earth-200 bg-white md:scroll-mt-24"
      aria-labelledby="mobile-market-title"
    >
      <div className="store-container">
        <div
          id="mobile-market"
          className="grid scroll-mt-28 overflow-hidden rounded-3xl bg-earth-950 text-white shadow-[var(--shadow-card)] md:scroll-mt-24 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              Mobile market · Ohio delivery · Nationwide shipping
            </p>
            <h2
              id="mobile-market-title"
              className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl"
            >
              Three ways to shop Kintampo.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/70">
              Order online for shipping across the United States, request fast delivery around
              Ohio, or schedule our mobile market for homes, events, and community stops.
            </p>

            <ul className="mt-7 grid gap-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/55" strokeWidth={1.75} aria-hidden />
                <span>
                  <strong className="block font-semibold text-white">Nationwide shipping</strong>
                  Order African and Caribbean groceries online across the United States.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-white/55" strokeWidth={1.75} aria-hidden />
                <span>
                  <strong className="block font-semibold text-white">Fast Ohio delivery</strong>
                  Call to confirm delivery availability and timing for your address.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Store className="mt-0.5 h-4 w-4 shrink-0 text-white/55" strokeWidth={1.75} aria-hidden />
                <span>
                  <strong className="block font-semibold text-white">Mobile market</strong>
                  Schedule grocery service for homes, events, and community stops.
                </span>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={SERVICE_PHONE_HREF} className="w-full no-underline sm:w-auto">
                <Button size="lg" className="h-12 w-full bg-white px-6 text-earth-950 hover:bg-earth-100 sm:w-auto">
                  <Phone className="h-4 w-4" aria-hidden />
                  Call {SERVICE_PHONE}
                </Button>
              </a>
              <Link href="/shop" className="w-full no-underline sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-white/25 bg-transparent px-6 text-white shadow-none hover:border-white/40 hover:bg-white/10 sm:w-auto"
                >
                  Shop for nationwide shipping
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Alternate mobile-services line:{' '}
              <a
                href={SECONDARY_SERVICE_PHONE_HREF}
                className="inline-flex min-h-11 items-center text-white/75 no-underline hover:text-white"
              >
                {SECONDARY_SERVICE_PHONE}
              </a>
            </p>
          </div>

          <div className="relative min-h-[260px] bg-earth-900 sm:min-h-[360px] lg:min-h-full">
            <Image
              src="/images/mobile-market/kintampo-mobile-market.png"
              alt="Kintampo African Market mobile service van in Columbus, Ohio"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover object-center"
            />
          </div>
        </div>

        <div
          id="services"
          className="mt-12 flex scroll-mt-28 flex-col gap-5 border-b border-earth-200 pb-8 sm:mt-16 sm:flex-row sm:items-end sm:justify-between md:scroll-mt-24"
        >
          <div>
            <p className="section-eyebrow">Available by appointment</p>
            <h2 id="additional-services-title" className="section-title mt-3">
              More services at Kintampo
            </h2>
            <p className="section-subtitle">
              Insurance, financial planning, notary and Ghana-related support in Columbus.
            </p>
          </div>

          <a href={SERVICE_PHONE_HREF} className="w-full no-underline sm:w-auto">
            <Button size="lg" variant="outline" className="h-12 w-full px-6 sm:w-auto">
              <Phone className="h-4 w-4" aria-hidden />
              Call {SERVICE_PHONE}
            </Button>
          </a>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-earth-200 bg-earth-200 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_GROUPS.map(({ title, description, icon: Icon }) => (
            <article key={title} className="bg-white p-6 sm:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-100 text-earth-700">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-semibold text-earth-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-earth-600">{description}</p>
            </article>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-earth-500">
          Services, eligibility and provider availability may vary. Call for current details.
        </p>
      </div>
    </section>
  )
}
