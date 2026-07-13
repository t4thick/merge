import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClientOptional } from '@/lib/supabase/server'
import { TrackOrderClient } from './TrackOrderClient'

export const dynamic = 'force-dynamic'

export default async function TrackOrderPage() {
  const supabase = await createClientOptional()
  if (!supabase) {
    redirect('/login?next=/track-order&error=configuration')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/track-order')
  }

  return (
    <Suspense fallback={<p>Loading…</p>}>
      <TrackOrderClient />
    </Suspense>
  )
}
