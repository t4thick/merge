/**
 * Register production domains for Apple Pay / Google Pay (required or wallets stay hidden).
 *
 *   node --env-file=.env.vercel.production scripts/register-stripe-apple-pay-domains.mjs
 */

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY?.trim()
if (!key) {
  console.error('STRIPE_SECRET_KEY is required.')
  process.exit(1)
}

const stripe = new Stripe(key, { typescript: false })

const domains = [
  // Add your production Vercel domain(s) here, e.g. 'kintampo-market.vercel.app',
  'chuck-and-rich.vercel.app',
]

for (const domain_name of domains) {
  try {
    const row = await stripe.applePayDomains.create({ domain_name })
    console.log('Registered:', domain_name, row.id ?? '')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('already exists') || msg.includes('already registered')) {
      console.log('Already registered:', domain_name)
    } else {
      console.error('Failed:', domain_name, msg)
    }
  }
}

const list = await stripe.applePayDomains.list({ limit: 20 })
console.log(
  '\nApple Pay domains on this Stripe account:',
  list.data.map((d) => d.domain_name).join(', ') || '(none)'
)
