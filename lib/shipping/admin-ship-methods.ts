export type AdminShipMethod = 'click-n-ship' | 'shippo' | 'integrated'

export const ADMIN_SHIP_METHODS: {
  id: AdminShipMethod
  title: string
  subtitle: string
  badge: 'ready' | 'building'
}[] = [
  {
    id: 'click-n-ship',
    title: 'USPS Click-N-Ship',
    subtitle: 'Your USPS business account · paste tracking',
    badge: 'ready',
  },
  {
    id: 'shippo',
    title: 'Shippo',
    subtitle: 'Discounted labels · paste tracking',
    badge: 'ready',
  },
  {
    id: 'integrated',
    title: 'Print in admin',
    subtitle: 'One-click Shippo label',
    badge: 'ready',
  },
]

export function isUspsLabelsLive(): boolean {
  return process.env.USPS_LABELS_ENABLED?.trim() === '1'
}

export function isShippoConfigured(): boolean {
  return Boolean(process.env.SHIPPO_API_TOKEN?.trim())
}
