/**
 * Export local env files to a single PDF (CONFIDENTIAL — do not commit or share).
 *
 *   npm install pdfkit
 *   node scripts/env-files-to-pdf.mjs
 *
 * Output: Lovely-Queen-env-reference.pdf (project root, gitignored)
 */

import { readFileSync, existsSync, createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import PDFDocument from 'pdfkit'

const root = process.cwd()
const outPdf = resolve(root, 'Lovely-Queen-env-reference.pdf')

const FILES = [
  { label: '.env.local (local development)', path: '.env.local' },
  { label: '.env.vercel.production (Vercel pull)', path: '.env.vercel.production' },
  { label: '.env.example (template / documentation)', path: '.env.example' },
]

const generated = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })

const doc = new PDFDocument({ margin: 50, size: 'LETTER' })
const stream = createWriteStream(outPdf)
doc.pipe(stream)

doc.fontSize(16).fillColor('#006b3e').text('Kintampo African Market — Environment Variables', { underline: false })
doc.moveDown(0.3)
doc.fontSize(9).fillColor('#525250').font('Helvetica')
doc.text(`Generated ${generated} (America/New_York)`)
doc.text('Project: chuck-and-rich')
doc.moveDown(0.5)
doc.fillColor('#991b1b').font('Helvetica-Bold')
doc.text('CONFIDENTIAL — Contains API keys and passwords. Do not email or commit.', { width: 500 })
doc.moveDown(1)

for (const { label, path } of FILES) {
  const full = resolve(root, path)
  doc.fillColor('#18181b').font('Helvetica-Bold').fontSize(11).text(label)
  doc.moveDown(0.3)
  const content = existsSync(full) ? readFileSync(full, 'utf8') : `(file not found: ${path})`
  doc.font('Courier').fontSize(7.5).fillColor('#27272a').text(content, { width: 512, lineGap: 1 })
  doc.moveDown(1.2)
}

doc.end()

await new Promise((resolvePromise, reject) => {
  stream.on('finish', resolvePromise)
  stream.on('error', reject)
})

console.log(`PDF saved: ${outPdf}`)
