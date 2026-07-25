import { createClientOptional } from '@/lib/supabase/server'
import { getSupabasePublicConfig, formatCatalogError, SupabaseConfigError } from '@/lib/supabase/config'
import { fetchCuratedHomepageShowcase } from '@/lib/supabase/homepage-curation'
import { filterStorefrontProducts, isHiddenFromStorefront } from '@/lib/catalog/public-product-filter'
import type { Product } from '@/types'

export type ProductsQueryResult = {
  products: Product[]
  errorMessage: string | null
  configured: boolean
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest'

const SORT_CONFIG: Record<SortOption, { column: string; ascending: boolean }> = {
  featured: { column: 'created_at', ascending: false },
  newest: { column: 'created_at', ascending: false },
  'price-asc': { column: 'price', ascending: true },
  'price-desc': { column: 'price', ascending: false },
  'name-asc': { column: 'name', ascending: true },
}

export async function fetchProductsForShop(options?: {
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  sort?: SortOption
}): Promise<ProductsQueryResult> {
  const { configured } = getSupabasePublicConfig()
  if (!configured) {
    return {
      products: [],
      errorMessage: formatCatalogError(null, false),
      configured: false,
    }
  }

  try {
    const supabase = await createClientOptional()
    if (!supabase) {
      return {
        products: [],
        errorMessage: formatCatalogError(null, false),
        configured: false,
      }
    }
    let query = supabase.from('products').select('id,name,price,image_url,category,in_stock,description,created_at')
    if (options?.q) {
      const q = options.q.trim()
      if (q) {
        const terms = expandSearchTerms(q).filter((t) => t.trim().length > 0).slice(0, 6)
        const orFilter = terms
          .flatMap((t) => [
            `name.ilike.%${t}%`,
            `category.ilike.%${t}%`,
            `description.ilike.%${t}%`,
          ])
          .join(',')
        query = query.or(orFilter)
      }
    }
    if (options?.category) query = query.eq('category', options.category)
    if (options?.minPrice != null && !Number.isNaN(options.minPrice)) {
      query = query.gte('price', options.minPrice)
    }
    if (options?.maxPrice != null && !Number.isNaN(options.maxPrice)) {
      query = query.lte('price', options.maxPrice)
    }
    if (options?.inStockOnly) {
      query = query.eq('in_stock', true)
    }

    const sort = SORT_CONFIG[options?.sort ?? 'featured']
    const { data, error } = await query.order(sort.column, { ascending: sort.ascending })
    if (error) {
      return {
        products: [],
        errorMessage: formatCatalogError(error, true),
        configured: true,
      }
    }

    return {
      products: filterStorefrontProducts((data ?? []) as Product[]),
      errorMessage: null,
      configured: true,
    }
  } catch (e) {
    const err = e instanceof SupabaseConfigError ? null : e
    const message =
      e instanceof SupabaseConfigError
        ? formatCatalogError(null, false)
        : formatCatalogError(err instanceof Error ? err : { message: String(e) }, configured)
    return {
      products: [],
      errorMessage: message,
      configured,
    }
  }
}

export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const { configured } = getSupabasePublicConfig()
  if (!configured) return {}

  try {
    const supabase = await createClientOptional()
    if (!supabase) return {}
    const { data } = await supabase.from('products').select('category,name').eq('in_stock', true)
    return ((data ?? []) as { category: string | null; name: string | null }[])
      .filter((row) => !isHiddenFromStorefront(row))
      .reduce<Record<string, number>>((acc, row) => {
        const name = row.category?.trim()
        if (!name) return acc
        acc[name] = (acc[name] ?? 0) + 1
        return acc
      }, {})
  } catch {
    return {}
  }
}

// Synonym map for African & Caribbean grocery search
// If someone types the left term, we also search the right terms
const SEARCH_SYNONYMS: Record<string, string[]> = {
  'fufu': ['fufuf', 'cassava', 'cocoyam'],
  'garri': ['gari', 'cassava'],
  'gari': ['garri', 'cassava'],
  'palm oil': ['zomi', 'red palm'],
  'zomi': ['palm oil', 'red palm'],
  'stockfish': ['stock fish', 'dried fish', 'okporoko'],
  'stock fish': ['stockfish', 'dried fish'],
  'egusi': ['melon seed', 'agushi'],
  'crayfish': ['dried shrimp', 'ground crayfish'],
  'plantain': ['dodo', 'boli'],
  'ogbono': ['draw soup', 'apon'],
  'groundnut': ['peanut', 'groundnut oil'],
  'peanut': ['groundnut'],
  'malt': ['malta', 'maltina', 'supermalt'],
  'malta': ['malt', 'maltina'],
  'suya': ['suya spice', 'yaji'],
  'jollof': ['jollof rice', 'benachin'],
  'pepper soup': ['peppersoup', 'pepper soup spice'],
  'eba': ['cassava', 'garri'],
  'amala': ['yam flour', 'poundo'],
  'pounded yam': ['poundo', 'pound yam', 'iyan'],
  'poundo': ['pounded yam', 'pound yam'],
  'ofe': ['soup', 'stew'],
  'bitters': ['alomo', 'orijin', 'adonko'],
  'semovita': ['semo', 'semolina'],
  'konkonte': ['cassava flour', 'abolo'],
  'banku': ['banku mix', 'corn dough'],
  'shea butter': ['nkuto', 'ori', 'shea'],
  'black soap': ['alata soap', 'dudu osun'],
}

