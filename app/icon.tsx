import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Favicon — Kintampo market tile: red square, gold awning, white K. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <svg viewBox="0 0 48 48" width="32" height="32">
          <rect x="0" y="0" width="48" height="48" rx="10" fill="#CE1126" />
          <path
            d="M0 10 Q0 0 10 0 H38 Q48 0 48 10 V11 H40 A4 4 0 0 1 32 11 A4 4 0 0 1 24 11 A4 4 0 0 1 16 11 A4 4 0 0 1 8 11 H0 Z"
            fill="#FCD116"
          />
          <path d="M14 18 H20.5 V44 H14 Z" fill="#FFFFFF" />
          <path d="M20.5 31 L31.5 18 H39.5 L28.5 31 L39.5 44 H31.5 Z" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
