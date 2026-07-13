/**
 * Tax: most categories are grocery-exempt; taxable = Cosmetics, Non food (see lib/tax/sales-tax.ts).
 */
export const PRODUCT_CATEGORIES = [
  'Beverages',
  'Bread',
  'Canned',
  'Caribbean product',
  'Cosmetics',
  'Dairy And Tea',
  'Flours & Rice',
  'Fresh Produce',
  'Frozen foods',
  'Meat and Seafood',
  'Motherland',
  'Non food',
  'Snack',
  'Spices',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

/** Short labels for category chips on home / shop. */
export const CATEGORY_ICONS: Record<string, string> = {
  Beverages: '🥤',
  Bread: '🍞',
  Spices: '🌶️',
  'Flours & Rice': '🌾',
  'Fresh Produce': '🥬',
  'Frozen foods': '🧊',
  'Meat and Seafood': '🐟',
  Snack: '🍿',
  'Dairy And Tea': '🫖',
}
