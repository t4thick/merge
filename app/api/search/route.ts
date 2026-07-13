import { NextResponse } from 'next/server'
import { searchProductsLite } from '@/lib/supabase/products'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q') ?? ''
  const limitParam = url.searchParams.get('limit')
  const limit = Math.min(Math.max(parseInt(limitParam ?? '6', 10) || 6, 1), 10)

  const products = await searchProductsLite(q, limit)
  return NextResponse.json(
    {
      query: q,
      count: products.length,
      products,
    },
    {
      headers: {
        // Short edge cache so duplicate keystroke variations are cheap.
        'Cache-Control': 'private, max-age=15, s-maxage=15',
      },
    }
  )
}
