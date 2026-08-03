/**
 * Tax: most categories are grocery-exempt.
 * Taxable: Alcohol, Cosmetics, Non food, fashion & hair (see lib/tax/sales-tax.ts).
 */
export const PRODUCT_CATEGORIES = [
  'African Prints',
  'Alcohol',
  'Beverages',
  'Bread',
  'Canned',
  'Caribbean product',
  'Cosmetics',
  'Dairy And Tea',
  'Flours & Rice',
  'Fresh Produce',
  'Frozen foods',
  'Hair & Braiding',
  'Lace',
  'Meat and Seafood',
  'Motherland',
  'Non food',
  'Ready-to-wear',
  'Snack',
  'Spices',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

/** Fashion / fabric / hair departments — sold alongside groceries. */
export const FASHION_CATEGORIES = [
  'African Prints',
  'Lace',
  'Ready-to-wear',
  'Hair & Braiding',
] as const

export type FashionCategory = (typeof FASHION_CATEGORIES)[number]

/** Storefront department hubs (same cart, scoped browse). */
export const SHOP_DEPTS = ['fashion'] as const
export type ShopDept = (typeof SHOP_DEPTS)[number]

export function isFashionCategory(category: string): boolean {
  return (FASHION_CATEGORIES as readonly string[]).includes(category)
}

export function parseShopDept(value: string | null | undefined): ShopDept | null {
  if (value === 'fashion') return 'fashion'
  return null
}

export function categoriesForDept(dept: ShopDept | null): readonly string[] | null {
  if (dept === 'fashion') return FASHION_CATEGORIES
  return null
}

/** Short labels for category chips on home / shop. */
export const CATEGORY_ICONS: Record<string, string> = {
  Alcohol: '🍷',
  Beverages: '🥤',
  Bread: '🍞',
  Spices: '🌶️',
  'Flours & Rice': '🌾',
  'Fresh Produce': '🥬',
  'Frozen foods': '🧊',
  'Meat and Seafood': '🐟',
  Snack: '🍿',
  'Dairy And Tea': '🫖',
  'African Prints': '🧵',
  Lace: '👗',
  'Ready-to-wear': '🧥',
  'Hair & Braiding': '💇',
}
