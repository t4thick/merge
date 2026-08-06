import Image from 'next/image'
import Link from 'next/link'
import { FASHION_CATEGORIES } from '@/lib/constants/categories'
import { getCategoryImage } from '@/lib/constants/category-images'
import { cn } from '@/lib/utils'

type FashionDeptStripProps = {
  activeCategory: string | null
  categoryCount: Record<string, number>
}

export function FashionDeptStrip({ activeCategory, categoryCount }: FashionDeptStripProps) {
  const cats = FASHION_CATEGORIES.filter(
    (cat) => (categoryCount[cat] ?? 0) > 0 || activeCategory === cat
  )
  if (cats.length === 0) return null

  return (
    <ul
      className={cn(
        'grid gap-2.5 sm:gap-3',
        cats.length === 1
          ? 'grid-cols-1 sm:grid-cols-2'
          : cats.length === 2
            ? 'grid-cols-2'
            : cats.length === 3
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-4'
      )}
    >
      {cats.map((cat) => {
        const imageUrl = getCategoryImage(cat)
        const count = categoryCount[cat] ?? 0
        const active = activeCategory === cat
        const href = active
          ? '/fashion'
          : `/fashion?category=${encodeURIComponent(cat)}`

        return (
          <li key={cat}>
            <Link
              href={href}
              className={cn(
                'group relative block overflow-hidden rounded-xl border no-underline transition-colors duration-150',
                active
                  ? 'border-earth-900 shadow-[var(--shadow-card)]'
                  : 'border-earth-200 hover:border-earth-300'
              )}
            >
              <span className="relative block aspect-[5/3] bg-earth-100 sm:aspect-[4/3]">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="(max-width:640px) 45vw, 180px"
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    aria-hidden
                  />
                ) : null}
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                  <span className="block truncate text-sm font-semibold text-white">{cat}</span>
                  <span className="mt-0.5 block text-[11px] tabular-nums text-white/80">
                    {count > 0 ? `${count} in stock` : 'View'}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
