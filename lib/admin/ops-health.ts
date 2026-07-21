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

function emailHealthDetail(): { ok: boolean; detail: string } {
  const transport = emailTransport()
  const inbox = hasMerchantInbox()
  const phoneBuzz = hasCarrierSmsGateway()

  if (transport && inbox) {
    const via =
      transport === 'gmail' ? 'Gmail' : transport === 'smtp' ? 'SMTP' : 'Postmark'
    const phone = phoneBuzz ? ' · phone buzz via carrier gateway' : ''
    return {
      ok: true,
      detail: `Email setup complete — ${via} sending receipts and order alerts${phone}`,
    }
  }

  if (transport && !inbox) {
    return {
      ok: false,
      detail: 'Transport ready — add MERCHANT_ORDER_EMAIL on Vercel (where alerts go)',
    }
  }

  if (!transport && inbox) {
    return {
      ok: false,
      detail: 'MERCHANT_ORDER_EMAIL set — add Gmail, SMTP, or Postmark + EMAIL_FROM to send',
    }
  }

  return {
    ok: false,
    detail: 'Set GMAIL_USER + GMAIL_APP_PASSWORD, or Postmark + EMAIL_FROM, plus MERCHANT_ORDER_EMAIL',
  }
}

function isStripeConfigured(): boolean {
  return (
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim())
  )
}

function isTwilioConfigured(): boolean {
  return (
    Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()) &&
    Boolean(process.env.TWILIO_FROM_NUMBER?.trim()) &&
    Boolean(process.env.MERCHANT_ALERT_PHONE?.trim())
  )
}

function smsHealthDetail(): { ok: boolean; detail: string } {
  if (isTwilioConfigured()) {
    return { ok: true, detail: 'Twilio SMS alerts on' }
  }
  if (hasCarrierSmsGateway() && emailTransport()) {
    return { ok: true, detail: 'Phone buzz via MERCHANT_SMS_GATEWAY_EMAIL (free carrier gateway)' }
  }
  if (hasCarrierSmsGateway() && !emailTransport()) {
    return {
      ok: false,
      detail: 'Gateway set — finish email setup first (gateway uses the same mail transport)',
    }
  }
  return {
    ok: false,
    detail: 'Optional — set MERCHANT_SMS_GATEWAY_EMAIL (free) or Twilio',
  }
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
  const email = emailHealthDetail()
  const sms = smsHealthDetail()

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
      ok: email.ok,
      detail: email.detail,
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
      label: 'Phone alerts',
      ok: sms.ok,
      detail: sms.detail,
    },
  ]

  // Phone alerts optional — don't count against required readiness.
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