function expandSearchTerms(term: string): string[] {
  const lower = term.toLowerCase()
  const terms = new Set([lower])
  // Check if any synonym key is in the search term
  for (const [key, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
    if (lower.includes(key)) {
      synonyms.forEach((s) => terms.add(s))
    }
    // Also check if search term matches a synonym value
    if (synonyms.some((s) => lower.includes(s))) {
      terms.add(key)
    }
  }
  return [...terms]
}

export async function searchProductsLite(q: string, limit = 6): Promise<Product[]> {
  const term = q.trim()
  if (!term) return []
  const { configured } = getSupabasePublicConfig()
  if (!configured) return []
  try {
    const supabase = await createClientOptional()
    if (!supabase) return []

    // Expand search with synonyms
    const terms = expandSearchTerms(term)

    // Build OR filter across name, category, and description (synonym-expanded).
    const cleanTerms = terms.filter((t) => t.trim().length > 0).slice(0, 6)
    const orFilter = cleanTerms
      .flatMap((t) => [
        `name.ilike.%${t}%`,
        `category.ilike.%${t}%`,
        `description.ilike.%${t}%`,
      ])
      .join(',')

    const { data } = await supabase
      .from('products')
      .select('id,name,price,image_url,category,in_stock,description')
      .or(orFilter)
      .order('in_stock', { ascending: false })
      .limit(limit)

    // Sort: exact name matches first, then category hits, then in-stock
    const needle = term.toLowerCase()
    const sorted = ((data ?? []) as Product[]).sort((a, b) => {
      const score = (p: Product) => {
        const name = p.name.toLowerCase()
        const cat = (p.category ?? '').toLowerCase()
        if (name === needle) return 3
        if (name.includes(needle)) return 2
        if (cat.includes(needle)) return 1
        return 0
      }
      const diff = score(b) - score(a)
      if (diff !== 0) return diff
      if (b.in_stock !== a.in_stock) return b.in_stock ? 1 : -1
      return 0
    })

    return filterStorefrontProducts(sorted).slice(0, limit)
  } catch {
    return []
  }
}

export async function fetchFrequentlyBoughtTogether(
  category: string,
  excludeId: string,
  limit = 3
): Promise<Product[]> {
  const { configured } = getSupabasePublicConfig()
  if (!configured) return []
  try {
    const supabase = await createClientOptional()
    if (!supabase) return []

    // Try real purchase data first — find orders that contained this product
    // then surface other products from those same orders
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('product_id', excludeId)
      .limit(50)

    if (orderItems && orderItems.length > 0) {
      const orderIds = orderItems.map((o) => o.order_id)

      // Find other products bought in those same orders
      const { data: coItems } = await supabase
        .from('order_items')
        .select('product_id')
        .in('order_id', orderIds)
        .neq('product_id', excludeId)
        .limit(200)

      if (coItems && coItems.length > 0) {
        // Count how many times each product appears
        const freq: Record<string, number> = {}
        for (const item of coItems) {
          if (item.product_id) {
            freq[item.product_id] = (freq[item.product_id] ?? 0) + 1
          }
        }

        // Get top product IDs by frequency
        const topIds = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit * 2)
          .map(([id]) => id)

        if (topIds.length > 0) {
          const { data: products } = await supabase
            .from('products')
            .select('id,name,price,image_url,category,in_stock,description,created_at')
            .in('id', topIds)
            .eq('in_stock', true)
            .limit(limit)

          if (products && products.length > 0) {
            return filterStorefrontProducts(products as Product[]).slice(0, limit)
          }
        }
      }
    }

    // Fallback: same category (original behaviour)
    const { data } = await supabase
      .from('products')
      .select('id,name,price,image_url,category,in_stock,description,created_at')
      .eq('category', category)
      .eq('in_stock', true)
      .neq('id', excludeId)
      .order('created_at', { ascending: false })
      .limit(limit * 2)
    return filterStorefrontProducts((data ?? []) as Product[]).slice(0, limit)
  } catch {
    return []
  }
}

export async function fetchHomepageProducts(): Promise<{
  staples: Product[]
  trending: Product[]
  newArrivals: Product[]
  categoryCount: Record<string, number>
  inStockCount: number
  configured: boolean
  errorMessage: string | null
}> {
  const empty = {
    staples: [] as Product[],
    trending: [] as Product[],
    newArrivals: [] as Product[],
    categoryCount: {} as Record<string, number>,
    inStockCount: 0,
  }

  const { configured } = getSupabasePublicConfig()
  if (!configured) {
    return {
      ...empty,
      configured: false,
      errorMessage: formatCatalogError(null, false),
    }
  }

  try {
    const supabase = await createClientOptional()
    if (!supabase) {
      return {
        ...empty,
        configured: false,
        errorMessage: formatCatalogError(null, false),
      }
    }
    const [showcase, catRes] = await Promise.all([
      fetchCuratedHomepageShowcase(supabase),
      supabase.from('products').select('category,name').eq('in_stock', true),
    ])

    if (catRes.error) {
      return {
        ...empty,
        configured: true,
        errorMessage: formatCatalogError(catRes.error, true),
      }
    }

    const categoryCount = ((catRes.data ?? []) as { category: string | null; name: string | null }[])
      .filter((row) => !isHiddenFromStorefront(row))
      .reduce<Record<string, number>>((acc, row) => {
      const name = row.category?.trim()
      if (!name) return acc
      acc[name] = (acc[name] ?? 0) + 1
      return acc
    }, {})

    const inStockCount = Object.values(categoryCount).reduce((sum, n) => sum + n, 0)

    return {
      staples: showcase.staples,
      trending: showcase.trending,
      newArrivals: showcase.newArrivals,
      categoryCount,
      inStockCount,
      configured: true,
      errorMessage: null,
    }
  } catch (e) {
    return {
      ...empty,
      configured: configured,
      errorMessage: formatCatalogError(e instanceof Error ? e : { message: String(e) }, configured),
    }
  }
}
