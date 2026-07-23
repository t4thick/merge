import Link from 'next/link'
import { CheckCircle2, Circle, Truck } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { getShippingLabelConfigPublic } from '@/lib/shipping/label-config'
import { isShippoConfigured, isUspsLabelsLive } from '@/lib/shipping/admin-ship-methods'
import { getUspsConfigPublic } from '@/lib/shipping/usps-config'
import { CreateTestShippingOrderButton } from '@/components/admin/CreateTestShippingOrderButton'

export default async function AdminShippingPage() {
  await requireAdminPage()
  const cfg = getShippingLabelConfigPublic()
  const usps = getUspsConfigPublic()
  const shippoReady = isShippoConfigured()
  const uspsReady = isUspsLabelsLive() && usps.uspsConfigured
  const labelsReady = shippoReady || uspsReady
  const activeProvider = shippoReady ? 'Shippo' : uspsReady ? 'USPS Labels API' : null

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title flex items-center gap-2">
            <Truck className="h-7 w-7 text-brand-700" aria-hidden />
            Shipping workflow
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-earth-600">
            One clear path for labels. Prefer Shippo for one-click print from an order page; otherwise
            paste tracking from Click-N-Ship.
          </p>
        </div>
        <CreateTestShippingOrderButton />
      </div>

      <section
        className={`admin-card border ${
          labelsReady ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/50'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              labelsReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {labelsReady ? 'Labels ready' : 'Labels not ready'}
          </span>
          <p className="text-sm text-earth-800">
            {activeProvider
              ? `Active provider: ${activeProvider}. Open any ship order → Print in admin.`
              : 'No label API connected. Use Click-N-Ship and paste tracking, or add SHIPPO_API_TOKEN on Vercel.'}
          </p>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <StatusRow ok={shippoReady} label="Shippo API token (preferred)" />
          <StatusRow ok={Boolean(cfg.shipFrom)} label="Ship-from address (SHIP_FROM_*)" />
          <StatusRow ok={usps.hasCredentials} label="USPS API credentials (optional fallback)" />
          <StatusRow
            ok={uspsReady}
            label="USPS Labels live (USPS_LABELS_ENABLED=1 + EPS setup)"
          />
        </ul>
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">Recommended: Shippo</h2>
        <p className="mt-2 text-sm text-earth-600">
          Set <code className="text-xs">SHIPPO_API_TOKEN</code> on Vercel Production and redeploy.
          Postage bills to your Shippo wallet. No USPS EPS approval required.
        </p>
        {!shippoReady && (
          <p className="mt-3 text-sm text-amber-900">
            Shippo is not configured yet — one-click print is unavailable.
          </p>
        )}
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">Optional: USPS Labels API</h2>
        <p className="mt-2 text-sm text-earth-600">
          Only needed if you are not using Shippo. Requires a USPS business account with Enterprise
          Payment System (EPS) and a developer app at{' '}
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
        <ul className="mt-3 space-y-1 font-mono text-xs text-earth-800">
          <li>USPS_API_CLIENT_ID / USPS_API_CLIENT_SECRET</li>
          <li>USPS_EPS_ACCOUNT_NUMBER · USPS_CRID · USPS_MID</li>
          <li>USPS_LABELS_ENABLED=1</li>
        </ul>
        {usps.useTestApi ? (
          <p className="mt-3 text-sm text-amber-800">Test mode: USPS_API_USE_TEST=1.</p>
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
          <Link
            href="/admin/orders?queue=needs_action"
            className="text-sm font-medium text-brand-700 no-underline hover:underline"
          >
            Go to orders needing action →
          </Link>
        </p>
      </section>

      <section className="admin-card">
        <h2 className="admin-section-title">Label PDF storage</h2>
        <p className="mt-2 text-sm text-earth-600">
          Run <code className="text-xs">supabase/shipping-labels-storage.sql</code> once to create the{' '}
          <code className="text-xs">shipping-labels</code> bucket. Labels still print if storage is
          missing; PDF just won&apos;t be saved for re-download.
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
