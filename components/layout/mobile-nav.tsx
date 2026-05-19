'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MenuIcon, LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { SIDEBAR_ITEMS, APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="size-4" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{APP_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2 pt-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'hover:bg-accent flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive && 'bg-accent',
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            )
          })}
        </nav>
        <div className="px-2 pt-4">
          <Button
            variant="ghost"
            className="text-muted-foreground w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOutIcon className="size-4" />
            로그아웃
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
