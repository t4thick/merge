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

function carrierGateway(): string | null {
  const raw = process.env.MERCHANT_SMS_GATEWAY_EMAIL?.trim()
  return raw || null
}

function smsHealthDetail(): { ok: boolean; detail: string; completeBadge: boolean } {
  const gateway = carrierGateway()
  const transport = emailTransport()

  if (gateway && transport) {
    return {
      ok: true,
      completeBadge: true,
      detail: `Phone alerts complete — texts via carrier gateway (${gateway})`,
    }
  }

  if (gateway && !transport) {
    return {
      ok: false,
      completeBadge: false,
      detail:
        'Gateway set — add GMAIL_USER + GMAIL_APP_PASSWORD (send pipe only; not full order email yet)',
    }
  }

  if (!gateway && transport) {
    return {
      ok: false,
      completeBadge: false,
      detail:
        'Add MERCHANT_SMS_GATEWAY_EMAIL — e.g. 6143778297@vtext.com (Verizon) or txt.att.net (AT&T)',
    }
  }

  return {
    ok: false,
    completeBadge: false,
    detail:
      'Set MERCHANT_SMS_GATEWAY_EMAIL (phone@carrier) + GMAIL_USER + GMAIL_APP_PASSWORD on Vercel',
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
      detail: `Email setup complete — ${via} sending receipts and inbox alerts`,
    }
  }

  if (transport && !inbox && carrierGateway()) {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Optional later — phone alerts work; add MERCHANT_ORDER_EMAIL for inbox copies',
    }
  }

  if (transport && !inbox) {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Optional later — add MERCHANT_ORDER_EMAIL when you want full order emails',
    }
  }

  return {
    ok: false,
    completeBadge: false,
    detail: 'Optional later — customer receipts and merchant inbox (after phone alerts)',
  }
}

function stripeKeyMode(): 'live' | 'test' | 'mixed' | 'missing' {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? ''
  const sk = process.env.STRIPE_SECRET_KEY?.trim() ?? ''
  if (!pk || !sk) return 'missing'
  const pkLive = pk.startsWith('pk_live_')
  const skLive = sk.startsWith('sk_live_')
  if (pkLive && skLive) return 'live'
  if (pk.startsWith('pk_test_') && sk.startsWith('sk_test_')) return 'test'
  return 'mixed'
}

function isStripeConfigured(): boolean {
  return (
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  )
}

function stripeHealthDetail(): { ok: boolean; detail: string; completeBadge: boolean } {
  const configured = isStripeConfigured()
  const mode = stripeKeyMode()

  if (!configured) {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Missing Stripe keys — checkout returns errors',
    }
  }

  if (mode === 'mixed') {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Key mismatch — pk and sk must both be live or both be test',
    }
  }

  if (mode === 'test') {
    return {
      ok: false,
      completeBadge: false,
      detail: 'Test keys on server — swap to pk_live_ / sk_live_ on Vercel for real charges',
    }
  }

  return {
    ok: true,
    completeBadge: true,
    detail: 'Live keys + webhook set — real payments enabled',
  }
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
  const stripe = stripeHealthDetail()

  const items: OpsHealthItem[] = [
    {
      id: 'sms',
      label: 'Phone alerts (carrier)',
      ok: sms.ok,
      detail: sms.detail,
      completeBadge: sms.completeBadge,
    },
    {
      id: 'stripe',
      label: 'Payments (Stripe)',
      ok: stripe.ok,
      detail: stripe.detail,
      completeBadge: stripe.completeBadge,
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
