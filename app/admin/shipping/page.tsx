import Link from 'next/link'
import { CheckCircle2, Circle, Truck } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { getShippingLabelConfigPublic } from '@/lib/shipping/label-config'
import { isShippoConfigured } from '@/lib/shipping/admin-ship-methods'
import { getUspsConfigPublic } from '@/lib/shipping/usps-config'

export default async function AdminShippingPage() {
  await requireAdminPage()
  const cfg = getShippingLabelConfigPublic()
  const usps = getUspsConfigPublic()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="admin-page-title flex items-center gap-2">
          <Truck className="h-7 w-7 text-brand-700" aria-hidden />
          Shipping workflow
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-earth-600">
          Shippo is connected and active. Click <strong>Print in admin</strong> on any order to generate a USPS label instantly — postage billed to your Shippo account.
        </p>
      </div>

      <section className="admin-card">
        <h2 className="admin-section-title">Shipping status</h2>
        <ul className="mt-4 space-y-3 text-sm text-earth-700">
          <li className="flex gap-2">
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              Active
            </span>
            <span>
              <strong>Print in admin (Shippo)</strong> — one-click USPS Ground Advantage label from any order page. Postage billed to your Shippo account.
              {isShippoConfigured() ? ' API key on file ✓' : ''}
            </span>
          </li>
        </ul>
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">USPS API setup (one-click print)</h2>
        <p className="mt-2 text-sm text-earth-600">
          Requires a USPS business account with Enterprise Payment System (EPS) and a developer app at{' '}
          <a
            href="https://developer.usps.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-700 underline"
          >
            developer.usps.com
          </a>
          .
        </p>
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-earth-700">
          <li>
            Create an app → enable <strong>Labels</strong> and <strong>Domestic Prices</strong> (Products).
            Address verify only needs <strong>Addresses</strong>.
          </li>
          <li>Copy Consumer Key + Consumer Secret.</li>
          <li>
            From your USPS business account: EPS account number, CRID, MID (Mailer ID).
          </li>
          <li>Add env vars on Vercel (Production) and redeploy:</li>
        </ol>
        <ul className="mt-3 space-y-1 font-mono text-xs text-earth-800">
          <li>USPS_API_CLIENT_ID</li>
          <li>USPS_API_CLIENT_SECRET</li>
          <li>USPS_EPS_ACCOUNT_NUMBER</li>
          <li>USPS_CRID</li>
          <li>USPS_MID</li>
          <li>USPS_MAIL_CLASS=USPS_GROUND_ADVANTAGE</li>
          <li>USPS_API_USE_TEST=1 (optional — sandbox at apis-tem.usps.com)</li>
        </ul>
        <ul className="mt-4 space-y-2 text-sm">
          <StatusRow ok={usps.hasCredentials} label="USPS API credentials" />
          <StatusRow ok={usps.hasShipFrom} label="Ship-from address" />
          <StatusRow ok={usps.uspsConfigured} label="Ready to print labels" />
        </ul>
        {usps.useTestApi ? (
          <p className="mt-3 text-sm text-amber-800">Test mode: using USPS TEM API (USPS_API_USE_TEST=1).</p>
        ) : null}
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">Ship-from address</h2>
        {cfg.shipFrom ? (
          <div className="mt-3 rounded-lg border border-earth-200 bg-earth-50 px-4 py-3 text-sm text-earth-700">
            <p>
              {cfg.shipFrom.name}
              <br />
              {cfg.shipFrom.street1}
              {cfg.shipFrom.street2 ? `, ${cfg.shipFrom.street2}` : ''}
              <br />
              {cfg.shipFrom.city}, {cfg.shipFrom.state} {cfg.shipFrom.zip}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-earth-600">
            Set <code className="text-xs">SHIP_FROM_*</code> in Vercel.
          </p>
        )}
        <p className="mt-4">
          <Link href="/admin/orders" className="text-sm font-medium text-brand-700 no-underline hover:underline">
            Go to orders →
          </Link>
        </p>
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">Label PDF storage</h2>
        <p className="mt-2 text-sm text-earth-600">
          Run <code className="text-xs">supabase/shipping-labels-storage.sql</code> in Supabase SQL Editor
          once to create the <code className="text-xs">shipping-labels</code> bucket. Labels still print if
          storage is missing; PDF just won&apos;t be saved for re-download.
        </p>
      </section>
    </div>
  )
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
      ) : (
        <Circle className="h-4 w-4 text-earth-300" aria-hidden />
      )}
      <span className={ok ? 'text-earth-900' : 'text-earth-500'}>{label}</span>
    </li>
  )
}
