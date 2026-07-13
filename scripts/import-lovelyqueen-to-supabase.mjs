/**
 * Import organized lovelyqueenmart catalog into Supabase products table.
 * Requires: ../lovelyqueen-scrape/organized_catalog.json
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function mustEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

const catalogPath = path.resolve(process.cwd(), '..', 'lovelyqueen-scrape', 'organized_catalog.json')
if (!fs.existsSync(catalogPath)) {
  throw new Error(`Missing ${catalogPath} — run scrape + classify first`)
}

const { organized } = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

const supabase = createClient(mustEnv('NEXT_PUBLIC_SUPABASE_URL'), mustEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false },
})

const rows = organized.map((p) => ({
  name: p.name,
  description: p.description,
  price: p.price,
  category: p.store_category,
  image_url: p.image_url || null,
  in_stock: p.in_stock,
}))

console.log(`Importing ${rows.length} products from lovelyqueenmart.com`)

const { data: referencedItems, error: refsError } = await supabase
  .from('order_items')
  .select('product_id')
  .not('product_id', 'is', null)

if (refsError) throw new Error(refsError.message)

const referencedIds = new Set((referencedItems ?? []).map((r) => r.product_id))
const { data: existingProducts, error: existingError } = await supabase.from('products').select('id')
if (existingError) throw new Error(existingError.message)

const deletableIds = (existingProducts ?? []).map((p) => p.id).filter((id) => !referencedIds.has(id))

for (let i = 0; i < deletableIds.length; i += 150) {
  const chunk = deletableIds.slice(i, i + 150)
  const { error } = await supabase.from('products').delete().in('id', chunk)
  if (error) throw new Error(error.message)
}

console.log(`Removed ${deletableIds.length} old products (kept ${referencedIds.size} referenced by orders)`)

let inserted = 0
for (let i = 0; i < rows.length; i += 200) {
  const chunk = rows.slice(i, i + 200)
  const { error } = await supabase.from('products').insert(chunk)
  if (error) throw new Error(`Insert batch failed: ${error.message}`)
  inserted += chunk.length
  console.log(`Inserted ${inserted}/${rows.length}`)
}

const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })
console.log(`DONE — Supabase products count: ${count}`)
