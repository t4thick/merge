import { existsSync, statSync } from 'fs'
import path from 'path'

// Remote fallbacks: 960px source for sharp tiles on retina.
const U = (cdnId: string) =>
  `https://images.unsplash.com/${cdnId}?w=960&h=960&fit=crop&q=90&auto=format`

const LOCAL = (filename: string) => `/images/categories/${filename}`

const CATEGORIES_DIR = path.join(process.cwd(), 'public', 'images', 'categories')

function localCategoryImage(filenames: readonly string[], minBytes = 10_000): string | null {
  for (const file of filenames) {
    const localPath = path.join(CATEGORIES_DIR, file)
    try {
      if (existsSync(localPath) && statSync(localPath).size >= minBytes) {
        return LOCAL(file)
      }
    } catch {
      /* try next */
    }
  }
  return null
}

function categoryLocalFiles(slug: string): readonly string[] {
  return [`${slug}.jpg`, `${slug}.webp`, `${slug}.png`] as const
}

const CATEGORY_SLUG: Record<string, string> = {
  Beverages: 'beverages',
  Bread: 'bread',
  Canned: 'canned',
  'Caribbean product': 'caribbean-product',
  Cosmetics: 'cosmetics',
  'Dairy And Tea': 'dairy-and-tea',
  'Flours & Rice': 'flours-rice',
  'Fresh Produce': 'fresh-produce',
  'Frozen foods': 'frozen-foods',
  'Meat and Seafood': 'meat-seafood',
  Motherland: 'motherland',
  'Non food': 'non-food',
  Snack: 'snack',
  Spices: 'spices',
}

/** Remote fallbacks when local files are missing */
const CATEGORY_REMOTE: Record<string, string> = {
  Beverages: U('photo-1755752919046-a6543db419cc'),
  Bread: U('photo-1725297952102-ab28892a31ab'),
  Canned: U('photo-1601598704991-eef6114775e0'),
  'Caribbean product': U('photo-1617631716600-6a454b430367'),
  Cosmetics: U('photo-1556228720-195a672e8a03'),
  'Dairy And Tea': U('photo-1552593050-477020c5af3f'),
  'Flours & Rice': U('photo-1686820740687-426a7b9b2043'),
  'Fresh Produce': U('photo-1607349913338-fca6f7fc42d0'),
  'Frozen foods': U('photo-1601599967100-f16100982063'),
  'Meat and Seafood': U('photo-1754587489041-9fc8301f4c98'),
  Motherland: U('photo-1740439225991-ab26e8f6da9d'),
  'Non food': U('photo-1631856954655-966f97d809de'),
  Snack: U('photo-1604719312497-c6fc196f51ec'),
  Spices: U('photo-1596040033229-a9821ebd058d'),
}

/** @deprecated Use getCategoryImage — kept for any direct imports */
export const CATEGORY_IMAGES: Record<string, string> = { ...CATEGORY_REMOTE }

function resolveCategoryImage(category: string, minBytes = 10_000): string | undefined {
  const slug = CATEGORY_SLUG[category]
  const remote = CATEGORY_REMOTE[category]
  if (!slug || !remote) return undefined

  const local = localCategoryImage(categoryLocalFiles(slug), minBytes)

  return local ?? remote
}

export function getCategoryImage(category: string): string | undefined {
  return resolveCategoryImage(category)
}

export function getBeveragesCollectionImage(): string {
  return resolveCategoryImage('Beverages') ?? CATEGORY_REMOTE.Beverages
}

/** Featured “Beauty & Body Care” tile — same photo as Cosmetics category. */
export function getCosmeticsCollectionImage(): string {
  return resolveCategoryImage('Cosmetics') ?? CATEGORY_REMOTE.Cosmetics
}
