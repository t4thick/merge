'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { STORE } from '@/lib/constants/store'
import { FREE_STANDARD_SHIPPING_SUBTOTAL } from '@/lib/shipping'

const DISMISS_KEY = 'kam_bar_v1'

const MESSAGES = [
  'Columbus? Free store pickup — send Uber with your order #',
  `Free standard US shipping on orders $${FREE_STANDARD_SHIPPING_SUBTOTAL}+`,
  `Same-day store pickup · ${STORE.address}`,
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

  useEffect(() => {
    if (hidden) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length)
    }, 6000)
    return () => window.clearInterval(id)
  }, [hidden])

  function dismiss() {
    setHidden(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (hidden) return null

  return (
    <div className="relative bg-brand-700 py-2.5 text-center text-[13px] font-medium text-white">
      <p key={index} className="animate-fade-in px-10">
        {MESSAGES[index]}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md opacity-70 transition-opacity duration-150 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
