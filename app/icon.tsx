import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Favicon — black square with white K. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          borderRadius: 6,
        }}
      >
        <svg viewBox="0 0 48 48" width="22" height="22">
          <path
            d="M14 10h6.8v12.2L31.6 10H39L26.8 24 39 38h-7.4L20.8 25.8V38H14Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
