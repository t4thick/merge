/**
 * Inserts a $0.55 in-stock Snack product for live Apple Pay / checkout testing.
 *
 *   node --env-file=.env.local scripts/create-apple-pay-test-product.mjs
 *   node --env-file=.env.vercel.production scripts/create-apple-pay-test-product.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env file.')
  process.exit(1)
}

const supabase = createClient(url, key)

const row = {
  name: 'Apple Pay test item ($0.55)',
  description: 'Internal test product for payment verification. Not for resale.',
  price: 0.55,
  category: 'Snack',
  image_url: null,
  in_stock: true,
}

const { data: existing } = await supabase
  .from('products')
  .select('id, name, price')
  .eq('name', row.name)
  .maybeSingle()

if (existing) {
  console.log('Already exists:', existing)
  console.log(`Shop: /products/${existing.id}`)
  process.exit(0)
}

const { data, error } = await supabase.from('products').insert(row).select('id, name, price, category').single()

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log('Created:', data)
console.log(`https://lovely-queen-market.vercel.app/products/${data.id}`)
