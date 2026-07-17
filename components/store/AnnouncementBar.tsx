'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { STORE } from '@/lib/constants/store'
import { FREE_STANDARD_SHIPPING_SUBTOTAL } from '@/lib/shipping'

const DISMISS_KEY = 'kam_bar_v3'

const MESSAGES = [
  {
    text: `Nationwide shipping · Free standard on $${FREE_STANDARD_SHIPPING_SUBTOTAL}+ · Pickup in Columbus`,
    href: undefined as string | undefined,
  },
  {
    text: 'Fashion & hair — coming soon · Braiding by phone (614) 377-8297',
    href: '/#fashion',
  },
  {
    text: 'Mobile market & Ohio delivery — call (614) 377-8297',
    href: '/#mobile-market',
  },
  {
    text: `Store pickup · ${STORE.address}`,
    href: undefined,
  },
] as const

export function AnnouncementBar() {
  const [hidden, setHidden] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') setHidden(true)
    } catch {
      /* ignore */
    }
  }, [])

  function dismiss() {
    setHidden(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (hidden) return null

  const msg = MESSAGES[index]

  return (
    <div className="relative border-b border-earth-200 bg-white py-2.5 text-center text-xs font-medium text-earth-600">
      {msg.href ? (
        <Link href={msg.href} className="px-10 text-earth-700 no-underline hover:text-earth-900">
          {msg.text}
        </Link>
      ) : (
        <p className="px-10">{msg.text}</p>
      )}

      <div className="mt-1.5 flex items-center justify-center gap-1.5 pb-0.5">
        {MESSAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Announcement ${i + 1} of ${MESSAGES.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors duration-150 ${
              i === index ? 'bg-earth-800' : 'bg-earth-300 hover:bg-earth-500'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-earth-500 transition-colors duration-150 hover:bg-earth-100 hover:text-earth-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-300"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
