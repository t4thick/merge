import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Favicon — red tile, white K with a dot (echoes the "Kintampo." wordmark). */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <svg viewBox="0 0 48 48" width="32" height="32">
          <rect x="0" y="0" width="48" height="48" rx="10" fill="#CE1126" />
          <path d="M11 8 H17.5 V40 H11 Z" fill="#FFFFFF" />
          <path d="M17.5 24 L28.5 8 H36.5 L25.5 24 L36.5 40 H28.5 Z" fill="#FFFFFF" />
          <circle cx="40" cy="37" r="3.2" fill="#FCD116" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
