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
  sharePdfWithFlashLabel,
  uploadPdfForShare,
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
    if (ctx.measureText(test).width <= maxWidth) current = test
    else {
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
  return canvasToPdfFile(drawSlipCanvas(payload), `address-slip-${payload.orderLabel}.pdf`)
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
  const [status, setStatus] = useState('')
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

  async function preparePublicPdf() {
    if (!sharePayload) throw new Error('Missing slip data.')
    const file = await buildSlipPdf(sharePayload)
    const publicUrl = await uploadPdfForShare(orderId, file, 'address-slip')
    return { file, publicUrl }
  }

  async function handleShare() {
    if (!sharePayload) return
    setSharing(true)
    setStatus('Uploading PDF link for FlashLabel…')
    try {
      const { file, publicUrl } = await preparePublicPdf()
      setStatus('Opening share… pick FlashLabel Pro')
      const result = await sharePdfWithFlashLabel({ file, publicUrl })
      if (result === 'unsupported') {
        downloadPdfFile(file)
        setStatus(
          `PDF saved + link ready:\n${publicUrl}\n\nFlashLabel: PDF Print → Import PDF, or paste the link.`
        )
      } else {
        setStatus('Shared. If FlashLabel still fails, tap Save PDF then Import PDF.')
      }
    } catch (err) {
      if (isAbortError(err)) {
        setStatus('')
        return
      }
      setStatus(err instanceof Error ? err.message : 'Could not share PDF.')
    } finally {
      setSharing(false)
    }
  }

  async function handleSavePdf() {
    if (!sharePayload) return
    setSharing(true)
    setStatus('Preparing PDF…')
    try {
      const { file, publicUrl } = await preparePublicPdf()
      downloadPdfFile(file)
      setStatus(
        `PDF saved on phone. FlashLabel → PDF Print → Import PDF.\nLink: ${publicUrl}`
      )
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not save PDF.')
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
              {sharing ? 'Preparing…' : 'Share PDF to FlashLabel'}
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
        <Button type="button" variant="outline" onClick={() => { window.print(); setPrintHint(true) }}>
          <Printer className="mr-1.5 h-4 w-4" aria-hidden />
          Print slip
        </Button>
      </div>
      <div className="rounded-lg border border-earth-200 bg-earth-50 px-4 py-3 text-sm text-earth-700">
        <p className="font-medium text-earth-900">FlashLabel Pro</p>
        <p className="mt-1">
          We upload a real <strong>.pdf link</strong>, then open Share so FlashLabel can open it.
          If Share still fails: <strong>Save PDF</strong> → FlashLabel → <strong>PDF Print → Import
          PDF</strong>.
        </p>
        {!canShare ? (
          <p className="mt-1 text-amber-800">Use Save PDF on this browser, then Import in FlashLabel.</p>
        ) : null}
      </div>
      {status ? (
        <p className="whitespace-pre-wrap break-all text-sm font-medium text-earth-800" role="status">
          {status}
        </p>
      ) : null}
      {printHint && (
        <p className="text-sm text-earth-600">No print dialog? Tap Print slip again.</p>
      )}
    </div>
  )
}
