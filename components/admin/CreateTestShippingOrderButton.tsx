'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CreateTestShippingOrderButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    if (
      !confirm(
        'Create a fake shipping order to Chicago so you can try Print label?\n\nCreating the order is free. Buying a label in Shippo will charge real postage — cancel after Get rate if you only want to see the price.'
      )
    ) {
      return
    }

    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/orders/create-test', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Could not create test order.')
        return
      }
      router.push(`/admin/orders/${data.orderId}`)
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={create} className="gap-1.5">
        <PackagePlus className="h-4 w-4" aria-hidden />
        {busy ? 'Creating…' : 'Create test ship order'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
