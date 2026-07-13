import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/** Dynamic favicon — static app/icon.png breaks Vercel's Next 16 modifyConfig step. */
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
          background: '#CC1F26',
          borderRadius: 6,
        }}
      >
        <svg viewBox="0 0 88 64" width="26" height="19">
          <defs>
            <linearGradient id="g" x1="44" y1="2" x2="44" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F9E07A" />
              <stop offset="50%" stopColor="#E8C547" />
              <stop offset="100%" stopColor="#9A7510" />
            </linearGradient>
          </defs>
          <path
            d="M8 58 L8 50 C8 48 12 46 16 44 C14 38 15 32 18 26 C21 20 26 16 32 14 C30 22 31 28 34 34 C36 28 38 22 44 12 C50 22 52 28 54 34 C57 28 58 22 56 14 C62 16 67 20 70 26 C73 32 74 38 72 44 C76 46 80 48 80 50 L80 58 Z"
            fill="url(#g)"
          />
          <path
            d="M4 58 C4 48 6 42 10 36 C8 32 7 26 9 20 C11 14 16 10 22 8 C18 16 16 24 18 32 C20 40 24 48 30 52 C22 54 14 56 4 58Z"
            fill="url(#g)"
          />
          <path
            d="M84 58 C84 48 82 42 78 36 C80 32 81 26 79 20 C77 14 72 10 66 8 C70 16 72 24 70 32 C68 40 64 48 58 52 C66 54 74 56 84 58Z"
            fill="url(#g)"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
