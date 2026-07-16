import type { ReactNode } from 'react'
import { Geist } from 'next/font/google'
import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/context/CartContext'
import { ToastProvider } from '@/context/ToastContext'
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext'
import { STORE } from '@/lib/constants/store'
import { getPublicSiteUrl } from '@/lib/site-url'

const siteUrl = getPublicSiteUrl()
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: STORE.shortName,
    template: `%s · ${STORE.shortName}`,
  },
  description: STORE.tagline,
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  openGraph: {
    type: 'website',
    siteName: STORE.name,
    title: STORE.name,
    description: STORE.tagline,
    images: [{ url: '/brand/logo-reference.png', width: 1200, height: 630, alt: STORE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: STORE.name,
    description: STORE.tagline,
    images: ['/brand/logo-reference.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#fafafa' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <RecentlyViewedProvider>
            <ToastProvider>{children}</ToastProvider>
          </RecentlyViewedProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
