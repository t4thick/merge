'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { NavbarAuth } from '@/components/NavbarAuth'
import { ShopSearchBar } from '@/components/store/ShopSearchBar'
import { Button } from '@/components/ui/button'
import { StoreLogo } from '@/components/ui/StoreLogo'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/track-order', label: 'Track order' },
  { href: '/account', label: 'Account' },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const { totalItems, openCart } = useCart()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [badgeKey, setBadgeKey] = useState(totalItems)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setBadgeKey(totalItems)
  }, [totalItems])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-colors duration-150',
          scrolled
            ? 'glass-nav border-earth-200'
            : 'border-earth-100 bg-white'
        )}
      >
        <div className="store-container">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
            <StoreLogo />

            <div className="hidden flex-1 px-4 md:block md:max-w-sm lg:max-w-xl">
              <ShopSearchBar compact />
            </div>

            <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
              {NAV_LINKS.map(({ href, label }) => {
                const active = isActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors duration-150',
                      active
                        ? 'bg-earth-100 text-earth-900'
                        : 'text-earth-600 hover:bg-earth-50 hover:text-earth-900'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}
              <NavbarAuth className="ml-1" />
              <Button
                type="button"
                size="sm"
                className="relative ml-2 h-10 gap-1.5 px-3.5 lg:h-11"
                onClick={openCart}
              >
                <ShoppingBag className="h-4 w-4" aria-hidden />
                Cart
                {totalItems > 0 && (
                  <span
                    key={badgeKey}
                    className="animate-pop flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-semibold leading-none text-white"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </nav>

            {/* Mobile only: cart + hamburger */}
            <div className="flex items-center gap-0.5 md:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative h-11 w-11"
                aria-label={`Cart, ${totalItems} items`}
                onClick={openCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    key={badgeKey}
                    className="animate-pop absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-0.5 text-[10px] font-semibold leading-none text-white"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile search — sits flush under the icon row, hidden on tablet+ */}
          <div className="pb-2.5 md:hidden">
            <ShopSearchBar compact />
          </div>
        </div>
      </header>

      {/* Mobile menu: backdrop + slide-in drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/25 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            id="mobile-nav"
            className="animate-slide-in-right fixed inset-y-0 right-0 z-[70] flex w-72 flex-col bg-white shadow-2xl md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            aria-label="Mobile"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-earth-100 px-4">
              <span className="text-sm font-semibold text-earth-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto p-3">
              {NAV_LINKS.map(({ href, label }) => {
                const active = isActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex h-12 items-center rounded-lg px-4 text-[15px] font-medium no-underline transition-colors duration-150',
                      active
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-earth-700 hover:bg-earth-50 hover:text-earth-900'
                    )}
                  >
                    {label}
                  </Link>
                )
              })}

              <div className="mt-2 border-t border-earth-100 pt-3 px-1">
                <NavbarAuth onNavigate={() => setOpen(false)} />
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
