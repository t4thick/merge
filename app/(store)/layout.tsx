import type { ReactNode } from 'react'
import { LocalBusinessJsonLd } from '@/components/seo/LocalBusinessJsonLd'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { MobileCartBar } from '@/components/store/MobileCartBar'
import { CartDrawer } from '@/components/store/CartDrawer'
import { AnnouncementBar } from '@/components/store/AnnouncementBar'
import { StoreMobileChrome } from '@/components/store/StoreMobileChrome'

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreMobileChrome>
      <LocalBusinessJsonLd />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileCartBar />
      <MobileBottomNav />
    </StoreMobileChrome>
  )
}
