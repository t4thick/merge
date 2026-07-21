/**
 * Inserts a $1 in-stock Snack product for live checkout testing.
 *
 *   node --env-file=.env.local scripts/create-apple-pay-test-product.mjs
 *   npx vercel env run -e production '--' node scripts/create-apple-pay-test-product.mjs
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
  name: 'Checkout test item ($1)',
  description: 'Internal test product for live payment verification. Not for resale.',
  price: 1,
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
console.log(`/products/${data.id} (open on your deployed domain)`)
