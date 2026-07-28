'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { StoreIntegratedShippingPanel } from '@/components/admin/StoreIntegratedShippingPanel'
import { Button, buttonVariants } from '@/components/ui/button'
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

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
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
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')

  async function shareSavedLabel() {
    if (!initialLabelUrl) return
    setSharing(true)
    setShareError('')
    try {
      const res = await fetch(initialLabelUrl)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const file = new File([blob], `shipping-label-${initialTracking || orderId}.pdf`, {
        type: 'application/pdf',
      })
      const payload = {
        files: [file],
        title: 'Shipping label',
        text: initialTracking ? `Tracking ${initialTracking}` : 'Shipping label PDF',
      }
      if (typeof navigator.share !== 'function') {
        window.open(initialLabelUrl, '_blank', 'noopener,noreferrer')
        return
      }
      if (typeof navigator.canShare === 'function' && !navigator.canShare(payload)) {
        window.open(initialLabelUrl, '_blank', 'noopener,noreferrer')
        return
      }
      await navigator.share(payload)
    } catch (err) {
      if (isAbortError(err)) return
      setShareError('Could not share. Try Open PDF instead.')
    } finally {
      setSharing(false)
    }
  }

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
          {shareError ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {shareError}
            </p>
          ) : null}
          {initialLabelUrl ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" size="sm" onClick={() => void shareSavedLabel()} disabled={sharing}>
                <Share2 className="h-4 w-4" aria-hidden />
                {sharing ? 'Opening share…' : 'Share PDF'}
              </Button>
              <a
                href={initialLabelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <Download className="h-4 w-4" aria-hidden />
                Open PDF
              </a>
            </div>
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
