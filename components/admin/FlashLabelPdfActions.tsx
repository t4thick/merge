'use client'

import { useState } from 'react'
import { Check, Copy, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  downloadPdfFile,
  isAbortError,
  pdfFileFromBase64,
  pdfFileFromUrl,
  uploadPdfForShare,
} from '@/lib/client/share-label-pdf'

type Props = {
  orderId: string
  /** Existing https label URL if already saved on the order */
  labelUrl?: string | null
  /** Fresh PDF from create-label response */
  pdfBase64?: string | null
  tracking?: string | null
  /** address-slip | label — for upload path naming */
  kind?: 'label' | 'address-slip'
  /** Optional prebuilt File (e.g. generated address slip) */
  getFile?: () => Promise<File>
  className?: string
}

const FLASHLABEL_PACKAGE = 'com.flashlabel.flashlabelpro'

function openFlashLabelPro() {
  const intent = `intent://#Intent;package=${FLASHLABEL_PACKAGE};scheme=https;end`
  window.location.href = intent
  // Fallback to Play Store after a beat if app missing
  window.setTimeout(() => {
    window.open(
      `https://play.google.com/store/apps/details?id=${FLASHLABEL_PACKAGE}`,
      '_blank',
      'noopener,noreferrer'
    )
  }, 1800)
}

/**
 * FlashLabel Pro does not reliably accept Android Web Share from Chrome.
 * Official flow: save PDF to phone → PDF Print → Import PDF.
 */
export function FlashLabelPdfActions({
  orderId,
  labelUrl,
  pdfBase64,
  tracking,
  kind = 'label',
  getFile,
  className,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<'idle' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [publicUrl, setPublicUrl] = useState(labelUrl?.startsWith('https://') ? labelUrl : '')
  const [copied, setCopied] = useState(false)

  const filename = `${kind === 'address-slip' ? 'address-slip' : 'shipping-label'}-${
    tracking || orderId.slice(0, 8)
  }.pdf`

  async function resolveFile(): Promise<File> {
    if (getFile) return getFile()
    if (pdfBase64) return pdfFileFromBase64(pdfBase64, filename)
    if (labelUrl) return pdfFileFromUrl(labelUrl, filename)
    // Same-origin download endpoint (uses cookies)
    const res = await fetch(`/api/admin/orders/${orderId}/shipping/label-file`)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(typeof data.error === 'string' ? data.error : 'No PDF on this order yet.')
    }
    return new File([await res.blob()], filename, { type: 'application/pdf' })
  }

  async function handleDownload() {
    setBusy(true)
    setMessage('')
    setStep('idle')
    try {
      const file = await resolveFile()

      // Hard check — refuse to save anything that isn't a real PDF
      const head = new Uint8Array(await file.slice(0, 5).arrayBuffer())
      const magic = String.fromCharCode(...head)
      if (!magic.startsWith('%PDF')) {
        throw new Error('File is not a PDF (Samsung was getting an image before). Try again.')
      }

      downloadPdfFile(file)

      try {
        const url = await uploadPdfForShare(orderId, file, kind)
        setPublicUrl(url)
      } catch {
        if (labelUrl?.startsWith('https://')) setPublicUrl(labelUrl)
      }

      setStep('saved')
      setMessage(
        'PDF downloaded (not an image). Open FlashLabel Pro → PDF Print → Import PDF → pick this .pdf file from Downloads.'
      )
    } catch (err) {
      if (isAbortError(err)) return
      setStep('error')
      setMessage(err instanceof Error ? err.message : 'Could not download PDF.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCopyLink() {
    setBusy(true)
    setMessage('')
    try {
      let url = publicUrl
      if (!url) {
        const file = await resolveFile()
        url = await uploadPdfForShare(orderId, file, kind)
        setPublicUrl(url)
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setMessage('PDF link copied. You can paste it in Notes, then open/download on this phone.')
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setStep('error')
      setMessage(err instanceof Error ? err.message : 'Could not copy PDF link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={className}>
      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
        <p className="text-sm font-semibold text-earth-950">Print with FlashLabel Pro</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-earth-700">
          <li>
            Tap <strong>1. Download PDF</strong> (saves to Downloads)
          </li>
          <li>
            Tap <strong>2. Open FlashLabel Pro</strong>
          </li>
          <li>
            In the app: <strong>PDF Print → Import PDF</strong> → choose the downloaded file
          </li>
        </ol>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full sm:w-auto"
            onClick={() => void handleDownload()}
            disabled={busy}
          >
            <Download className="mr-2 h-5 w-5" aria-hidden />
            {busy ? 'Working…' : '1. Download PDF'}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 w-full sm:w-auto"
            onClick={openFlashLabelPro}
          >
            <ExternalLink className="mr-2 h-5 w-5" aria-hidden />
            2. Open FlashLabel Pro
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 w-full sm:w-auto"
            onClick={() => void handleCopyLink()}
            disabled={busy}
          >
            {copied ? (
              <Check className="mr-2 h-5 w-5" aria-hidden />
            ) : (
              <Copy className="mr-2 h-5 w-5" aria-hidden />
            )}
            {copied ? 'Copied' : 'Copy PDF link'}
          </Button>
        </div>

        {/* Same-origin attachment link — most reliable on Samsung Chrome */}
        <a
          href={`/api/admin/orders/${orderId}/shipping/label-file`}
          className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          download={filename}
        >
          Or tap here to download via browser
        </a>

        {message ? (
          <p
            className={`mt-3 whitespace-pre-wrap text-sm font-medium ${
              step === 'error' ? 'text-red-700' : 'text-emerald-900'
            }`}
            role="status"
          >
            {message}
          </p>
        ) : null}

        {publicUrl ? (
          <p className="mt-2 break-all text-xs text-earth-500">
            PDF link: <span className="font-mono text-earth-700">{publicUrl}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}
