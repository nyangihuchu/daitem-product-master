import type { SIDEBAR_ITEMS } from './constants'

export type SidebarItem = (typeof SIDEBAR_ITEMS)[number]

export interface WithChildren {
  children: React.ReactNode
}

export interface WithClassName {
  className?: string
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type PageProps<
  P extends Record<string, string> = Record<string, string>,
  S extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: Promise<P>
  searchParams: Promise<S>
}

export interface StatCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: string
}

// ----------------------------------------------------------------
// 도메인 타입
// ----------------------------------------------------------------

export type SupplierType = 'domestic' | 'overseas'
export type PaymentTerm = 'prepaid' | 'postpaid' | 'monthly'
export type ProductStatus = 'selling' | 'suspended' | 'out_of_stock' | 'discontinued'

export interface Supplier {
  id: string
  user_id: string
  type: SupplierType
  name: string
  contact_name: string | null
  contact_phone: string | null
  payment_term: PaymentTerm
  memo: string | null
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  supplier_id: string | null
  sku: string
  name: string
  category: string | null
  purchase_price: number
  selling_price: number
  margin_amount: number
  margin_rate: number
  stock_quantity: number
  min_stock_quantity: number
  platforms: string[]
  status: ProductStatus
  created_at: string
  supplier?: Pick<Supplier, 'id' | 'name' | 'type'>
}
