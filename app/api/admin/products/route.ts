import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { assertSameOrigin } from '@/lib/security/same-origin'

const NAME_MAX = 200
const DESCRIPTION_MAX = 5000
const CATEGORY_MAX = 100
const IMAGE_URL_MAX = 2048
const PRICE_MAX = 1_000_000

export async function POST(req: NextRequest) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const description =
      typeof body.description === 'string' ? body.description.trim() : ''
    const category = typeof body.category === 'string' ? body.category.trim() : ''
    const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : ''
    const inStock = body.in_stock === undefined ? true : Boolean(body.in_stock)
    const priceNumber = typeof body.price === 'number' ? body.price : Number(body.price)

    if (!name || name.length > NAME_MAX) {
      return NextResponse.json({ error: 'Name is required (max 200 chars).' }, { status: 400 })
    }
    if (!category || category.length > CATEGORY_MAX) {
      return NextResponse.json({ error: 'Category is required (max 100 chars).' }, { status: 400 })
    }
    if (!Number.isFinite(priceNumber) || priceNumber <= 0 || priceNumber > PRICE_MAX) {
      return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 })
    }
    if (description.length > DESCRIPTION_MAX) {
      return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })
    }
    if (imageUrl.length > IMAGE_URL_MAX) {
      return NextResponse.json({ error: 'image_url is too long.' }, { status: 400 })
    }
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      return NextResponse.json({ error: 'image_url must start with http(s)://.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description: description || null,
        price: priceNumber,
        category,
        image_url: imageUrl || null,
        in_stock: inStock,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
