/**
 * Client-side helpers for sharing label PDFs to apps like FlashLabel Pro.
 * FlashLabel expects a real .pdf file — not a PNG and not a URL.
 */

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException
    ? err.name === 'AbortError'
    : err instanceof Error && err.name === 'AbortError'
}

export function asPdfFile(blob: Blob, filename: string): File {
  const name = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
  // Always force PDF MIME — some CDNs return application/octet-stream.
  return new File([blob], name, { type: 'application/pdf' })
}

export async function pdfFileFromUrl(url: string, filename: string): Promise<File> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not load label PDF.')
  const blob = await res.blob()
  return asPdfFile(blob, filename)
}

export async function pdfFileFromBase64(base64: string, filename: string): Promise<File> {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return asPdfFile(new Blob([bytes], { type: 'application/pdf' }), filename)
}

/** Share only the file — no text/URL (FlashLabel Pro errors on "pdf link"). */
export async function sharePdfFile(file: File): Promise<'shared' | 'unsupported'> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported'
  }
  const payload = { files: [file] }
  if (typeof navigator.canShare === 'function' && !navigator.canShare(payload)) {
    return 'unsupported'
  }
  await navigator.share(payload)
  return 'shared'
}

export function downloadPdfFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function canSharePdfFiles(): boolean {
  try {
    const probe = new File([new Blob(['%PDF-1.4'], { type: 'application/pdf' })], 'probe.pdf', {
      type: 'application/pdf',
    })
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [probe] }))
    )
  } catch {
    return false
  }
}

/** Embed a JPEG into a one-page PDF sized ~4×6" (FlashLabel friendly). */
export function jpegBytesToPdf(jpeg: Uint8Array, imgW: number, imgH: number): Uint8Array {
  const pageW = 288 // 4 in
  const pageH = 432 // 6 in
  const enc = (s: string) => new TextEncoder().encode(s)

  const objects: Uint8Array[] = []
  const add = (body: string | Uint8Array) => {
    objects.push(typeof body === 'string' ? enc(body) : body)
  }

  add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  add('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  add(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  )

  const imgHeader = enc(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`
  )
  const imgFooter = enc('\nendstream\nendobj\n')
  const imgObj = new Uint8Array(imgHeader.length + jpeg.length + imgFooter.length)
  imgObj.set(imgHeader, 0)
  imgObj.set(jpeg, imgHeader.length)
  imgObj.set(imgFooter, imgHeader.length + jpeg.length)
  add(imgObj)

  const content = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`
  add(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`)

  const header = enc('%PDF-1.4\n')
  const parts: Uint8Array[] = [header]
  const offsets = [0]
  let offset = header.length
  for (const obj of objects) {
    offsets.push(offset)
    parts.push(obj)
    offset += obj.length
  }

  const xrefStart = offset
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`
  parts.push(enc(xref))

  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

export async function canvasToPdfFile(
  canvas: HTMLCanvasElement,
  filename: string
): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not export label image.'))),
      'image/jpeg',
      0.92
    )
  })
  const jpeg = new Uint8Array(await blob.arrayBuffer())
  const pdf = jpegBytesToPdf(jpeg, canvas.width, canvas.height)
  return asPdfFile(new Blob([pdf], { type: 'application/pdf' }), filename)
}
