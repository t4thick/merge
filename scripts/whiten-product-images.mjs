/**
 * Reprocess every product photo onto a clean white square canvas,
 * upload to Supabase Storage (`product-images`), and update `image_url`.
 *
 * Usage:
 *   node --env-file=.env.local scripts/whiten-product-images.mjs
 *   node --env-file=.env.local scripts/whiten-product-images.mjs --limit=10
 *   node --env-file=.env.local scripts/whiten-product-images.mjs --force
 */
import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SIZE = 1200
const PAD = Math.round(SIZE * 0.08) // ~8% white padding around the product
const BUCKET = 'product-images'
const CONCURRENCY = 3

const args = new Set(process.argv.slice(2))
const force = args.has('--force')
const limitArg = [...args].find((a) => a.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(url, key)

async function ensureBucket() {
  const { data } = await sb.storage.listBuckets()
  if (data?.some((b) => b.name === BUCKET)) return
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })
  if (error && !/already exists/i.test(error.message)) throw error
}

async function fetchBuffer(imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'KintampoImageWhiten/1.0' },
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Flatten onto pure white square with breathing room — catalog look. */
async function toWhiteSquare(input) {
  const inner = SIZE - PAD * 2
  return sharp(input)
    .rotate() // honor EXIF
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 },
      withoutEnlargement: false,
    })
    .extend({
      top: PAD,
      bottom: PAD,
      left: PAD,
      right: PAD,
      background: { r: 255, g: 255, b: 255 },
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer()
}

function alreadyOurs(imageUrl) {
  return typeof imageUrl === 'string' && imageUrl.includes(`/storage/v1/object/public/${BUCKET}/`)
}

async function processOne(product) {
  if (!product.image_url?.trim()) return { id: product.id, skipped: 'no image' }
  if (!force && alreadyOurs(product.image_url)) return { id: product.id, skipped: 'already whitened' }

  const raw = await fetchBuffer(product.image_url)
  const jpeg = await toWhiteSquare(raw)
  const path = `${product.id}.jpg`

  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, jpeg, {
    contentType: 'image/jpeg',
    upsert: true,
    cacheControl: '31536000',
  })
  if (upErr) throw upErr

  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = `${pub.publicUrl}?v=${Date.now()}`

  const { error: dbErr } = await sb
    .from('products')
    .update({ image_url: publicUrl })
    .eq('id', product.id)
  if (dbErr) throw dbErr

  return { id: product.id, ok: true, bytes: jpeg.length }
}

async function mapPool(items, concurrency, fn) {
  const results = []
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      try {
        results[idx] = await fn(items[idx])
      } catch (e) {
        results[idx] = { id: items[idx].id, error: e instanceof Error ? e.message : String(e) }
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}

await ensureBucket()

let query = sb
  .from('products')
  .select('id,name,image_url')
  .not('image_url', 'is', null)
  .order('created_at', { ascending: true })

const { data: products, error } = await query
if (error) {
  console.error(error.message)
  process.exit(1)
}

const list = (products ?? []).slice(0, Number.isFinite(limit) ? limit : undefined)
console.log(`Whitening ${list.length} product images → ${BUCKET}/ …`)

const results = await mapPool(list, CONCURRENCY, processOne)
let ok = 0
let skipped = 0
let failed = 0
for (const r of results) {
  if (r?.ok) {
    ok++
    process.stdout.write('.')
  } else if (r?.skipped) {
    skipped++
  } else {
    failed++
    console.log(`\nFAIL ${r?.id}: ${r?.error}`)
  }
}

console.log(`\nDone — ok=${ok} skipped=${skipped} failed=${failed}`)
console.log(`Public URLs live under ${url}/storage/v1/object/public/${BUCKET}/`)
