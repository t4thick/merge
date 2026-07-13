'use client'

import { Download } from 'lucide-react'
import { StoreIntegratedShippingPanel } from '@/components/admin/StoreIntegratedShippingPanel'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  orderId: string
  isPickup: boolean
  currentStatus: string
  uspsConfigured: boolean
  uspsLabelsLive: boolean
  shippoConfigured: boolean
  mailClass: string
  defaultParcel: {
    weightLb: number
    lengthIn: number
    widthIn: number
    heightIn: number
  }
  initialLabelUrl?: string | null
  initialTracking?: string | null
  initialCarrier?: string | null
  initialService?: string | null
}

export function FulfillOrderShipping({
  orderId,
  isPickup,
  uspsConfigured,
  uspsLabelsLive,
  shippoConfigured,
  mailClass,
  defaultParcel,
  initialLabelUrl,
  initialTracking,
  initialCarrier,
  initialService,
}: Props) {
  const hasShipment = Boolean(initialTracking || initialLabelUrl)

  if (isPickup) {
    return <p className="text-sm text-earth-600">Pickup order — no shipping label needed.</p>
  }

  return (
    <div className="space-y-5">
      {hasShipment ? (
        <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-semibold text-emerald-900">Shipment on file</p>
          {initialCarrier || initialService ? (
            <p className="text-sm text-emerald-800">
              {[initialCarrier, initialService].filter(Boolean).join(' · ')}
            </p>
          ) : null}
          {initialTracking ? (
            <p className="font-mono text-xs text-emerald-900">
              Tracking: <span className="font-semibold">{initialTracking}</span>
            </p>
          ) : null}
          {initialLabelUrl ? (
            <a
              href={initialLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download saved label PDF
            </a>
          ) : null}
        </div>
      ) : null}

      <StoreIntegratedShippingPanel
        orderId={orderId}
        mailClass={mailClass}
        labelsLive={uspsLabelsLive}
        uspsConfigured={uspsConfigured}
        shippoConfigured={shippoConfigured}
        defaultParcel={defaultParcel}
        initialLabelUrl={initialLabelUrl}
        initialTracking={initialTracking}
      />
    </div>
  )
}
