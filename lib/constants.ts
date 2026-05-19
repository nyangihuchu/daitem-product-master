export const APP_NAME = 'DAITEM'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const SIDEBAR_ITEMS = [
  { label: '대시보드', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: '공급처 관리', href: '/suppliers', icon: 'Building2' },
  { label: '상품 관리', href: '/products', icon: 'Package' },
  { label: '재고 현황', href: '/inventory', icon: 'BarChart3' },
] as const

export const THEMES = ['light', 'dark', 'system'] as const
