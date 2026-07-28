'use client'

import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import { StoreIntegratedShippingPanel } from '@/components/admin/StoreIntegratedShippingPanel'
import { Button } from '@/components/ui/button'
import {
  downloadPdfFile,
  isAbortError,
  pdfFileFromUrl,
  sharePdfWithFlashLabel,
  uploadPdfForShare,
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
  const [message, setMessage] = useState('')

  async function shareSavedLabel() {
    if (!initialLabelUrl) return
    setSharing(true)
    setMessage('Preparing PDF link for FlashLabel…')
    try {
      const file = await pdfFileFromUrl(
        initialLabelUrl,
        `shipping-label-${initialTracking || orderId}.pdf`
      )
      let publicUrl = initialLabelUrl
      if (!publicUrl.includes('pdf')) {
        publicUrl = await uploadPdfForShare(orderId, file, 'label')
      }
      const result = await sharePdfWithFlashLabel({ file, publicUrl })
      if (result === 'unsupported') {
        downloadPdfFile(file)
        setMessage(`PDF saved. Link:\n${publicUrl}`)
      } else {
        setMessage('Shared PDF link — choose FlashLabel Pro.')
      }
    } catch (err) {
      if (isAbortError(err)) {
        setMessage('')
        return
      }
      setMessage(err instanceof Error ? err.message : 'Could not share PDF.')
    } finally {
      setSharing(false)
    }
  }

  async function saveSavedLabel() {
    if (!initialLabelUrl) return
    setSharing(true)
    setMessage('Saving PDF…')
    try {
      const file = await pdfFileFromUrl(
        initialLabelUrl,
        `shipping-label-${initialTracking || orderId}.pdf`
      )
      downloadPdfFile(file)
      setMessage('PDF saved. FlashLabel → PDF Print → Import PDF.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save PDF.')
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
          {message ? (
            <p className="whitespace-pre-wrap break-all text-sm font-medium text-emerald-900" role="status">
              {message}
            </p>
          ) : null}
          {initialLabelUrl ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" size="sm" onClick={() => void shareSavedLabel()} disabled={sharing}>
                <Share2 className="h-4 w-4" aria-hidden />
                {sharing ? 'Preparing…' : 'Share PDF to FlashLabel'}
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
