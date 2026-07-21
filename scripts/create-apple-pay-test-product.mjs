/**
 * Inserts or updates the live checkout test product ($0.60, Snack = no tax).
 *
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

const SNACK_IMAGE =
  'https://images.unsplash.com/photo-1604719312497-c6fc196f51ec?auto=format&fit=crop&w=800&q=80'

const row = {
  name: 'Payment test item ($0.60)',
  description: 'Live checkout test — Snack category, no sales tax. Safe for payment verification.',
  price: 0.6,
  category: 'Snack',
  image_url: SNACK_IMAGE,
  in_stock: true,
}

const { data: existing } = await supabase
  .from('products')
  .select('id, name, price')
  .ilike('name', 'Payment test item%')
  .maybeSingle()

if (existing) {
  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('id', existing.id)
    .select('id, name, price, category')
    .single()
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log('Updated:', data)
  console.log(`/products/${data.id}`)
  process.exit(0)
}

const { data, error } = await supabase.from('products').insert(row).select('id, name, price, category').single()

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log('Created:', data)
console.log(`/products/${data.id}`)
