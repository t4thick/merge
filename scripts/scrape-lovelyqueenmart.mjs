/**
 * Scrape all products + categories from lovelyqueenmart.com (WooCommerce Store API).
 * Output: ../lovelyqueen-scrape/
 */
import fs from 'node:fs'
import path from 'node:path'

const BASE = 'https://lovelyqueenmart.com/wp-json/wc/store'
const OUT_DIR = path.resolve(process.cwd(), '..', 'lovelyqueen-scrape')

function decodeHtml(s) {
  if (!s) return ''
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function stripHtml(input) {
  if (!input) return ''
  return decodeHtml(String(input).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
}

function toMoney(prices) {
  if (!prices) return 0
  const raw = prices.price ?? prices.regular_price ?? '0'
  if (typeof raw === 'string' && /^\d+$/.test(raw)) {
    return Number((Number.parseInt(raw, 10) / 100).toFixed(2))
  }
  const n = Number(raw)
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0
}

async function fetchAll(endpoint, perPage = 100) {
  const items = []
  let page = 1
  while (true) {
    const url = `${BASE}/${endpoint}?per_page=${perPage}&page=${page}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      throw new Error(`Failed ${endpoint} page ${page}: ${res.status}`)
    }
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break
    items.push(...data)
    console.log(`${endpoint}: page ${page} -> ${data.length} (total ${items.length})`)
    page += 1
  }
  return items
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows, columns) {
  const header = columns.join(',')
  const body = rows.map((row) => columns.map((c) => csvEscape(row[c])).join(','))
  return [header, ...body].join('\n')
}

fs.mkdirSync(OUT_DIR, { recursive: true })

console.log('Fetching categories…')
const categories = await fetchAll('products/categories')
console.log('Fetching products…')
const products = await fetchAll('products')

const scrapedAt = new Date().toISOString()

fs.writeFileSync(
  path.join(OUT_DIR, 'categories.json'),
  JSON.stringify({ source: 'https://lovelyqueenmart.com/', scraped_at: scrapedAt, categories }, null, 2)
)
fs.writeFileSync(
  path.join(OUT_DIR, 'products.json'),
  JSON.stringify({ source: 'https://lovelyqueenmart.com/', scraped_at: scrapedAt, products }, null, 2)
)

const categoryRows = categories.map((c) => ({
  id: c.id,
  name: decodeHtml(c.name),
  slug: c.slug,
  count: c.count,
  parent: c.parent,
  image_url: c.image?.src ?? '',
}))

const productRows = products.map((p) => {
  const cats = (p.categories ?? []).map((c) => decodeHtml(c.name))
  const images = (p.images ?? []).map((i) => i.src).filter(Boolean)
  return {
    id: p.id,
    name: stripHtml(p.name),
    slug: p.slug,
    type: p.type,
    permalink: p.permalink,
    sku: p.sku ?? '',
    source_categories: cats.join(' | '),
    price: toMoney(p.prices),
    regular_price: toMoney({ price: p.prices?.regular_price }),
    sale_price: p.prices?.sale_price ? toMoney({ price: p.prices.sale_price }) : '',
    on_sale: Boolean(p.on_sale),
    in_stock: Boolean(p.is_in_stock),
    short_description: stripHtml(p.short_description),
    description: stripHtml(p.description),
    image_url: images[0] ?? '',
    all_image_urls: images.join(' | '),
  }
})

fs.writeFileSync(
  path.join(OUT_DIR, 'categories.csv'),
  toCsv(categoryRows, ['id', 'name', 'slug', 'count', 'parent', 'image_url'])
)
fs.writeFileSync(
  path.join(OUT_DIR, 'products.csv'),
  toCsv(productRows, [
    'id',
    'name',
    'slug',
    'type',
    'permalink',
    'sku',
    'source_categories',
    'price',
    'regular_price',
    'sale_price',
    'on_sale',
    'in_stock',
    'short_description',
    'description',
    'image_url',
    'all_image_urls',
  ])
)

console.log(`\nDONE`)
console.log(`Categories: ${categories.length}`)
console.log(`Products: ${products.length}`)
console.log(`Output: ${OUT_DIR}`)
