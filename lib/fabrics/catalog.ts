/**
 * Industry fabric / lace catalog helpers for the specialized admin add flow.
 * Maps staff-friendly fields → storefront product columns.
 */

export const FABRIC_KINDS = [
  {
    id: 'african_print_6yd',
    label: 'African print — 6 yards',
    category: 'African Prints',
    defaultYards: 6,
    hint: 'Ankara / wax print sold as a full 6-yard piece',
  },
  {
    id: 'lace',
    label: 'Lace',
    category: 'Lace',
    defaultYards: 5,
    hint: 'French lace, Guipure, cord lace, soft net — sold by piece or yardage',
  },
  {
    id: 'george',
    label: 'George / wrapper',
    category: 'African Prints',
    defaultYards: 6,
    hint: 'George wrapper sets and related yardage',
  },
  {
    id: 'voile',
    label: 'Voile / Brocade',
    category: 'African Prints',
    defaultYards: 5,
    hint: 'Swiss voile, brocade, dry lace blends',
  },
  {
    id: 'aso_oke',
    label: 'Aso Oke / traditional weave',
    category: 'African Prints',
    defaultYards: 8,
    hint: 'Traditional weave pieces',
  },
  {
    id: 'other_fabric',
    label: 'Other fabric',
    category: 'African Prints',
    defaultYards: 6,
    hint: 'Custom length or specialty textile',
  },
] as const

export type FabricKindId = (typeof FABRIC_KINDS)[number]['id']

export const FABRIC_WIDTHS = [
  { id: '45', label: '45″ (standard)' },
  { id: '60', label: '60″ (wide)' },
  { id: 'other', label: 'Other / unknown' },
] as const

export const FABRIC_COMPOSITIONS = [
  '100% cotton',
  'Cotton blend',
  '100% polyester',
  'Polyester blend',
  'Silk / silk blend',
  'Net / tulle',
  'Guipure',
  'Unknown',
] as const

export const FABRIC_ORIGINS = [
  'Nigeria',
  'Ghana',
  'Cote d\'Ivoire',
  'Europe',
  'China',
  'Other / unknown',
] as const

export function fabricKindById(id: string) {
  return FABRIC_KINDS.find((k) => k.id === id) ?? FABRIC_KINDS[0]
}

export function buildFabricProductName(input: {
  designName: string
  color: string
  kindId: FabricKindId
  yards: number
}): string {
  const kind = fabricKindById(input.kindId)
  const design = input.designName.trim()
  const color = input.color.trim()
  const parts = [design]
  if (color) parts.push(color)
  if (input.kindId === 'lace') {
    parts.push('Lace')
  } else if (input.kindId === 'african_print_6yd') {
    parts.push(`${formatYards(input.yards)} African Print`)
  } else {
    parts.push(kind.label.split('—')[0].trim())
  }
  return parts.filter(Boolean).join(' · ').slice(0, 200)
}

export function formatYards(yards: number): string {
  const n = Number(yards)
  if (!Number.isFinite(n)) return ''
  return Number.isInteger(n) ? `${n} yd` : `${n} yd`
}

export function buildFabricPackLabel(input: {
  yards: number
  widthId: string
  kindId: FabricKindId
}): string {
  const bits = [formatYards(input.yards)]
  if (input.widthId === '45') bits.push('45″')
  else if (input.widthId === '60') bits.push('60″')
  if (input.kindId === 'lace') bits.push('Lace')
  else if (input.kindId === 'african_print_6yd') bits.push('Print')
  return bits.filter(Boolean).join(' · ').slice(0, 80)
}

export function buildFabricDescription(input: {
  designName: string
  color: string
  kindId: FabricKindId
  yards: number
  widthId: string
  composition: string
  origin: string
  care: string
  notes: string
}): string {
  const kind = fabricKindById(input.kindId)
  const lines: string[] = []
  lines.push(`${kind.label}.`)
  lines.push(`Length: ${formatYards(input.yards)}.`)
  if (input.widthId === '45') lines.push('Width: about 45 inches.')
  else if (input.widthId === '60') lines.push('Width: about 60 inches.')
  if (input.color.trim()) lines.push(`Colorway: ${input.color.trim()}.`)
  if (input.composition && input.composition !== 'Unknown') {
    lines.push(`Composition: ${input.composition}.`)
  }
  if (input.origin && !input.origin.startsWith('Other')) {
    lines.push(`Origin: ${input.origin}.`)
  }
  if (input.care.trim()) lines.push(`Care: ${input.care.trim()}.`)
  if (input.notes.trim()) lines.push(input.notes.trim())
  return lines.join(' ').slice(0, 5000)
}

/** Slug for variant_group so colorways of the same design can link later. */
export function buildFabricVariantGroup(designName: string, kindId: FabricKindId): string {
  const base = designName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return `${kindId}-${base || 'design'}`.slice(0, 80)
}
