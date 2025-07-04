import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface User {
  id: string
  role: 'buyer' | 'seller'
  business_name: string
  created_at: string
}

export interface Product {
  id: number
  seller_id: string
  name_cn: string
  name_en?: string
  price: number
  image_url?: string
  description?: string
  stock: number
  created_at: string
  updated_at: string
  seller?: User
}

export interface Order {
  id: number
  buyer_id: string
  seller_id: string
  total_amount: number
  status: 'submitted' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  buyer?: User
  seller?: User
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  created_at: string
  product?: Product
}
