/** Public inbox for customer contact & feedback (override with NEXT_PUBLIC_SUPPORT_EMAIL). */
export const DEFAULT_SUPPORT_EMAIL = 'kalebdoffour@gmail.com'

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL
}

/** Where feedback form submissions are delivered (server-only env). */
export function getFeedbackInbox(): string {
  return (
    process.env.FEEDBACK_TO_EMAIL?.trim() ||
    process.env.MERCHANT_ORDER_EMAIL?.trim() ||
    getSupportEmail()
  )
}

export const STORE = {
  name: 'Kintampo African Market',
  shortName: 'Kintampo Market',
  tagline: 'Groceries from Ghana & the Caribbean.',
  supportEmail: DEFAULT_SUPPORT_EMAIL,
  address: '1668 E Dublin Granville Rd, Columbus, OH 43229',
  /** Ship-from for packing slips. Env vars override these. */
  shipFrom: {
    street1: '1668 E Dublin Granville Rd',
    street2: '',
    city: 'Columbus',
    state: 'OH',
    zip: '43229',
    country: 'US',
    phone: '6144460893',
  },
  phone: '(614) 446-0893',
  phoneHref: 'tel:+16144460893',
  hours: 'Mon–Sat 9am–8pm · Sun 10am–6pm',
} as const
