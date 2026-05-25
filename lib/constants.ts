export const APP_NAME = 'DAITEM'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const SIDEBAR_ITEMS = [
  { label: '대시보드', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: '상품 관리', href: '/products', icon: 'Package' },
  { label: '공급처 관리', href: '/suppliers', icon: 'Building2' },
  { label: '주문 관리', href: '/orders', icon: 'ShoppingCart' },
  { label: '발주 관리', href: '/purchases', icon: 'ClipboardList' },
  { label: '수익 분석', href: '/analytics', icon: 'BarChart3' },
  { label: '정산 관리', href: '/settlements', icon: 'Wallet' },
  { label: '일정·알림', href: '/schedules', icon: 'CalendarDays' },
  { label: '설정', href: '/settings', icon: 'Settings' },
] as const

export const THEMES = ['light', 'dark', 'system'] as const

export const MARKET_CHANNELS = [
  { value: 'cafe24', label: '카페24' },
  { value: 'naver', label: '네이버스토어' },
  { value: 'coupang', label: '쿠팡' },
  { value: 'gmarket', label: '지마켓' },
  { value: 'auction', label: '옥션' },
  { value: 'lotteon', label: '롯데온' },
  { value: '11st', label: '11번가' },
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  received: '주문접수',
  ordered: '발주완료',
  shipping: '배송중',
  delivered: '배송완료',
  settled: '정산완료',
  cancelled: '취소',
  returned: '반품',
}

export const PURCHASE_STATUS_LABELS: Record<string, string> = {
  pending: '발주대기',
  ordered: '발주완료',
  shipping: '입고중',
  received: '입고완료',
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  selling: '판매중',
  out_of_stock: '품절',
  discontinued: '단종',
  pending: '대기',
  reviewing: '검토중',
}

export const PAYMENT_TERM_LABELS: Record<string, string> = {
  prepaid: '선불',
  postpaid: '후불',
  monthly: '월정산',
}

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: '관리자',
  operator: '운영자',
  viewer: '조회 전용',
}

export const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  supplier: '공급처',
  market: '마켓',
  internal: '내부업무',
  customer: '고객',
}
