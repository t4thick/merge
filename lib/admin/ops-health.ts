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
  /** Show green "Complete" pill when ok */
  completeBadge?: boolean
}

type EmailTransport = 'gmail' | 'smtp' | 'postmark' | null

function emailTransport(): EmailTransport {
  const gmail =
    Boolean(process.env.GMAIL_USER?.trim()) && Boolean(process.env.GMAIL_APP_PASSWORD?.trim())
  if (gmail) return 'gmail'
  const smtp =
    Boolean(process.env.SMTP_HOST?.trim()) &&
    Boolean(process.env.SMTP_USER?.trim()) &&
    Boolean(process.env.SMTP_PASS?.trim())
  if (smtp) return 'smtp'
  const postmark =
    Boolean(process.env.POSTMARK_SERVER_TOKEN?.trim()) && Boolean(process.env.EMAIL_FROM?.trim())
  if (postmark) return 'postmark'
  return null
}

function hasMerchantInbox(): boolean {
  return Boolean(process.env.MERCHANT_ORDER_EMAIL?.trim())
}

function hasCarrierSmsGateway(): boolean {
  return Boolean(process.env.MERCHANT_SMS_GATEWAY_EMAIL?.trim())
}

function isTwilioConfigured(): boolean {
  return (
    Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()) &&
    Boolean(process.env.TWILIO_FROM_NUMBER?.trim()) &&
    Boolean(process.env.MERCHANT_ALERT_PHONE?.trim())
  )
}

function formatAlertPhone(): string {
  const raw = process.env.MERCHANT_ALERT_PHONE?.trim() ?? ''
  if (raw.startsWith('+1') && raw.length === 12) {
    const d = raw.slice(2)
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  return raw
}

function smsHealthDetail(): { ok: boolean; detail: string; completeBadge: boolean } {
  if (isTwilioConfigured()) {
    const phone = formatAlertPhone()
    return {
      ok: true,
      completeBadge: true,
      detail: phone
        ? `SMS setup complete — new orders text ${phone}`
        : 'SMS setup complete — Twilio alerts on',
    }
  }

  const missing: string[] = []
  if (!process.env.TWILIO_ACCOUNT_SID?.trim()) missing.push('TWILIO_ACCOUNT_SID')
  if (!process.env.TWILIO_AUTH_TOKEN?.trim()) missing.push('TWILIO_AUTH_TOKEN')
  if (!process.env.TWILIO_FROM_NUMBER?.trim()) missing.push('TWILIO_FROM_NUMBER')
  if (!process.env.MERCHANT_ALERT_PHONE?.trim()) missing.push('MERCHANT_ALERT_PHONE')

  if (missing.length > 0 && missing.length < 4) {
    return {
      ok: false,
      completeBadge: false,
      detail: `Almost there — add ${missing.join(', ')} on Vercel`,
    }
  }

  return {
    ok: false,
    completeBadge: false,
    detail:
      'Step 1: Twilio account + number. Set all four TWILIO_* / MERCHANT_ALERT_PHONE vars (E.164, e.g. +16143778297). No email needed.',
  }
}

function emailHealthDetail(): { ok: boolean; detail: string; completeBadge: boolean } {
  const transport = emailTransport()
  const inbox = hasMerchantInbox()

  if (transport && inbox) {
    const via =
      transport === 'gmail' ? 'Gmail' : transport === 'smtp' ? 'SMTP' : 'Postmark'
    return {
      ok: true,
      completeBadge: true,
      detail: `Email setup complete — ${via} sending receipts and order alerts`,
    }
  }

  if (hasCarrierSmsGateway() && transport && !isTwilioConfigured()) {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Optional later — finish SMS first, then add MERCHANT_ORDER_EMAIL for inbox alerts',
    }
  }

  if (transport && !inbox) {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Optional later — transport ready; add MERCHANT_ORDER_EMAIL when you wire email',
    }
  }

  return {
    ok: false,
    completeBadge: false,
    detail: 'Optional later — Gmail or Postmark + MERCHANT_ORDER_EMAIL (after SMS)',
  }
}

function isStripeConfigured(): boolean {
  return (
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  )
}

export function getOpsHealth(): {
  items: OpsHealthItem[]
  readyCount: number
  totalCount: number
  labelsReady: boolean
  smsReady: boolean
} {
  const usps = getUspsConfigPublic()
  const shipCfg = getShippingLabelConfigPublic()
  const shippo = isShippoConfigured()
  const uspsLive = isUspsLabelsLive() && usps.uspsConfigured
  const labelsReady = shippo || uspsLive
  const sms = smsHealthDetail()
  const email = emailHealthDetail()

  // Phone alerts first — user rolls out one system at a time.
  const items: OpsHealthItem[] = [
    {
      id: 'sms',
      label: 'Phone alerts (SMS)',
      ok: sms.ok,
      detail: sms.detail,
      completeBadge: sms.completeBadge,
    },
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
      ok: email.ok,
      detail: email.detail,
      completeBadge: email.completeBadge,
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
  ]

  // Required for launch checklist: stripe + labels + ship-from (SMS tracked separately).
  const required = items.filter((i) => i.id !== 'email' && i.id !== 'sms')
  return {
    items,
    readyCount: required.filter((i) => i.ok).length,
    totalCount: required.length,
    labelsReady,
    smsReady: sms.ok,
  }
}

/** Order statuses that still need staff action. */
export const NEEDS_ACTION_STATUSES = ['ordered', 'processing', 'ready_for_pickup'] as const
