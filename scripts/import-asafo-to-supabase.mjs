import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function mustEnv(name) {
  const v = process.env[name]
  if (!v) {
    throw new Error(`Missing env var: ${name}`)
  }
  return v
}

function stripHtml(input) {
  if (!input) return ''
  return String(input)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function toMoney(priceRaw) {
  if (typeof priceRaw === 'string' && /^\d+$/.test(priceRaw)) {
    return Number((Number.parseInt(priceRaw, 10) / 100).toFixed(2))
  }
  const n = Number(priceRaw)
  if (Number.isFinite(n)) return Number(n.toFixed(2))
  return 0
}

const baseDir = path.resolve(process.cwd(), '..', 'asafo-scrape')
const productsJsonPath = path.join(baseDir, 'products.json')

if (!fs.existsSync(productsJsonPath)) {
  throw new Error(`products.json not found at: ${productsJsonPath}`)
}

const supabaseUrl = mustEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceRoleKey = mustEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const raw = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'))
const products = raw.products ?? []

const rows = products.map((p) => {
  const categories = Array.isArray(p.categories) ? p.categories : []
  const images = Array.isArray(p.images) ? p.images : []
  const description = stripHtml(p.short_description || p.description || '')
  return {
    name: stripHtml(p.name || 'Untitled Product'),
    description: description || null,
    price: toMoney(p?.prices?.price),
    category: stripHtml(categories[0]?.name || 'General'),
    image_url: images[0]?.src || null,
    in_stock: Boolean(p.is_in_stock),
  }
})

console.log(`Prepared ${rows.length} rows from ${productsJsonPath}`)

const { data: referencedItems, error: refsError } = await supabase
  .from('order_items')
  .select('product_id')
  .not('product_id', 'is', null)

if (refsError) {
  throw new Error(`Could not read order_items references: ${refsError.message}`)
}

const referencedIds = new Set((referencedItems ?? []).map((r) => r.product_id))

const { data: existingProducts, error: existingError } = await supabase
  .from('products')
  .select('id')

if (existingError) {
  throw new Error(`Could not read current products: ${existingError.message}`)
}

const deletableIds = (existingProducts ?? [])
  .map((p) => p.id)
  .filter((id) => !referencedIds.has(id))

const deleteChunkSize = 150
for (let i = 0; i < deletableIds.length; i += deleteChunkSize) {
  const chunk = deletableIds.slice(i, i + deleteChunkSize)
  const { error } = await supabase.from('products').delete().in('id', chunk)
  if (error) {
    throw new Error(`Failed deleting old products chunk ${i / deleteChunkSize + 1}: ${error.message}`)
  }
}

console.log(
  `Removed ${deletableIds.length} old products (kept ${referencedIds.size} product(s) referenced by orders).`
)

const batchSize = 200
let inserted = 0

for (let i = 0; i < rows.length; i += batchSize) {
  const chunk = rows.slice(i, i + batchSize)
  const { error } = await supabase.from('products').insert(chunk)
  if (error) {
    throw new Error(`Insert failed at batch ${i / batchSize + 1}: ${error.message}`)
  }
  inserted += chunk.length
  console.log(`Inserted ${inserted}/${rows.length}`)
}

const { count, error: countError } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })

if (countError) {
  throw new Error(`Could not verify row count: ${countError.message}`)
}

console.log(`DONE: Supabase products count is now ${count}`)
