'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Star,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/shipping', label: 'Shipping', icon: Truck },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
] as const

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href)
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-earth-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

          {/* Left: logo + desktop nav */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-tight text-earth-900">
              Kintampo <span className="text-brand-700">Admin</span>
            </span>

            {/* Desktop nav — hidden on mobile */}
            <nav className="hidden items-center gap-0.5 md:flex" aria-label="Admin">
              {NAV.map(({ href, label, icon: Icon, ...rest }) => {
                const exact = 'exact' in rest ? rest.exact : false
                const active = isActive(pathname, href, exact)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium no-underline transition-colors',
                      active
                        ? 'bg-earth-900 text-white'
                        : 'text-earth-600 hover:bg-earth-100 hover:text-earth-900'
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right: view store + logout (desktop) + hamburger (mobile) */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-earth-600 no-underline transition-colors hover:bg-earth-100 hover:text-earth-900 md:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Store
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-earth-600 transition-colors hover:bg-earth-100 hover:text-earth-900 md:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Logout
            </button>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-earth-700 transition-colors hover:bg-earth-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile active page indicator strip */}
        <div className="flex overflow-x-auto border-t border-earth-100 scrollbar-none md:hidden">
          {NAV.map(({ href, label, icon: Icon, ...rest }) => {
            const exact = 'exact' in rest ? rest.exact : false
            const active = isActive(pathname, href, exact)
            if (!active) return null
            return (
              <div key={href} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-earth-900">
                <Icon className="h-4 w-4 text-brand-700" aria-hidden />
                {label}
              </div>
            )
          })}
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white shadow-2xl md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            aria-label="Admin mobile menu"
          >
            {/* Drawer header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-earth-100 px-4">
              <span className="text-sm font-bold text-earth-900">
                Kintampo <span className="text-brand-700">Admin</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-earth-600 hover:bg-earth-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {NAV.map(({ href, label, icon: Icon, ...rest }) => {
                const exact = 'exact' in rest ? rest.exact : false
                const active = isActive(pathname, href, exact)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex h-12 items-center gap-3 rounded-lg px-4 text-[15px] font-medium no-underline transition-colors',
                      active
                        ? 'bg-earth-900 text-white'
                        : 'text-earth-700 hover:bg-earth-50 hover:text-earth-900'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Drawer footer */}
            <div className="border-t border-earth-100 p-3 space-y-1">
              <Link
                href="/"
                target="_blank"
                className="flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium text-earth-700 no-underline hover:bg-earth-50"
              >
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                View store
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                Logout
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
