import type { NAV_ITEMS, SIDEBAR_ITEMS } from './constants'

export type NavItem = (typeof NAV_ITEMS)[number]
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

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'admin' | 'user' | 'guest'
}

export interface StatCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: string
}
