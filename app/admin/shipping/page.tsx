import Link from 'next/link'
import { Truck } from 'lucide-react'
import { requireAdminPage } from '@/lib/auth/require-admin-page'
import { getShippingLabelConfigPublic } from '@/lib/shipping/label-config'
import { isShippoConfigured, isUspsLabelsLive } from '@/lib/shipping/admin-ship-methods'
import { getUspsConfigPublic } from '@/lib/shipping/usps-config'

export default async function AdminShippingPage() {
  await requireAdminPage()
  const cfg = getShippingLabelConfigPublic()
  const usps = getUspsConfigPublic()
  const shippoReady = isShippoConfigured()
  const uspsReady = isUspsLabelsLive() && usps.uspsConfigured
  const activeProvider = shippoReady ? 'Shippo' : uspsReady ? 'USPS' : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="admin-page-title flex items-center gap-2">
          <Truck className="h-7 w-7 text-brand-700" aria-hidden />
          Shipping
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-earth-600">
          Print labels from each order page. Tracking is saved on the order automatically.
        </p>
      </div>

      <section className="admin-card">
        <h2 className="admin-section-title">Label printing</h2>
        <p className="mt-2 text-sm text-earth-700">
          {activeProvider
            ? `Active: ${activeProvider}. Open any shipped order to print a label.`
            : 'Label printing is not connected. Use Click-N-Ship and paste tracking on the order.'}
        </p>
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
          <p className="mt-2 text-sm text-earth-600">Store ship-from address is not set.</p>
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
    </div>
  )
}
