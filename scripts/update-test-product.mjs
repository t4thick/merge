import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) process.exit(1)

const supabase = createClient(url, key)

const PRODUCT_ID = '0cd4d413-8278-4baa-b655-388e291ef0e3'
const SNACK_IMAGE =
  'https://images.unsplash.com/photo-1604719312497-c6fc196f51ec?auto=format&fit=crop&w=800&q=80'

const updates = {
  name: 'Payment test item ($0.60)',
  description: 'Live checkout test — Snack category, no sales tax. Safe for payment verification.',
  price: 0.6,
  category: 'Snack',
  in_stock: false,
  image_url: SNACK_IMAGE,
}

const { data: byId } = await supabase.from('products').select('id,name,price').eq('id', PRODUCT_ID).maybeSingle()

let targetId = byId?.id

if (!targetId) {
  const { data: byName } = await supabase
    .from('products')
    .select('id,name,price')
    .ilike('name', '%checkout test%')
    .maybeSingle()
  targetId = byName?.id
}

if (!targetId) {
  const { data: inserted, error } = await supabase
    .from('products')
    .insert(updates)
    .select('id,name,price,category,in_stock,image_url')
    .single()
  if (error) {
    console.error(error.message)
    process.exit(1)
  }
  console.log('Created:', inserted)
  console.log(`https://kintampoafricanmarket.com/products/${inserted.id}`)
  process.exit(0)
}

const { data, error } = await supabase
  .from('products')
  .update(updates)
  .eq('id', targetId)
  .select('id,name,price,category,in_stock,image_url')
  .single()

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log('Updated:', data)
console.log(`https://kintampoafricanmarket.com/products/${data.id}`)
console.log('Shop filter: https://kintampoafricanmarket.com/shop?category=Snack')
