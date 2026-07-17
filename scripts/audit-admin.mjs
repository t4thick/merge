/**
 * Responsive authenticated admin smoke test.
 * Run: node --env-file=.env.local scripts/audit-admin.mjs
 * Optional: BASE_URL=http://127.0.0.1:3010
 */
import { chromium, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'tmp', 'admin-audit')
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3010').replace(/\/$/, '')
const password = process.env.ADMIN_PASSWORD?.trim()
if (!password) throw new Error('ADMIN_PASSWORD is required')

mkdirSync(OUT, { recursive: true })

const routes = [
  ['/admin', 'overview'],
  ['/admin/orders', 'orders'],
  ['/admin/products', 'products'],
  ['/admin/customers', 'customers'],
  ['/admin/shipping', 'shipping'],
  ['/admin/reviews', 'reviews'],
]

async function signIn(page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.locator('#staff-pass').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL(/\/admin(?:\?|$)/, { timeout: 60000 })
}

async function runViewport(browser, name, options) {
  const context = await browser.newContext(options)
  const page = await context.newPage()
  await signIn(page)
  const results = []

  for (const [path, file] of routes) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(600)
    const metrics = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.querySelector('h1')?.textContent?.trim() ?? null,
    }))
    results.push({ path, ...metrics, overflow: metrics.scrollWidth > metrics.viewport + 1 })
    await page.screenshot({
      path: resolve(OUT, `${file}-${name}.png`),
      fullPage: false,
    })
    console.log(
      `${name.padEnd(7)} ${path.padEnd(20)} ${metrics.viewport}px overflow=${metrics.scrollWidth > metrics.viewport + 1}`
    )
  }

  await context.close()
  return results
}

const browser = await chromium.launch()
const desktop = await runViewport(browser, 'desktop', { viewport: { width: 1440, height: 960 } })
const mobile = await runViewport(browser, 'mobile', { ...devices['iPhone 13'] })
await browser.close()

writeFileSync(resolve(OUT, 'report.json'), JSON.stringify({ desktop, mobile }, null, 2))
