'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboardIcon,
  BarChart3Icon,
  SettingsIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIDEBAR_ITEMS } from '@/lib/constants'

const ICON_MAP = {
  LayoutDashboard: LayoutDashboardIcon,
  BarChart3: BarChart3Icon,
  Settings: SettingsIcon,
} as const

type IconName = keyof typeof ICON_MAP

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      data-slot="sidebar"
      className="bg-sidebar border-sidebar-border hidden w-60 flex-col border-r lg:flex"
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon as IconName]
          const isActive = pathname === item.href

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
    </aside>
  )
}
