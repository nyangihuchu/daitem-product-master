'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboardIcon,
  Building2Icon,
  PackageIcon,
  BarChart3Icon,
  ShoppingCartIcon,
  ClipboardListIcon,
  WalletIcon,
  CalendarDaysIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIDEBAR_ITEMS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const ICON_MAP = {
  LayoutDashboard: LayoutDashboardIcon,
  Package: PackageIcon,
  Building2: Building2Icon,
  ShoppingCart: ShoppingCartIcon,
  ClipboardList: ClipboardListIcon,
  BarChart3: BarChart3Icon,
  Wallet: WalletIcon,
  CalendarDays: CalendarDaysIcon,
  Settings: SettingsIcon,
} as const

type IconName = keyof typeof ICON_MAP

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      data-slot="sidebar"
      className="bg-sidebar border-sidebar-border hidden w-60 flex-col border-r lg:flex"
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon as IconName]
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
            >
              {Icon && <Icon className="size-4" />}
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOutIcon className="size-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  )
}
