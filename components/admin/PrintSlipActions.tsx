'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type SlipSharePayload = {
  name: string
  lines: string[]
  orderLabel: string
  phone?: string | null
  shipFromLines: string[]
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

/** Build a crisp label image FlashLabel Pro can import (approx 4×6"). */
async function buildSlipPng(payload: SlipSharePayload): Promise<File> {
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
  const nameLines = wrapText(ctx, payload.name, width - 112)
  for (const line of nameLines) {
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

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export label image.'))), 'image/png')
  })

  return new File([blob], `address-slip-${payload.orderLabel}.png`, { type: 'image/png' })
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
    try {
      const probe = new File([new Blob(['x'], { type: 'image/png' })], 'probe.png', {
        type: 'image/png',
      })
      setCanShare(
        typeof navigator !== 'undefined' &&
          typeof navigator.share === 'function' &&
          (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [probe] }))
      )
    } catch {
      setCanShare(Boolean(typeof navigator !== 'undefined' && typeof navigator.share === 'function'))
    }
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
      const file = await buildSlipPng(sharePayload)
      const payload = {
        files: [file],
        title: 'Address slip',
        text: `Ship to ${sharePayload.name} · ${sharePayload.orderLabel}`,
      }
      if (typeof navigator.share !== 'function') {
        setShareError('Share is not available in this browser. Use Print slip instead.')
        return
      }
      if (typeof navigator.canShare === 'function' && !navigator.canShare(payload)) {
        setShareError('This phone cannot share image files from the browser.')
        return
      }
      await navigator.share(payload)
    } catch (err) {
      if (isAbortError(err)) return
      setShareError('Could not open Share. Try again, or use Print slip.')
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
          <Button type="button" onClick={() => void handleShare()} disabled={sharing || !canShare}>
            <Share2 className="mr-1.5 h-4 w-4" aria-hidden />
            {sharing ? 'Opening share…' : 'Share to FlashLabel'}
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={handlePrint}>
          <Printer className="mr-1.5 h-4 w-4" aria-hidden />
          Print slip
        </Button>
      </div>
      <div className="rounded-lg border border-earth-200 bg-earth-50 px-4 py-3 text-sm text-earth-700">
        <p className="font-medium text-earth-900">Phone (FlashLabel Pro)</p>
        <p className="mt-1">
          Tap <strong>Share to FlashLabel</strong> → choose <strong>FlashLabel Pro</strong> → print the
          address label, then pay postage at the counter.
        </p>
        <p className="mt-2 font-medium text-earth-900">Office printer</p>
        <p className="mt-1">
          Use <strong>Print slip</strong> for letter-size paper, tape it on the box, then buy postage.
        </p>
      </div>
      {shareError ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {shareError}
        </p>
      ) : null}
      {printHint && (
        <p className="text-sm text-earth-600">
          No dialog? Tap <strong>Print slip</strong> again, or use your browser&apos;s share/print menu.
        </p>
      )}
    </div>
  )
}
