import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Dynamic favicon — geometric K mark for Kintampo African Market. */
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
          background: '#0F5C4C',
          borderRadius: 6,
        }}
      >
        <svg viewBox="0 0 64 64" width="22" height="22">
          <path d="M14 10 H26 L38 28 L50 10 H58 L42 34 L58 54 H50 L38 40 L26 54 H14 L32 34 Z" fill="#F0D56A" />
          <path d="M14 10 H22 V54 H14 Z" fill="#C9A227" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
