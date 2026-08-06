import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { assertSameOrigin } from '@/lib/security/same-origin'

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

// ---------------------------------------------------------------------------
// Magic-byte signatures — validate actual file content, not just browser MIME.
// A malicious client could send Content-Type: image/png with a script payload;
// we guard against this by inspecting the raw bytes.
// ---------------------------------------------------------------------------
function detectMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png'
  }
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  // GIF: 47 49 46 38 (GIF8)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return 'image/gif'
  }
  // WebP: RIFF????WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  return null
}

/** Resize / re-encode so storefront can serve originals without multi‑MB phone photos. */
async function prepareImageUpload(
  buffer: Buffer,
  detectedMime: string
): Promise<{ buffer: Buffer; mime: string; ext: string }> {
  try {
    // GIF: keep as-is (sharp would flatten animation).
    if (detectedMime === 'image/gif') {
      return { buffer, mime: detectedMime, ext: 'gif' }
    }

    const image = sharp(buffer, { failOn: 'none' }).rotate()
    const meta = await image.metadata()
    const maxEdge = 1600
    const needsResize =
      (meta.width != null && meta.width > maxEdge) ||
      (meta.height != null && meta.height > maxEdge)

    let pipeline = image
    if (needsResize) {
      pipeline = pipeline.resize({
        width: maxEdge,
        height: maxEdge,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    if (detectedMime === 'image/png' && meta.hasAlpha) {
      const out = await pipeline.png({ compressionLevel: 8 }).toBuffer()
      return { buffer: out, mime: 'image/png', ext: 'png' }
    }

    const out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    return { buffer: out, mime: 'image/jpeg', ext: 'jpg' }
  } catch {
    return {
      buffer,
      mime: detectedMime,
      ext: EXT_BY_MIME[detectedMime] ?? 'bin',
    }
  }
}

export async function POST(req: NextRequest) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    // Check the browser-reported MIME type first (fast path).
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: 'Only PNG, JPEG, WebP, or GIF images are allowed.' },
        { status: 415 }
      )
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit.' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const rawBuffer = Buffer.from(bytes)
    const headerBytes = new Uint8Array(rawBuffer.slice(0, 12))

    // Validate actual file content via magic bytes — prevents polyglot uploads.
    const detectedMime = detectMimeFromBytes(headerBytes)
    if (!detectedMime || !ALLOWED_MIME.has(detectedMime)) {
      return NextResponse.json(
        { error: 'File content does not match an allowed image type.' },
        { status: 415 }
      )
    }

    const prepared = await prepareImageUpload(rawBuffer, detectedMime)
    const baseName = (file.name || 'upload')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .slice(0, 80) || 'upload'
    const fileName = `${Date.now()}-${baseName}.${prepared.ext}`

    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, prepared.buffer, {
        contentType: prepared.mime,
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('product-images').getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
