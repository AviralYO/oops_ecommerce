import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type UserRole = 'customer' | 'retailer' | 'wholesaler'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image_url: string | null
  category: string
  retailer_id: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  total_amount: number
  gst_amount: number
  shipping_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  created_at: string
}
