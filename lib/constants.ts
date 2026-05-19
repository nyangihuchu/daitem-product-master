export const APP_NAME = 'StarterKit'
export const APP_DESCRIPTION = 'Next.js 15 Modern Web Starter'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Features', href: '/#features' },
] as const

export const SIDEBAR_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const

export const THEMES = ['light', 'dark', 'system'] as const
