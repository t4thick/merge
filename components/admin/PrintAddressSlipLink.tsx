import Link from 'next/link'
import { FileText, Share2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PrintAddressSlipLink({
  orderId,
  isPickup,
}: {
  orderId: string
  isPickup: boolean
}) {
  if (isPickup) return null

  return (
    <div className="rounded-lg border border-earth-200 bg-earth-50 p-4">
      <p className="text-sm font-semibold text-earth-900">Pay at post office / UPS store</p>
      <p className="mt-1 text-sm text-earth-600">
        Share or print an address slip, tape it on the box, pay postage in person. Paste tracking in
        admin when you get it.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/admin/orders/${orderId}/print-slip`}
          className={cn(buttonVariants({ variant: 'default', size: 'default' }))}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share / print address slip
        </Link>
        <Link
          href={`/admin/orders/${orderId}/print-slip`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}
        >
          <FileText className="h-4 w-4" aria-hidden />
          Open slip
        </Link>
      </div>
    </div>
  )
}
