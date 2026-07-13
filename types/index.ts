export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  image_urls?: string[] | null
  in_stock: boolean
  created_at: string
}

export type CartItem = {
  product: Product
  quantity: number
}
