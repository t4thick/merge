'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintSlipActions({ orderId, autoPrint }: { orderId: string; autoPrint?: boolean }) {
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

  function handlePrint() {
    window.print()
    setPrintHint(true)
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
        <Button type="button" onClick={handlePrint}>
          <Printer className="mr-1.5 h-4 w-4" aria-hidden />
          Print slip
        </Button>
      </div>
      <div className="rounded-lg border border-earth-200 bg-earth-50 px-4 py-3 text-sm text-earth-700">
        <p className="font-medium text-earth-900">Use your normal office printer</p>
        <p className="mt-1">
          In the print dialog, pick <strong>HP / Canon / Brother / Microsoft Print to PDF</strong> — not
          FlashLabel. FlashLabel only prints PDF labels from its phone app, not from the website.
        </p>
        <p className="mt-1 text-earth-600">
          Letter-size paper · tape slip to box · buy postage at Click-N-Ship or the counter.
        </p>
      </div>
      {printHint && (
        <p className="text-sm text-earth-600">
          No dialog? Click <strong>Print slip</strong> again, or use{' '}
          <kbd className="rounded border border-earth-200 bg-white px-1.5 py-0.5 text-xs">Ctrl+P</kbd>{' '}
          (Mac: <kbd className="rounded border border-earth-200 bg-white px-1.5 py-0.5 text-xs">⌘P</kbd>).
        </p>
      )}
    </div>
  )
}
