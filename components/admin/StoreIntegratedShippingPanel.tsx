'use client'

import Link from 'next/link'
import { Check, Lock, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UspsPrintLabelPanel } from '@/components/admin/UspsPrintLabelPanel'

type Props = {
  orderId: string
  mailClass: string
  labelsLive: boolean
  uspsConfigured: boolean
  shippoConfigured?: boolean
  defaultParcel: {
    weightLb: number
    lengthIn: number
    widthIn: number
    heightIn: number
  }
  initialLabelUrl?: string | null
  initialTracking?: string | null
}

export function StoreIntegratedShippingPanel({
  orderId,
  mailClass,
  labelsLive,
  uspsConfigured,
  shippoConfigured,
  defaultParcel,
  initialLabelUrl,
  initialTracking,
}: Props) {
  if (shippoConfigured || (labelsLive && uspsConfigured)) {
    return (
      <UspsPrintLabelPanel
        orderId={orderId}
        mailClass={mailClass}
        defaultParcel={defaultParcel}
        initialLabelUrl={initialLabelUrl}
        initialTracking={initialTracking}
      />
    )
  }

  const steps = [
    { label: 'USPS business account & EPS', done: uspsConfigured },
    { label: 'API credentials on Vercel', done: uspsConfigured },
    { label: 'USPS Labels API approval', done: false },
    { label: 'One-click print in this admin', done: false },
  ]

  return (
    <div className="relative overflow-hidden rounded-xl border border-earth-200 bg-earth-50">
      <div className="border-b border-earth-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-earth-950">Kintampo shipping desk</p>
            <p className="mt-1 text-sm text-earth-600">
              Print {mailClass.replace(/_/g, ' ')} labels here — no Click-N-Ship tab, tracking saved
              automatically.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Ready
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1fr,minmax(200px,260px)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-earth-300 bg-white/80 px-4 py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-earth-100">
              <Printer className="h-6 w-6 text-earth-500" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-medium text-earth-800">Still building this lane</p>
            <p className="mt-1 text-xs text-earth-500">
              Default box: {defaultParcel.weightLb} lb · {defaultParcel.lengthIn}×{defaultParcel.widthIn}×
              {defaultParcel.heightIn} in
            </p>
            <Button type="button" size="lg" className="mt-4 h-11 w-full max-w-xs" disabled>
              <Lock className="mr-2 h-4 w-4" aria-hidden />
              Print shipping label
            </Button>
          </div>
          <p className="text-xs text-earth-500">
            Waiting on USPS to add <strong>Labels API</strong> to your developer app. Use Click-N-Ship or
            Shippo tabs until then.
          </p>
        </div>

        <div className="rounded-lg border border-earth-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-earth-500">Rollout checklist</p>
          <ul className="mt-3 space-y-2.5">
            {steps.map((step) => (
              <li key={step.label} className="flex items-start gap-2 text-sm">
                <span
                  className={
                    step.done
                      ? 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'
                      : 'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-earth-100 text-earth-400'
                  }
                  aria-hidden
                >
                  {step.done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-earth-300" />}
                </span>
                <span className={step.done ? 'text-earth-800' : 'text-earth-500'}>{step.label}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/shipping"
            className="mt-4 inline-block text-sm font-medium text-brand-700 no-underline hover:text-brand-800"
          >
            Shipping setup →
          </Link>
        </div>
      </div>
    </div>
  )
}
