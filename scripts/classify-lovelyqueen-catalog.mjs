/**
 * Map lovelyqueenmart.com scrape into Lovely Queen store categories.
 * Uses name + source categories (ignores WooCommerce boilerplate descriptions).
 */
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve(process.cwd(), '..', 'lovelyqueen-scrape')
const PRODUCTS_JSON = path.join(OUT_DIR, 'products.json')

const STORE_CATEGORIES = [
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
  'Sample',
]

const SOURCE_CATEGORY_SCORES = {
  Alcohol: { Beverages: 8 },
  Beverages: { Beverages: 8 },
  'Beverages/Juices': { Beverages: 8 },
  Milk: { 'Dairy And Tea': 8 },
  Dairy: { 'Dairy And Tea': 8 },
  'Dairy Items': { 'Dairy And Tea': 8 },
  Breads: { Bread: 8 },
  'Fresh Bakery': { Bread: 8 },
  Bread: { Bread: 8 },
  Biscuits: { Snack: 7 },
  Cookies: { Snack: 7 },
  Crackers: { Snack: 7 },
  Bars: { Snack: 7 },
  'Cake & Cookies': { Snack: 7 },
  'Snacks Item': { Snack: 8 },
  Snack: { Snack: 8 },
  Pantry: { 'Flours & Rice': 6, Canned: 2 },
  Canned: { Canned: 8 },
  Vegetable: { 'Fresh Produce': 8 },
  'Green Vegetable': { 'Fresh Produce': 8 },
  'Root Vegetable': { 'Fresh Produce': 8 },
  Potato: { 'Fresh Produce': 10 },
  Fruit: { 'Fresh Produce': 8 },
  'Fresh Fruit': { 'Fresh Produce': 8 },
  'Exotic Fruits': { 'Fresh Produce': 8 },
  'Food Products': { 'Flours & Rice': 4, Canned: 2, Spices: 2 },
  Poultry: { 'Meat and Seafood': 8 },
  Seafood: { 'Meat and Seafood': 8 },
  Spices: { Spices: 8 },
  'Ointments, Hygiene, Medicine': { Cosmetics: 8 },
  'Home & Kitchen': { 'Non food': 7 },
  Household: { 'Non food': 6 },
  'Our Store': { Motherland: 3 },
  Culture: { Motherland: 5 },
  'Clothes & Fashion': { 'Non food': 8 },
  'Caribbean product': { 'Caribbean product': 8 },
  Frozen: { 'Frozen foods': 8 },
  'Frozen foods': { 'Frozen foods': 8 },
  Sample: { Sample: 8 },
  'Cold-drinks': { Beverages: 7 },
  Poultry: { 'Meat and Seafood': 8 },
}

