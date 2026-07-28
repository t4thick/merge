'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  canSharePdfFiles,
  canvasToPdfFile,
  downloadPdfFile,
  isAbortError,
  sharePdfFile,
} from '@/lib/client/share-label-pdf'

export type SlipSharePayload = {
  name: string
  lines: string[]
  orderLabel: string
  phone?: string | null
  shipFromLines: string[]
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']
  const lines: string[] = []
  let current = words[0]
  for (let i = 1; i < words.length; i++) {
    const test = `${current} ${words[i]}`
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      lines.push(current)
      current = words[i]
    }
  }
  lines.push(current)
  return lines
}

function drawSlipCanvas(payload: SlipSharePayload): HTMLCanvasElement {
  const width = 800
  const height = 1200
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create label image.')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 6
  ctx.strokeRect(24, 24, width - 48, height - 48)

  let y = 80
  ctx.fillStyle = '#444444'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.fillText('SHIP TO', 56, y)

  y += 70
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 56px system-ui, sans-serif'
  for (const line of wrapText(ctx, payload.name, width - 112)) {
    ctx.fillText(line, 56, y)
    y += 66
  }

  y += 24
  ctx.font = '40px system-ui, sans-serif'
  for (const raw of payload.lines) {
    for (const line of wrapText(ctx, raw, width - 112)) {
      ctx.fillText(line, 56, y)
      y += 52
    }
  }

  if (payload.phone) {
    y += 20
    ctx.font = '34px system-ui, sans-serif'
    ctx.fillText(`Phone: ${payload.phone}`, 56, y)
    y += 48
  }

  y += 36
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(56, y)
  ctx.lineTo(width - 56, y)
  ctx.stroke()

  y += 56
  ctx.fillStyle = '#444444'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText('ORDER', 56, y)
  y += 44
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 36px ui-monospace, monospace'
  ctx.fillText(payload.orderLabel, 56, y)

  y += 70
  ctx.fillStyle = '#444444'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText('SHIP FROM', 56, y)
  y += 40
  ctx.fillStyle = '#000000'
  ctx.font = '30px system-ui, sans-serif'
  for (const line of payload.shipFromLines) {
    ctx.fillText(line, 56, y)
    y += 40
  }

  return canvas
}

async function buildSlipPdf(payload: SlipSharePayload): Promise<File> {
  const canvas = drawSlipCanvas(payload)
  return canvasToPdfFile(canvas, `address-slip-${payload.orderLabel}.pdf`)
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
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    document.body.classList.add('admin-print-slip-page')
    return () => document.body.classList.remove('admin-print-slip-page')
  }, [])

  useEffect(() => {
    setCanShare(canSharePdfFiles())
  }, [])

  useEffect(() => {
    if (!autoPrint) return
    const t = window.setTimeout(() => {
      window.print()
      window.setTimeout(() => setPrintHint(true), 1200)
    }, 600)
    return () => window.clearTimeout(t)
  }, [autoPrint])

  function handlePrint() {
    window.print()
    setPrintHint(true)
  }

  async function handleShare() {
    if (!sharePayload) return
    setSharing(true)
    setShareError('')
    try {
      const file = await buildSlipPdf(sharePayload)
      const result = await sharePdfFile(file)
      if (result === 'unsupported') {
        downloadPdfFile(file)
        setShareError(
          'Saved PDF to your phone. Open FlashLabel Pro → PDF Print → Import PDF → pick this file.'
        )
      }
    } catch (err) {
      if (isAbortError(err)) return
      setShareError('Could not share PDF. Use Save PDF, then Import PDF in FlashLabel Pro.')
    } finally {
      setSharing(false)
    }
  }

  async function handleSavePdf() {
    if (!sharePayload) return
    setSharing(true)
    setShareError('')
    try {
      const file = await buildSlipPdf(sharePayload)
      downloadPdfFile(file)
      setShareError(
        'PDF saved. In FlashLabel Pro: PDF Print → Import PDF → choose the saved file.'
      )
    } catch {
      setShareError('Could not save PDF.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="print-slip-toolbar mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/orders/${orderId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-earth-600 no-underline hover:text-earth-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to order
        </Link>
        {sharePayload ? (
          <>
            <Button type="button" onClick={() => void handleShare()} disabled={sharing}>
              <Share2 className="mr-1.5 h-4 w-4" aria-hidden />
              {sharing ? 'Preparing PDF…' : 'Share PDF'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSavePdf()}
              disabled={sharing}
            >
              <Download className="mr-1.5 h-4 w-4" aria-hidden />
              Save PDF
            </Button>
          </>
        ) : null}
        <Button type="button" variant="outline" onClick={handlePrint}>
          <Printer className="mr-1.5 h-4 w-4" aria-hidden />
          Print slip
        </Button>
      </div>
      <div className="rounded-lg border border-earth-200 bg-earth-50 px-4 py-3 text-sm text-earth-700">
        <p className="font-medium text-earth-900">FlashLabel Pro (phone)</p>
        <p className="mt-1">
          Tap <strong>Share PDF</strong> → FlashLabel Pro. If it says no PDF link, tap{' '}
          <strong>Save PDF</strong>, then in FlashLabel: <strong>PDF Print → Import PDF</strong>.
        </p>
        {!canShare ? (
          <p className="mt-1 text-amber-800">
            This browser may not support Share — use <strong>Save PDF</strong> instead.
          </p>
        ) : null}
      </div>
      {shareError ? (
        <p className="text-sm font-medium text-earth-800" role="status">
          {shareError}
        </p>
      ) : null}
      {printHint && (
        <p className="text-sm text-earth-600">
          No dialog? Tap <strong>Print slip</strong> again, or use your browser&apos;s print menu.
        </p>
      )}
    </div>
  )
}
