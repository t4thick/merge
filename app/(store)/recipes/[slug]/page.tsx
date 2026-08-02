import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/store/PageHeader'
import { AddRecipeToCart } from '@/components/store/AddRecipeToCart'
import { fetchRecipeBySlug, fetchRecipes } from '@/lib/supabase/recipes'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const recipe = await fetchRecipeBySlug(slug)
  if (!recipe) return { title: 'Recipe not found', robots: { index: false } }
  return {
    title: recipe.title,
    description: recipe.summary ?? `${recipe.title} — ingredients from the store.`,
  }
}

export async function generateStaticParams() {
  const recipes = await fetchRecipes()
  return recipes.map((r) => ({ slug: r.slug }))
}

function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params
  const recipe = await fetchRecipeBySlug(slug)
  if (!recipe) notFound()

  const timing = [
    recipe.prep_minutes != null ? `${recipe.prep_minutes} min prep` : null,
    recipe.cook_minutes != null ? `${recipe.cook_minutes} min cook` : null,
    recipe.servings != null ? `${recipe.servings} servings` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const paragraphs = bodyParagraphs(recipe.body_md)
  const cartIngredients = recipe.ingredients
    .filter((i) => i.product)
    .map((i) => ({
      product: i.product!,
      quantity: i.quantity,
    }))

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader eyebrow="Recipe" title={recipe.title} subtitle={recipe.summary ?? undefined} />
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="store-container max-w-3xl">
          {timing && <p className="text-sm text-earth-500">{timing}</p>}

          <div className="mt-6 premium-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-earth-900">Ingredients</h2>
            <ul className="mt-4 space-y-2">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-earth-800">
                    {ing.quantity > 1 ? `${ing.quantity}× ` : ''}
                    {ing.label}
                  </span>
                  {ing.product ? (
                    <Link
                      href={`/products/${ing.product.id}`}
                      className="shrink-0 font-medium text-brand-700 no-underline hover:text-brand-800"
                    >
                      In store
                    </Link>
                  ) : (
                    <span className="shrink-0 text-xs text-earth-400">No link</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <AddRecipeToCart recipeTitle={recipe.title} ingredients={cartIngredients} />
            </div>
          </div>

          {paragraphs.length > 0 && (
            <div className="mt-8 space-y-4 text-base leading-relaxed text-earth-700">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <p className="mt-10">
            <Link href="/recipes" className="text-sm font-semibold text-brand-700 no-underline hover:text-brand-800">
              ← All recipes
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