const NAME_RULES = [
  { cat: 'Beverages', words: ['beer', 'wine', 'guinness', 'star beer', 'malta', 'vimto', 'juice', 'drink', 'soda', 'fanta', 'coca', 'pepsi', 'schweppes', 'maltina', 'malt pack', 'zobo', 'whiskey', 'vodka', 'rum', 'alcohol'] },
  { cat: 'Cosmetics', words: ['gel', 'lotion', 'cream', 'soap', 'caro white', 'carotone', 'qei', 'jaune', 'lightening', 'bleach', 'cosmetic', 'bath gel', 'shampoo', 'conditioner', 'shea butter', 'pomade', 'deodorant', 'toothpaste', 'bathing gel'] },
  { cat: 'Spices', words: ['spice', 'seasoning', 'pepper soup', 'suya', 'shito', 'curry powder', 'thyme', 'maggi', 'knorr', 'bouillon', 'palm oil', 'groundnut oil', 'vegetable oil', 'olive oil', 'sesame oil', 'red oil', 'ginger powder', 'garlic powder'] },
  { cat: 'Flours & Rice', words: ['rice', 'jollof', 'fufu', 'banku', 'gari', 'semolina', 'flour', 'cassava', 'plantain flour', 'yam flour', 'beans', 'black eye', 'egusi', 'groundnut', 'peanut', 'tomato paste', 'tomato mix', 'tasty tom', 'indomie', 'noodle', 'macaroni', 'spaghetti', 'couscous', 'millet', 'corn meal', 'corn flour', 'honeywell', 'golden penny', 'kenkey', 'parboiled', 'mhamsa'] },
  { cat: 'Canned', words: ['canned', 'sardine', 'mackerel tin', 'corned beef', 'baked beans', 'tomato puree'] },
  { cat: 'Dairy And Tea', words: ['tea', 'milk powder', 'peak milk', 'carnations', 'evaporated milk', 'condensed milk', 'yogurt', 'cheese', 'butter', 'margarine', 'milky mist'] },
  { cat: 'Meat and Seafood', words: ['fish', 'tilapia', 'stockfish', 'smoked fish', 'kini fish', 'shrimp', 'prawn', 'crab', 'goat meat', 'chicken', 'turkey', 'beef', 'sausage', 'snail', 'dried snail', 'meat'] },
  { cat: 'Frozen foods', words: ['frozen', 'ice cream'] },
  { cat: 'Bread', words: ['bread', ' bun', 'roll', 'rusk', 'toastea', 'baguette', 'britannia'] },
  { cat: 'Snack', words: ['chip', 'crisp', 'cracker', 'biscuit', 'cookie', 'snack', 'chin chin', 'plantain chip', 'popcorn', 'candy', 'chocolate', 'kinder', 'belvita'] },
  { cat: 'Fresh Produce', words: ['plantain', 'yam', 'okra', 'spinach', 'ugwu', 'kontomire', 'onion', 'garlic', 'ginger', 'potato', 'tomato', 'cucumber', 'lettuce', 'carrot', 'cabbage', 'mango', 'banana', 'apple', 'orange', 'lemon', 'avocado', 'pomegranate', 'amaranthus', 'coconut kalash', ' per kg', ' per lb', 'bunch'] },
  { cat: 'Caribbean product', words: ['jamaican', 'caribbean', 'ackee', 'scotch bonnet', 'jerk', 'callaloo'] },
  { cat: 'Non food', words: ['plastic drum', 'pot ', ' pan', 'utensil', 'plate', 'cup', 'fabric', 'dress', 'florida water'] },
  { cat: 'Motherland', words: ['kente', 'ankara', 'african print', 'chewing stick', 'kaawe', 'shile', 'authentic shile'] },
]

function decodeHtml(s) {
  if (!s) return ''
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8217;|&rsquo;/g, "'")
    .trim()
}

