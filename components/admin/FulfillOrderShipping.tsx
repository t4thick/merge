'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { StoreIntegratedShippingPanel } from '@/components/admin/StoreIntegratedShippingPanel'
import { Button } from '@/components/ui/button'
import {
  downloadPdfFile,
  isAbortError,
  pdfFileFromUrl,
  sharePdfFile,
} from '@/lib/client/share-label-pdf'

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
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')
  const [hint, setHint] = useState('')

  async function shareSavedLabel() {
    if (!initialLabelUrl) return
    setSharing(true)
    setShareError('')
    setHint('')
    try {
      const file = await pdfFileFromUrl(
        initialLabelUrl,
        `shipping-label-${initialTracking || orderId}.pdf`
      )
      const result = await sharePdfFile(file)
      if (result === 'unsupported') {
        downloadPdfFile(file)
        setHint('PDF saved. FlashLabel Pro → PDF Print → Import PDF.')
      }
    } catch (err) {
      if (isAbortError(err)) return
      setShareError('Could not share. Use Save PDF, then Import PDF in FlashLabel Pro.')
    } finally {
      setSharing(false)
    }
  }

  async function saveSavedLabel() {
    if (!initialLabelUrl) return
    setSharing(true)
    setShareError('')
    try {
      const file = await pdfFileFromUrl(
        initialLabelUrl,
        `shipping-label-${initialTracking || orderId}.pdf`
      )
      downloadPdfFile(file)
      setHint('PDF saved. FlashLabel Pro → PDF Print → Import PDF.')
    } catch {
      setShareError('Could not save PDF.')
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
          {hint ? (
            <p className="text-sm font-medium text-emerald-900" role="status">
              {hint}
            </p>
          ) : null}
          {initialLabelUrl ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" size="sm" onClick={() => void shareSavedLabel()} disabled={sharing}>
                <Share2 className="h-4 w-4" aria-hidden />
                {sharing ? 'Preparing PDF…' : 'Share PDF'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void saveSavedLabel()}
                disabled={sharing}
              >
                <Download className="h-4 w-4" aria-hidden />
                Save PDF
              </Button>
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
