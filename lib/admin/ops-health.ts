/**
 * Server-side ops readiness checks for the admin Overview.
 * Surfaces missing env/provider wiring so fulfillment doesn't rely on memory.
 */

import { isShippoConfigured, isUspsLabelsLive } from '@/lib/shipping/admin-ship-methods'
import { getUspsConfigPublic } from '@/lib/shipping/usps-config'
import { getShippingLabelConfigPublic } from '@/lib/shipping/label-config'

export type OpsHealthItem = {
  id: string
  label: string
  ok: boolean
  detail: string
  href?: string
}

function isEmailTransportConfigured(): boolean {
  const gmail =
    Boolean(process.env.GMAIL_USER?.trim()) && Boolean(process.env.GMAIL_APP_PASSWORD?.trim())
  const smtp =
    Boolean(process.env.SMTP_HOST?.trim()) &&
    Boolean(process.env.SMTP_USER?.trim()) &&
    Boolean(process.env.SMTP_PASS?.trim())
  const postmark = Boolean(process.env.POSTMARK_SERVER_TOKEN?.trim())
  return gmail || smtp || postmark
}

function isStripeConfigured(): boolean {
  return (
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  )
}

function isSmsConfigured(): boolean {
  return (
    Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()) &&
    Boolean(process.env.TWILIO_FROM_NUMBER?.trim()) &&
    Boolean(process.env.MERCHANT_ALERT_PHONE?.trim())
  )
}

export function getOpsHealth(): {
  items: OpsHealthItem[]
  readyCount: number
  totalCount: number
  labelsReady: boolean
} {
  const usps = getUspsConfigPublic()
  const shipCfg = getShippingLabelConfigPublic()
  const shippo = isShippoConfigured()
  const uspsLive = isUspsLabelsLive() && usps.uspsConfigured
  const labelsReady = shippo || uspsLive

  const items: OpsHealthItem[] = [
    {
      id: 'stripe',
      label: 'Payments (Stripe)',
      ok: isStripeConfigured(),
      detail: isStripeConfigured()
        ? 'Secret, publishable, and webhook keys set'
        : 'Missing Stripe keys — checkout returns errors',
    },
    {
      id: 'email',
      label: 'Order email',
      ok: isEmailTransportConfigured(),
      detail: isEmailTransportConfigured()
        ? 'Customer / merchant emails can send'
        : 'No email transport — orders won’t notify anyone',
    },
    {
      id: 'labels',
      label: 'Label printing',
      ok: labelsReady,
      detail: shippo
        ? 'Shippo ready — print from order page'
        : uspsLive
          ? 'USPS Labels API ready'
          : 'Set SHIPPO_API_TOKEN or finish USPS Labels setup',
      href: '/admin/shipping',
    },
    {
      id: 'ship-from',
      label: 'Ship-from address',
      ok: Boolean(shipCfg.shipFrom),
      detail: shipCfg.shipFrom
        ? `${shipCfg.shipFrom.city}, ${shipCfg.shipFrom.state}`
        : 'Set SHIP_FROM_* on Vercel',
      href: '/admin/shipping',
    },
    {
      id: 'sms',
      label: 'SMS alerts',
      ok: isSmsConfigured(),
      detail: isSmsConfigured()
        ? 'Twilio merchant SMS on'
        : 'Optional — Twilio not configured',
    },
  ]

  // SMS is optional — don't count against "must fix" readiness for labels/payments.
  const required = items.filter((i) => i.id !== 'sms')
  return {
    items,
    readyCount: required.filter((i) => i.ok).length,
    totalCount: required.length,
    labelsReady,
  }
}

/** Order statuses that still need staff action. */
export const NEEDS_ACTION_STATUSES = ['ordered', 'processing', 'ready_for_pickup'] as const
