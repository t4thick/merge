'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Printer, RefreshCw } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Parcel = {
  weightLb: number
  lengthIn: number
  widthIn: number
  heightIn: number
}

type Props = {
  orderId: string
  mailClass: string
  defaultParcel: Parcel
  initialLabelUrl?: string | null
  initialTracking?: string | null
}

export function UspsPrintLabelPanel({
  orderId,
  mailClass,
  defaultParcel,
  initialLabelUrl,
  initialTracking,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [labelUrl, setLabelUrl] = useState(initialLabelUrl ?? '')
  const [tracking, setTracking] = useState(initialTracking ?? '')
  const [postage, setPostage] = useState<number | null>(null)
  const [estimate, setEstimate] = useState<{ price: number; description: string } | null>(null)
  const [rateError, setRateError] = useState('')
  const [rateLoading, setRateLoading] = useState(false)

  // Editable parcel — starts from defaults
  const [parcel, setParcel] = useState<Parcel>(defaultParcel)

  function updateParcel(field: keyof Parcel, raw: string) {
    const val = parseFloat(raw)
    if (Number.isFinite(val) && val > 0) {
      setParcel((p) => ({ ...p, [field]: val }))
      setEstimate(null) // clear estimate when dimensions change
    }
  }

  async function loadRate(p = parcel) {
    setRateLoading(true)
    setRateError('')
    setEstimate(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipping/usps-rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcel: p }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setRateError(typeof data.error === 'string' ? data.error : 'Could not load rate estimate.')
        return
      }
      if (typeof data.price === 'number') {
        setEstimate({ price: data.price, description: data.description ?? 'USPS' })
      }
    } catch {
      setRateError('Could not load rate estimate.')
    } finally {
      setRateLoading(false)
    }
  }

  // Auto-load rate on mount
  useEffect(() => {
    if (!labelUrl) void loadRate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function printLabel() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipping/usps-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parcel }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not create label.')
        return
      }

      setTracking(data.trackingNumber)
      setPostage(typeof data.postage === 'number' ? data.postage : null)
      if (data.labelUrl) setLabelUrl(data.labelUrl)

      router.refresh()

      if (typeof data.labelPdfBase64 === 'string' && data.labelPdfBase64.length > 0) {
        const bytes = Uint8Array.from(atob(data.labelPdfBase64), (c) => c.charCodeAt(0))
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const w = window.open(url, '_blank', 'noopener,noreferrer')
        w?.focus()
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      } else if (data.labelUrl) {
        const w = window.open(data.labelUrl, '_blank', 'noopener,noreferrer')
        w?.focus()
      }
    } finally {
      setLoading(false)
    }
  }

  function openPrint() {
    if (!labelUrl) return
    window.open(labelUrl, '_blank', 'noopener,noreferrer')?.focus()
  }

  if (labelUrl || tracking) {
    return (
      <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <p className="text-sm font-semibold text-emerald-900">Label ready</p>
        {postage != null ? <p className="text-sm text-emerald-800">Postage: ${postage.toFixed(2)}</p> : null}
        {tracking ? (
          <p className="font-mono text-xs text-emerald-900">
            Tracking: <span className="font-semibold">{tracking}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {labelUrl ? (
            <>
              <Button type="button" onClick={openPrint}>
                <Printer className="mr-1.5 h-4 w-4" aria-hidden />
                Print label
              </Button>
              <a
                href={labelUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <Download className="h-4 w-4" aria-hidden />
                Download PDF
              </a>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-300 bg-white p-5 shadow-[var(--shadow-card)]">
      <div>
        <p className="text-base font-semibold text-earth-900">Print shipping label</p>
        <p className="mt-0.5 text-sm text-earth-500">
          {mailClass.replace(/_/g, ' ')} via Shippo · adjust box size below then get rate
        </p>
      </div>

      {/* Editable parcel dimensions */}
      <div className="rounded-lg border border-earth-200 bg-earth-50 p-3 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-earth-500">Box dimensions</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { field: 'weightLb', label: 'Weight (lb)' },
              { field: 'lengthIn', label: 'Length (in)' },
              { field: 'widthIn', label: 'Width (in)' },
              { field: 'heightIn', label: 'Height (in)' },
            ] as const
          ).map(({ field, label }) => (
            <label key={field} className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-earth-500">{label}</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                defaultValue={parcel[field]}
                onBlur={(e) => updateParcel(field, e.target.value)}
                className="form-input py-1.5 text-sm"
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => loadRate()}
          disabled={rateLoading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', rateLoading && 'animate-spin')} />
          {rateLoading ? 'Getting rate…' : 'Get rate estimate'}
        </button>
      </div>

      {/* Rate result */}
      {estimate && (
        <p className="text-sm font-semibold text-earth-900">
          Estimated postage: <span className="text-brand-700">${estimate.price.toFixed(2)}</span>
          <span className="ml-1 font-normal text-earth-500">· {estimate.description}</span>
        </p>
      )}
      {rateError && (
        <p className="text-xs font-medium text-amber-800">{rateError}</p>
      )}

      {error && (
        <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
      )}

      <Button
        type="button"
        size="lg"
        className="h-12 w-full sm:w-auto"
        onClick={printLabel}
        disabled={loading}
      >
        <Printer className="mr-2 h-5 w-5" aria-hidden />
        {loading ? 'Creating label…' : 'Print shipping label'}
      </Button>
    </div>
  )
}
