import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { assertSameOrigin } from '@/lib/security/same-origin'

const NAME_MAX = 200
const DESCRIPTION_MAX = 5000
const CATEGORY_MAX = 100
const IMAGE_URL_MAX = 2048
const PRICE_MAX = 1_000_000

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    // Build a partial update from only the fields actually present.
    const update: Record<string, unknown> = {}

    if (Object.prototype.hasOwnProperty.call(body, 'name')) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name || name.length > NAME_MAX) {
        return NextResponse.json({ error: 'Name is required (max 200 chars).' }, { status: 400 })
      }
      update.name = name
    }

    if (Object.prototype.hasOwnProperty.call(body, 'description')) {
      const description = typeof body.description === 'string' ? body.description.trim() : ''
      if (description.length > DESCRIPTION_MAX) {
        return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })
      }
      update.description = description || null
    }

    if (Object.prototype.hasOwnProperty.call(body, 'price')) {
      const priceNumber = typeof body.price === 'number' ? body.price : Number(body.price)
      if (!Number.isFinite(priceNumber) || priceNumber <= 0 || priceNumber > PRICE_MAX) {
        return NextResponse.json({ error: 'Price must be a positive number.' }, { status: 400 })
      }
      update.price = priceNumber
    }

    if (Object.prototype.hasOwnProperty.call(body, 'category')) {
      const category = typeof body.category === 'string' ? body.category.trim() : ''
      if (!category || category.length > CATEGORY_MAX) {
        return NextResponse.json({ error: 'Category is required (max 100 chars).' }, { status: 400 })
      }
      update.category = category
    }

    if (Object.prototype.hasOwnProperty.call(body, 'image_url')) {
      const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : ''
      if (imageUrl.length > IMAGE_URL_MAX) {
        return NextResponse.json({ error: 'image_url is too long.' }, { status: 400 })
      }
      if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
        return NextResponse.json({ error: 'image_url must start with http(s)://.' }, { status: 400 })
      }
      update.image_url = imageUrl || null
    }

    if (Object.prototype.hasOwnProperty.call(body, 'in_stock')) {
      update.in_stock = Boolean(body.in_stock)
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = assertSameOrigin(req)
  if (!originCheck.ok) return originCheck.response

  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
