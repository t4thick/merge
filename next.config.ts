import type { NextConfig } from 'next'
import path from 'path'

// Pin the app root when a parent folder also has a lockfile (avoids wrong module resolution).
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  async headers() {
    // CSP: Next.js App Router requires 'unsafe-inline' for its own hydration scripts.
    // A full nonce-based CSP would need custom middleware; this is the practical baseline.
    const isDev = process.env.NODE_ENV === 'development'
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://lovelyqueenmart.com https://www.lovelyqueenmart.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://r.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://js.stripe.com",
      "worker-src 'self'",
      "manifest-src 'self'",
    ].join('; ')

    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
          },
          // HSTS: tell browsers to always use HTTPS (2-year max-age, preload-eligible).
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
  images: {
    // Vercel Image Optimization is quota-gated (402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED).
    // Serve originals so product photos always render on the live storefront.
    unoptimized: true,
    qualities: [60, 75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384, 640],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Product photos in the imported catalog still point at this host.
      {
        protocol: 'https',
        hostname: 'lovelyqueenmart.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lovelyqueenmart.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'qppnaxvwslwlsvsdwhvp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

// Phone on LAN: Next.js dev blocks some cross-origin asset loads unless the host is allowed.
// Add your PC's Wi‑Fi IPv4 to .env.local: DEV_PHONE_HOSTS=192.168.1.105
const phoneHosts =
  process.env.DEV_PHONE_HOSTS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? []

if (process.env.NODE_ENV === 'development') {
  nextConfig.allowedDevOrigins = ['127.0.0.1', ...phoneHosts]
}

export default nextConfig
