'use client'

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { Appearance, StripeElementsOptions } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getStripeBrowser, isStripePublishableKeyConfigured } from '@/lib/stripe-browser'
import { cn } from '@/lib/utils'

type Props = {
  clientSecret: string
  returnUrl: string
  totalLabel: string
}

const CHECKOUT_APPEARANCE: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#006b3e',
    colorBackground: '#ffffff',
    colorText: '#18181b',
    colorDanger: '#b91c1c',
    borderRadius: '10px',
    fontFamily: 'Montserrat, system-ui, sans-serif',
  },
  rules: {
    '.Tab': {
      border: '1px solid #e6e6e3',
      boxShadow: 'none',
    },
    '.Tab--selected': {
      border: '1px solid #006b3e',
      color: '#006b3e',
    },
    '.Label': {
      fontWeight: '600',
    },
  },
}

function paymentIntentIdFromClientSecret(clientSecret: string): string | null {
  const idx = clientSecret.indexOf('_secret_')
  if (idx <= 0) return null
  return clientSecret.slice(0, idx)
}

function PayForm({ clientSecret, returnUrl, totalLabel }: Props) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const returnUrlReady = returnUrl.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) {
      setError('Payment form is still loading. Wait a few seconds and try again.')
      return
    }
    if (!returnUrlReady) {
      setError('Checkout is still loading. Please wait and try again.')
      return
    }

    setBusy(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Please check your payment details.')
      setBusy(false)
      return
    }

    const confirmPromise = stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    })

    const timeoutMs = 90_000
    let stripeError: { message?: string } | undefined

    try {
      const result = await Promise.race([
        confirmPromise,
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('timeout')), timeoutMs)
        }),
      ])
      stripeError = result.error
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'timeout'
          ? 'Payment is taking too long. If your card was charged, check your email or Account → orders. Otherwise try again.'
          : 'Payment could not be completed. Please try again.'
      setError(msg)
      setBusy(false)
      return
    }

    if (stripeError) {
      setError(stripeError.message ?? 'Payment could not be completed.')
      setBusy(false)
      return
    }

    const piId = paymentIntentIdFromClientSecret(clientSecret)
    if (piId) {
      router.push(`/checkout/success?payment_intent=${encodeURIComponent(piId)}`)
      return
    }
    router.push('/checkout/success')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-earth-200 bg-white p-3 sm:p-4">
        <PaymentElement
          options={{
            paymentMethodOrder: ['card'],
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mx-1 max-md:border-t max-md:border-earth-200 max-md:bg-white max-md:px-1 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:pt-3">
        <Button
          type="submit"
          size="lg"
          disabled={!stripe || !elements || busy || !returnUrlReady}
          className={cn(
            'h-14 w-full rounded-xl text-base font-bold tracking-tight',
            'bg-brand-700 shadow-[var(--shadow-card-hover)] hover:bg-brand-800',
            'focus-visible:ring-4 focus-visible:ring-brand-600/30'
          )}
        >
          {!returnUrlReady
            ? 'Loading payment…'
            : busy
              ? 'Processing…'
              : `Pay ${totalLabel}`}
        </Button>
      </div>
    </form>
  )
}

export function CheckoutStripePayment({ clientSecret, returnUrl, totalLabel }: Props) {
  const stripePromise = useMemo(() => getStripeBrowser(), [])

  const elementsOptions: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: CHECKOUT_APPEARANCE,
    }),
    [clientSecret]
  )

  if (!isStripePublishableKeyConfigured()) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-red-700">
          Payments are not configured: <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> is missing.
        </p>
        <p className="text-sm text-earth-500">
          Set it in Vercel → Environment Variables using the publishable key from the same Stripe
          account as <code>STRIPE_SECRET_KEY</code>.
        </p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PayForm clientSecret={clientSecret} returnUrl={returnUrl} totalLabel={totalLabel} />
    </Elements>
  )
}
