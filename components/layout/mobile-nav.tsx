'use client'

import * as React from 'react'
import Link from 'next/link'
import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { NAV_ITEMS, APP_NAME } from '@/lib/constants'

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="size-4" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{APP_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-6">
          {NAV_ITEMS.map((item) => (
            <SheetClose key={item.href} asChild>
              <Link
                href={item.href}
                className="hover:bg-accent flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
