'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Printer, RefreshCw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  canSharePdfFiles,
  downloadPdfFile,
  isAbortError,
  pdfFileFromBase64,
  pdfFileFromUrl,
  sharePdfWithFlashLabel,
  uploadPdfForShare,
} from '@/lib/client/share-label-pdf'

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
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [labelUrl, setLabelUrl] = useState(initialLabelUrl ?? '')
  const [tracking, setTracking] = useState(initialTracking ?? '')
  const [postage, setPostage] = useState<number | null>(null)
  const [estimate, setEstimate] = useState<{ price: number; description: string } | null>(null)
  const [rateError, setRateError] = useState('')
  const [rateLoading, setRateLoading] = useState(false)
  const [canShareFiles, setCanShareFiles] = useState(false)
  const [parcel, setParcel] = useState<Parcel>(defaultParcel)

  useEffect(() => {
    setCanShareFiles(canSharePdfFiles())
  }, [])

  function updateParcel(field: keyof Parcel, raw: string) {
    const val = parseFloat(raw)
    if (Number.isFinite(val) && val > 0) {
      setParcel((p) => ({ ...p, [field]: val }))
      setEstimate(null)
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

  useEffect(() => {
    if (!labelUrl) void loadRate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function ensurePublicPdf(opts: {
    url?: string | null
    base64?: string | null
    filename: string
  }): Promise<{ file: File; publicUrl: string }> {
    let file: File
    if (opts.base64) {
      file = await pdfFileFromBase64(opts.base64, opts.filename)
    } else if (opts.url) {
      file = await pdfFileFromUrl(opts.url, opts.filename)
    } else {
      throw new Error('No PDF available yet.')
    }

    // Prefer existing public storage/Shippo URL; otherwise upload so FlashLabel gets a link.
    let publicUrl = opts.url?.startsWith('https://') ? opts.url : ''
    if (!publicUrl || !publicUrl.includes('pdf')) {
      publicUrl = await uploadPdfForShare(orderId, file, 'label')
    }
    return { file, publicUrl }
  }

  async function shareExistingLabel() {
    if (!labelUrl) return
    setSharing(true)
    setError('')
    setHint('Preparing PDF link for FlashLabel…')
    try {
      const { file, publicUrl } = await ensurePublicPdf({
        url: labelUrl,
        filename: `shipping-label-${tracking || orderId}.pdf`,
      })
      setLabelUrl(publicUrl)
      const result = await sharePdfWithFlashLabel({ file, publicUrl })
      if (result === 'unsupported') {
        downloadPdfFile(file)
        setHint(`PDF saved. Also copy this link into FlashLabel if needed:\n${publicUrl}`)
      } else {
        setHint('Shared PDF link. Pick FlashLabel Pro in the share sheet.')
      }
    } catch (err) {
      if (isAbortError(err)) {
        setHint('')
        return
      }
      setError(err instanceof Error ? err.message : 'Could not share PDF.')
      setHint('')
    } finally {
      setSharing(false)
    }
  }

  async function saveExistingLabel() {
    if (!labelUrl) return
    setSharing(true)
    setError('')
    try {
      const { file, publicUrl } = await ensurePublicPdf({
        url: labelUrl,
        filename: `shipping-label-${tracking || orderId}.pdf`,
      })
      setLabelUrl(publicUrl)
      downloadPdfFile(file)
      setHint(`PDF saved. FlashLabel → PDF Print → Import PDF.\n${publicUrl}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save PDF.')
    } finally {
      setSharing(false)
    }
  }

  async function printLabel() {
    setLoading(true)
    setError('')
    setHint('')
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

      const nextTracking = typeof data.trackingNumber === 'string' ? data.trackingNumber : ''
      setTracking(nextTracking)
      setPostage(typeof data.postage === 'number' ? data.postage : null)
      if (data.labelUrl) setLabelUrl(data.labelUrl)
      router.refresh()

      const labelName = `shipping-label-${nextTracking || orderId}.pdf`
      setHint('Preparing PDF link for FlashLabel…')

      const { file, publicUrl } = await ensurePublicPdf({
        url: typeof data.labelUrl === 'string' ? data.labelUrl : null,
        base64: typeof data.labelPdfBase64 === 'string' ? data.labelPdfBase64 : null,
        filename: labelName,
      })
      setLabelUrl(publicUrl)

      const result = await sharePdfWithFlashLabel({ file, publicUrl })
      if (result === 'unsupported') {
        downloadPdfFile(file)
        setHint(`PDF saved for FlashLabel Import.\n${publicUrl}`)
      } else {
        setHint('Shared PDF link — choose FlashLabel Pro.')
      }
    } catch (err) {
      if (isAbortError(err)) {
        setHint('')
        return
      }
      setError(err instanceof Error ? err.message : 'Could not share label PDF.')
    } finally {
      setLoading(false)
    }
  }

  function openPdf() {
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
        <p className="text-xs text-emerald-800">
          Share sends a public <strong>PDF link</strong> FlashLabel Pro can open (not just a phone
          file).
        </p>
        {error ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {hint ? (
          <p className="whitespace-pre-wrap break-all text-sm font-medium text-emerald-900" role="status">
            {hint}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {labelUrl ? (
            <>
              <Button type="button" onClick={() => void shareExistingLabel()} disabled={sharing}>
                <Share2 className="mr-1.5 h-4 w-4" aria-hidden />
                {sharing ? 'Preparing…' : 'Share PDF to FlashLabel'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void saveExistingLabel()}
                disabled={sharing}
              >
                <Download className="mr-1.5 h-4 w-4" aria-hidden />
                Save PDF
              </Button>
              <Button type="button" variant="outline" onClick={openPdf}>
                <Printer className="mr-1.5 h-4 w-4" aria-hidden />
                Open PDF
              </Button>
            </>
          ) : null}
        </div>
        {!canShareFiles ? (
          <p className="text-xs text-amber-800">Use Save PDF → FlashLabel Import PDF on this phone.</p>
        ) : null}
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
        <p className="mt-2 text-xs text-earth-500">
          Creates a public PDF link, then opens Share for FlashLabel Pro.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-earth-200 bg-earth-50 p-3">
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

      {estimate && (
        <p className="text-sm font-semibold text-earth-900">
          Estimated postage: <span className="text-brand-700">${estimate.price.toFixed(2)}</span>
          <span className="ml-1 font-normal text-earth-500">· {estimate.description}</span>
        </p>
      )}
      {rateError && <p className="text-xs font-medium text-amber-800">{rateError}</p>}
      {error && (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      {hint && (
        <p className="whitespace-pre-wrap break-all text-sm font-medium text-emerald-800" role="status">
          {hint}
        </p>
      )}

      <Button
        type="button"
        size="lg"
        className="h-12 w-full sm:w-auto"
        onClick={() => void printLabel()}
        disabled={loading}
      >
        <Share2 className="mr-2 h-5 w-5" aria-hidden />
        {loading ? 'Creating label…' : 'Create & share PDF'}
      </Button>
    </div>
  )
}
