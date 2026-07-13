'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ExternalLink } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AdminShipMethod } from '@/lib/shipping/admin-ship-methods'

const PROVIDER = {
  'click-n-ship': {
    name: 'USPS Click-N-Ship',
    href: 'https://cns.usps.com/label-manager/new-label/shipping-info',
    openLabel: 'Open Click-N-Ship',
    trackingLabel: 'USPS tracking number',
    note: 'Tracking added — label from USPS Click-N-Ship',
    step2: 'Buy and print the label in USPS Click-N-Ship (your business rates).',
  },
  shippo: {
    name: 'Shippo',
    href: 'https://apps.goshippo.com/',
    openLabel: 'Open Shippo',
    trackingLabel: 'Tracking number',
    note: 'Tracking added — label from Shippo',
    step2: 'Create the label in Shippo (USPS Ground Advantage or your carrier).',
  },
} as const

type Props = {
  provider: Exclude<AdminShipMethod, 'integrated'>
  orderId: string
  initialTracking?: string | null
  currentStatus: string
}

export function ExternalLabelTrackingPanel({
  provider,
  orderId,
  initialTracking,
  currentStatus,
}: Props) {
  const cfg = PROVIDER[provider]
  const router = useRouter()
  const [tracking, setTracking] = useState(initialTracking ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const trimmed = tracking.trim()
  const dirty = trimmed !== (initialTracking ?? '').trim()

  async function markShipped(e: React.FormEvent) {
    e.preventDefault()
    if (!trimmed) {
      setError(`Enter the tracking number from ${cfg.name}.`)
      return
    }
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'shipped' || currentStatus === 'delivered' ? currentStatus : 'shipped',
          trackingNumber: trimmed,
          note: cfg.note,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not save tracking.')
        return
      }
      setSaved(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <ol className="list-inside list-decimal space-y-1.5 text-sm text-earth-600">
        <li>Print the packing slip from this order (button above).</li>
        <li>{cfg.step2}</li>
        <li>Paste tracking below → save and mark shipped.</li>
      </ol>

      <a
        href={cfg.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full sm:w-auto')}
      >
        <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
        {cfg.openLabel}
      </a>

      <form onSubmit={markShipped} className="space-y-3 border-t border-earth-200 pt-4">
        <div className="space-y-1.5">
          <label className="form-label" htmlFor={`${provider}-tracking`}>
            {cfg.trackingLabel}
          </label>
          <Input
            id={`${provider}-tracking`}
            type="text"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="9400 1000 0000 0000 0000 00"
            className="font-mono text-sm"
            autoComplete="off"
          />
        </div>
        {error ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
            <Check className="h-4 w-4" aria-hidden />
            Saved — customer can track this order
          </p>
        ) : null}
        <Button type="submit" disabled={loading || (!dirty && Boolean(initialTracking))}>
          {loading ? 'Saving…' : 'Save tracking & mark shipped'}
        </Button>
      </form>
    </div>
  )
}
