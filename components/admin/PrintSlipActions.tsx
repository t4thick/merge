'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FlashLabelPdfActions } from '@/components/admin/FlashLabelPdfActions'
import { buildTextLabelPdfFile } from '@/lib/client/share-label-pdf'

export type SlipSharePayload = {
  name: string
  lines: string[]
  orderLabel: string
  phone?: string | null
  shipFromLines: string[]
}

function slipToPdfFile(payload: SlipSharePayload): File {
  const lines = [
    'SHIP TO',
    '',
    payload.name,
    ...payload.lines,
    ...(payload.phone ? [`Phone: ${payload.phone}`] : []),
    '',
    `Order: ${payload.orderLabel}`,
    '',
    'SHIP FROM',
    ...payload.shipFromLines,
  ]
  return buildTextLabelPdfFile(lines, `address-slip-${payload.orderLabel}.pdf`)
}

export function PrintSlipActions({
  orderId,
  autoPrint,
  sharePayload,
}: {
  orderId: string
  autoPrint?: boolean
  sharePayload?: SlipSharePayload
}) {
  const [printHint, setPrintHint] = useState(false)

  useEffect(() => {
    document.body.classList.add('admin-print-slip-page')
    return () => document.body.classList.remove('admin-print-slip-page')
  }, [])

  useEffect(() => {
    if (!autoPrint) return
    const t = window.setTimeout(() => {
      window.print()
      window.setTimeout(() => setPrintHint(true), 1200)
    }, 600)
    return () => window.clearTimeout(t)
  }, [autoPrint])

  return (
    <div className="print-slip-toolbar mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/orders/${orderId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-earth-600 no-underline hover:text-earth-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to order
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.print()
            setPrintHint(true)
          }}
        >
          <Printer className="mr-1.5 h-4 w-4" aria-hidden />
          Print slip (office printer)
        </Button>
      </div>

      {sharePayload ? (
        <FlashLabelPdfActions
          orderId={orderId}
          tracking={sharePayload.orderLabel}
          kind="address-slip"
          getFile={async () => slipToPdfFile(sharePayload)}
        />
      ) : null}

      {printHint && (
        <p className="text-sm text-earth-600">No print dialog? Tap Print slip again.</p>
      )}
    </div>
  )
}
