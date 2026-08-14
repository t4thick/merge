/**
 * Downscale photos in the browser before POSTing to /api/admin/upload.
 * Serverless request bodies are capped at ~4.5 MB, so a raw phone photo
 * (12 MP JPEG or HEIC) fails at the platform edge before our route runs.
 * Canvas re-encode also converts iPhone HEIC into JPEG on iOS Safari.
 */

const MAX_EDGE = 1600
const SHRINK_ABOVE_BYTES = 2 * 1024 * 1024

/** Hard ceiling for the POST body — below the serverless limit. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

const SERVER_READY = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

export async function shrinkImageForUpload(file: File): Promise<File> {
  const looksHeic = /\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type)
  if (!file.type.startsWith('image/') && !looksHeic) return file
  // Animated GIFs would collapse to a single frame.
  if (file.type === 'image/gif') return file

  const oversized = file.size > SHRINK_ABOVE_BYTES
  if (!oversized && !looksHeic && SERVER_READY.has(file.type)) return file

  if (typeof window === 'undefined' || typeof createImageBitmap !== 'function') return file

  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85)
    )
    if (!blob) return file
    if (blob.size >= file.size && SERVER_READY.has(file.type)) return file

    const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}.jpg`
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  } finally {
    bitmap?.close()
  }
}