function stripHtml(input) {
  if (!input) return ''
  return decodeHtml(String(input).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
}

function cleanDescription(input) {
  const d = stripHtml(input)
  if (!d) return ''
  const lower = d.toLowerCase()
  if (lower.includes('add to wishlist')) return ''
  if (lower === 'continue loading done') return ''
  return d
}

function norm(s) {
  return ` ${(s ?? '').toLowerCase()} `
}

function classifyProduct(product) {
  const name = norm(stripHtml(product.name))
  const desc = norm(cleanDescription(product.short_description || product.description || ''))
  const sourceCats = (product.categories ?? []).map((c) => decodeHtml(c.name))

  const scores = Object.fromEntries(STORE_CATEGORIES.map((c) => [c, 0]))

  for (const src of sourceCats) {
    const mapped = SOURCE_CATEGORY_SCORES[src]
    if (mapped) {
      for (const [cat, pts] of Object.entries(mapped)) {
        scores[cat] += pts
      }
    } else {
      const lower = src.toLowerCase()
      if (lower.includes('beverage') || lower.includes('juice') || lower.includes('alcohol')) scores.Beverages += 4
      if (lower.includes('dairy') || lower.includes('milk')) scores['Dairy And Tea'] += 4
      if (lower.includes('bread') || lower.includes('bakery')) scores.Bread += 4
      if (lower.includes('snack') || lower.includes('biscuit') || lower.includes('cookie')) scores.Snack += 4
      if (lower.includes('vegetable') || lower.includes('fruit') || lower.includes('produce') || lower.includes('potato')) {
        scores['Fresh Produce'] += 5
      }
      if (lower.includes('spice') || lower.includes('herb')) scores.Spices += 4
      if (lower.includes('frozen')) scores['Frozen foods'] += 4
      if (lower.includes('meat') || lower.includes('seafood') || lower.includes('poultry') || lower.includes('fish')) {
        scores['Meat and Seafood'] += 4
      }
      if (lower.includes('cosmetic') || lower.includes('hygiene') || lower.includes('medicine') || lower.includes('ointment')) {
        scores.Cosmetics += 4
      }
      if (lower.includes('kitchen') || lower.includes('home') || lower.includes('household')) scores['Non food'] += 3
    }
  }

  for (const rule of NAME_RULES) {
    for (const w of rule.words) {
      if (name.includes(w)) {
        scores[rule.cat] += 10
        break
      }
    }
  }

  // Light description boost (real copy only)
  if (desc.length > 30) {
    for (const rule of NAME_RULES) {
      for (const w of rule.words) {
        if (desc.includes(w)) {
          scores[rule.cat] += 2
          break
        }
      }
    }
  }

  let best = 'Motherland'
  let bestScore = -1
  let reason = 'fallback:uncategorized'

  for (const cat of STORE_CATEGORIES) {
    if (scores[cat] > bestScore) {
      bestScore = scores[cat]
      best = cat
      reason = `score:${scores[cat]}`
    }
  }

  if (bestScore <= 0 && sourceCats.length > 0) {
    reason = `source_only:${sourceCats.join('|')}`
  }

  return { category: best, reason, scores }
}

function toMoney(prices) {
  if (!prices) return 0
  const raw = prices.price ?? prices.regular_price ?? '0'
  if (typeof raw === 'string' && /^\d+$/.test(raw)) {
    return Number((Number.parseInt(raw, 10) / 100).toFixed(2))
  }
  return Number(Number(raw).toFixed(2))
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

if (!fs.existsSync(PRODUCTS_JSON)) {
  throw new Error(`Run scrape-lovelyqueenmart.mjs first. Missing: ${PRODUCTS_JSON}`)
}

const { products } = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'))

const organized = products.map((p) => {
  const { category, reason } = classifyProduct(p)
  const sourceCats = (p.categories ?? []).map((c) => decodeHtml(c.name)).join(' | ')
  const images = (p.images ?? []).map((i) => i.src).filter(Boolean)
  const description = cleanDescription(p.short_description || p.description || '') || null
  return {
    source_id: p.id,
    name: stripHtml(p.name),
    store_category: category,
    classification_reason: reason,
    source_categories: sourceCats,
    price: toMoney(p.prices),
    in_stock: Boolean(p.is_in_stock),
    description,
    image_url: images[0] ?? '',
    permalink: p.permalink,
    sku: p.sku ?? '',
    type: p.type,
  }
})

const columns = [
  'source_id',
  'name',
  'store_category',
  'classification_reason',
  'source_categories',
  'price',
  'in_stock',
  'description',
  'image_url',
  'permalink',
  'sku',
  'type',
]

const csv = [columns.join(','), ...organized.map((r) => columns.map((c) => csvEscape(r[c])).join(','))].join('\n')

fs.writeFileSync(path.join(OUT_DIR, 'organized_catalog.csv'), csv, 'utf8')
fs.writeFileSync(path.join(OUT_DIR, 'organized_catalog.json'), JSON.stringify({ organized }, null, 2))

const counts = {}
for (const row of organized) {
  counts[row.store_category] = (counts[row.store_category] ?? 0) + 1
}

const summaryLines = [
  '# Lovely Queen Mart -> Store Category Summary',
  `Source: https://lovelyqueenmart.com/`,
  `Total products: ${organized.length}`,
  '',
  ...Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) => `${cat}: ${n}`),
]

fs.writeFileSync(path.join(OUT_DIR, 'organized_summary.txt'), summaryLines.join('\n'), 'utf8')

const reportCols = ['name', 'source_categories', 'store_category', 'reason']
const reportCsv = [
  reportCols.join(','),
  ...organized.map((r) =>
    [r.name, r.source_categories, r.store_category, r.classification_reason]
      .map((v) => csvEscape(v))
      .join(',')
  ),
].join('\n')
fs.writeFileSync(path.join(OUT_DIR, 'category_mapping_report.csv'), reportCsv, 'utf8')

console.log(summaryLines.join('\n'))
