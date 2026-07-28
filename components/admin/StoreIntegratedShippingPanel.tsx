'use client'

import Link from 'next/link'
import { Printer } from 'lucide-react'
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

  return (
    <div className="rounded-xl border border-earth-200 bg-earth-50 px-5 py-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-earth-100">
        <Printer className="h-6 w-6 text-earth-500" aria-hidden />
      </div>
      <p className="mt-3 text-center text-sm font-medium text-earth-800">
        Print labels from Click-N-Ship, then paste tracking on this order.
      </p>
      <p className="mt-1 text-center text-xs text-earth-500">
        Default box: {defaultParcel.weightLb} lb · {defaultParcel.lengthIn}×{defaultParcel.widthIn}×
        {defaultParcel.heightIn} in
      </p>
      <div className="mt-4 flex justify-center">
        <Button type="button" size="lg" className="h-11 w-full max-w-xs" disabled>
          Label printing unavailable
        </Button>
      </div>
      <p className="mt-3 text-center">
        <Link
          href="/admin/shipping"
          className="text-sm font-medium text-brand-700 no-underline hover:text-brand-800"
        >
          Shipping settings →
        </Link>
      </p>
    </div>
  )
}
