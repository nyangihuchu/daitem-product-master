import type { SIDEBAR_ITEMS } from './constants'

// ----------------------------------------------------------------
// 유틸리티 타입
// ----------------------------------------------------------------

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
// 공통 enum 타입
// ----------------------------------------------------------------

export type UserRole = 'admin' | 'operator' | 'viewer'

export type PaymentTerm = 'prepaid' | 'postpaid' | 'monthly'

export type ProductStatus =
  | 'selling'
  | 'out_of_stock'
  | 'discontinued'
  | 'pending'
  | 'reviewing'

export type OrderStatus =
  | 'received'
  | 'ordered'
  | 'shipping'
  | 'delivered'
  | 'settled'
  | 'cancelled'
  | 'returned'

export type PurchaseStatus = 'pending' | 'ordered' | 'shipping' | 'received'

/** MVP는 manual, 향후 API 자동 수집 전환 시 api 사용 */
export type OrderSourceType = 'manual' | 'api'

/** MVP는 manual, 향후 자동 발주 전환 시 auto 사용 */
export type PurchaseTriggerType = 'manual' | 'auto'

export type ScheduleType = 'supplier' | 'market' | 'internal' | 'customer'

export type MarketChannel =
  | 'cafe24'
  | 'naver'
  | 'coupang'
  | 'gmarket'
  | 'auction'
  | 'lotteon'
  | '11st'

// ----------------------------------------------------------------
// 사용자 도메인
// ----------------------------------------------------------------

export interface NotificationSettings {
  email: boolean
  browser_push: boolean
  kakao: boolean
}

export interface User {
  id: string
  email: string
  role: UserRole
  notification_settings: NotificationSettings | null
  created_at: string
}

// ----------------------------------------------------------------
// 공급처 도메인
// ----------------------------------------------------------------

export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  contact_phone: string | null
  payment_term: PaymentTerm
  lead_time_days: number | null
  memo: string | null
  deleted_at: string | null
  created_at: string
}

// ----------------------------------------------------------------
// 상품 도메인
// ----------------------------------------------------------------

export interface Product {
  id: string
  supplier_id: string | null
  sku: string               // 공급처 상품코드 (예: 100-0016)
  supplier_item_no: string | null  // 공급처 품번 (예: 1223919)
  internal_code: string
  name: string
  brand: string | null
  model_name: string | null
  category_large: string | null
  category_medium: string | null
  category_small: string | null
  spec: string | null
  unit: string | null       // EA, SET 등
  origin: string | null
  image_url: string | null
  price_list_image_url: string | null
  standard_price: number | null    // 표준가격 (권장소비자가)
  base_selling_price: number | null  // 공급처 기본 판매가
  purchase_price: number
  shipping_fee: number | null
  lead_time_desc: string | null    // 표준납기일 (예: '주문후60일이내')
  is_returnable: boolean
  status: ProductStatus
  stock_quantity: number
  min_stock_quantity: number
  product_desc: string | null
  /** 카페24 API 연동 대비 Phase 1부터 포함 */
  cafe24_product_id: string | null
  deleted_at: string | null
  created_at: string
  supplier?: Pick<Supplier, 'id' | 'name'>
  market_listings?: MarketListing[]
}

export interface MarketListing {
  id: string
  product_id: string
  market_name: MarketChannel
  market_product_code: string | null
  listing_url: string | null
  selling_price: number
  registered_at: string
}

export interface PriceHistory {
  id: string
  product_id: string
  previous_price: number
  new_price: number
  changed_at: string
}

// ----------------------------------------------------------------
// 주문 도메인
// ----------------------------------------------------------------

export interface Order {
  id: string
  internal_order_no: string
  market_order_no: string | null
  channel: MarketChannel
  /** manual: 수동 입력, api: 마켓 API 자동 수집 */
  source_type: OrderSourceType
  status: OrderStatus
  ordered_at: string
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  selling_price: number
  product?: Pick<Product, 'id' | 'name' | 'sku' | 'internal_code'>
}

// ----------------------------------------------------------------
// 발주 도메인
// ----------------------------------------------------------------

export interface Purchase {
  id: string
  supplier_id: string
  /** manual: 수동 생성, auto: 주문 수신 시 자동 생성 */
  trigger_type: PurchaseTriggerType
  status: PurchaseStatus
  total_amount: number
  ordered_at: string
  deleted_at: string | null
  created_at: string
  supplier?: Pick<Supplier, 'id' | 'name'>
  purchase_items?: PurchaseItem[]
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  product_id: string
  quantity: number
  /** 발주 시점 매입가 (이력 보존) */
  purchase_price: number
  product?: Pick<Product, 'id' | 'name' | 'sku' | 'internal_code'>
}

// ----------------------------------------------------------------
// 수수료 도메인
// ----------------------------------------------------------------

export interface MarketFee {
  id: string
  market_name: MarketChannel
  fee_rate: number
  applied_at: string
  created_at: string
}

// ----------------------------------------------------------------
// 일정 도메인
// ----------------------------------------------------------------

export interface Schedule {
  id: string
  type: ScheduleType
  title: string
  description: string | null
  assigned_user_id: string | null
  scheduled_at: string
  notify_days_before: number[]
  is_completed: boolean
  created_at: string
  assigned_user?: Pick<User, 'id' | 'email'>
}

// ----------------------------------------------------------------
// 수익 분석 도메인
// ----------------------------------------------------------------

export interface MarginSummary {
  channel: MarketChannel
  selling_price: number
  purchase_price: number
  fee_rate: number
  fee_amount: number
  margin_amount: number
  margin_rate: number
}

export interface PeriodStats {
  period: string
  total_revenue: number
  total_purchase: number
  total_profit: number
  order_count: number
}

// ----------------------------------------------------------------
// 정산 도메인
// ----------------------------------------------------------------

export type SettlementStatus = 'pending' | 'completed' | 'overdue'

export interface Settlement {
  id: string
  market_name: MarketChannel
  settlement_cycle: 'weekly' | 'biweekly' | 'monthly'
  expected_date: string
  expected_amount: number
  actual_amount: number | null
  status: SettlementStatus
  created_at: string
}
