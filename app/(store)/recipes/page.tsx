import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/store/PageHeader'
import { fetchRecipes } from '@/lib/supabase/recipes'

export const metadata: Metadata = {
  title: 'Recipes',
  description: 'Recipes with ingredients you can add to cart.',
}

export const revalidate = 60

export default async function RecipesPage() {
  const recipes = await fetchRecipes()

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader
        eyebrow="Cook"
        title="Recipes"
        subtitle="Ingredients linked to products in the store."
      />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container">
          {recipes.length === 0 ? (
            <div className="premium-card px-6 py-12 text-center text-sm text-earth-500">
              No recipes yet. Check back soon.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => {
                const timing = [
                  recipe.prep_minutes != null ? `${recipe.prep_minutes} min prep` : null,
                  recipe.cook_minutes != null ? `${recipe.cook_minutes} min cook` : null,
                  recipe.servings != null ? `${recipe.servings} servings` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')

                return (
                  <li key={recipe.id}>
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="premium-card premium-card-hover block h-full p-5 no-underline"
                    >
                      <h2 className="text-base font-semibold text-earth-900">{recipe.title}</h2>
                      {recipe.summary && (
                        <p className="mt-1 line-clamp-2 text-sm text-earth-600">{recipe.summary}</p>
                      )}
                      {timing && <p className="mt-3 text-xs text-earth-500">{timing}</p>}
                      <p className="mt-2 text-xs font-medium text-brand-700">
                        {recipe.ingredients.length} ingredient
                        {recipe.ingredients.length === 1 ? '' : 's'}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
