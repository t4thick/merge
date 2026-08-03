import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { LocalBusinessJsonLd } from '@/components/seo/LocalBusinessJsonLd'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { MobileBottomNav } from '@/components/store/MobileBottomNav'
import { MobileCartBar } from '@/components/store/MobileCartBar'
import { CartDrawer } from '@/components/store/CartDrawer'
import { AnnouncementBar } from '@/components/store/AnnouncementBar'
import { StoreMobileChrome } from '@/components/store/StoreMobileChrome'
import { PwaRegister } from '@/components/store/PwaRegister'
import { PwaInstallBanner } from '@/components/store/PwaInstallBanner'
import { fetchAnnouncements } from '@/lib/supabase/announcements'

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const announcements = await fetchAnnouncements()

  return (
    <StoreMobileChrome>
      <LocalBusinessJsonLd />
      <PwaRegister />
      <AnnouncementBar messages={announcements} />
      <Suspense fallback={<div className="h-14 border-b border-earth-200 bg-earth-50/95 sm:h-16" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileCartBar />
      <MobileBottomNav />
      <PwaInstallBanner />
    </StoreMobileChrome>
  )
}
