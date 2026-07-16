/**
 * Remove photo backgrounds, composite onto a clean white square,
 * upload to Supabase Storage (`product-images`), and update `image_url`.
 *
 * Usage:
 *   node --env-file=.env.local scripts/whiten-product-images.mjs
 *   node --env-file=.env.local scripts/whiten-product-images.mjs --limit=10
 *   node --env-file=.env.local scripts/whiten-product-images.mjs --force
 */
import { createClient } from '@supabase/supabase-js'
import { removeBackground } from '@imgly/background-removal-node'
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const EXPORT_FILE = resolve(ROOT, 'data', 'products-export.json')

const SIZE = 1200
const PAD = Math.round(SIZE * 0.1)
const BUCKET = 'product-images'
const CONCURRENCY = 1 // onnxruntime can't share sessions across concurrent jobs on Windows

/** Prefer original export URLs so re-runs don't cut already-composited images. */
function loadOriginalUrls() {
  try {
    const rows = JSON.parse(readFileSync(EXPORT_FILE, 'utf8'))
    const map = new Map()
    for (const p of rows) {
      if (p?.id && p?.image_url) map.set(p.id, p.image_url)
    }
    return map
  } catch {
    return new Map()
  }
}

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
  const clean = imageUrl.split('?')[0]
  const res = await fetch(clean, {
    headers: { 'User-Agent': 'KintampoImageWhiten/1.0' },
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Cut subject out, drop on pure white square with padding. */
async function toWhiteSquare(input) {
  // Feed a typed Blob straight to img.ly (its own sharp decodes). Avoids
  // SharedArrayBuffer issues when our sharp + theirs both touch the buffer.
  const jpegCopy = Buffer.from(input)
  const cutout = await removeBackground(new Blob([jpegCopy], { type: 'image/jpeg' }), {
    model: 'medium',
    output: { format: 'image/png', quality: 0.9 },
  })
  const cutoutBuf = Buffer.from(await cutout.arrayBuffer())

  const inner = SIZE - PAD * 2
  return sharp(cutoutBuf)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      withoutEnlargement: false,
    })
    .extend({
      top: PAD,
      bottom: PAD,
      left: PAD,
      right: PAD,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer()
}

function alreadyOurs(imageUrl) {
  return typeof imageUrl === 'string' && imageUrl.includes(`/storage/v1/object/public/${BUCKET}/`)
}

async function processOne(product, originals) {
  if (!product.image_url?.trim()) return { id: product.id, skipped: 'no image' }
  if (!force && alreadyOurs(product.image_url)) return { id: product.id, skipped: 'already whitened' }

  const sourceUrl = originals.get(product.id) || product.image_url
  const raw = await fetchBuffer(sourceUrl)
  const jpeg = await toWhiteSquare(raw)
  // storage-js rejects SharedArrayBuffer-backed Buffers from sharp — copy first.
  const uploadBody = Buffer.from(jpeg)
  const path = `${product.id}.jpg`

  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, uploadBody, {
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

  return { id: product.id, ok: true, bytes: uploadBody.length }
}

async function mapPool(items, concurrency, fn) {
  const results = []
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      const name = items[idx].name?.slice(0, 40) ?? items[idx].id
      process.stdout.write(`\n[${idx + 1}/${items.length}] ${name} … `)
      try {
        results[idx] = await fn(items[idx])
        process.stdout.write(results[idx].ok ? 'ok' : results[idx].skipped || 'done')
      } catch (e) {
        results[idx] = { id: items[idx].id, error: e instanceof Error ? e.message : String(e) }
        process.stdout.write('FAIL ' + results[idx].error)
        if (e instanceof Error && e.stack) console.error('\n' + e.stack.split('\n').slice(0, 6).join('\n'))
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}

await ensureBucket()

const { data: products, error } = await sb
  .from('products')
  .select('id,name,image_url')
  .not('image_url', 'is', null)
  .order('created_at', { ascending: true })

if (error) {
  console.error(error.message)
  process.exit(1)
}

const list = (products ?? []).slice(0, Number.isFinite(limit) ? limit : undefined)
const originals = loadOriginalUrls()
console.log(
  `Removing backgrounds + whitening ${list.length} images → ${BUCKET}/ (originals mapped: ${originals.size})`
)

const results = await mapPool(list, CONCURRENCY, (p) => processOne(p, originals))
let ok = 0
let skipped = 0
let failed = 0
for (const r of results) {
  if (r?.ok) ok++
  else if (r?.skipped) skipped++
  else failed++
}

console.log(`\n\nDone — ok=${ok} skipped=${skipped} failed=${failed}`)
