'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { APP_NAME } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { MobileNav } from './mobile-nav'

export function Header() {
  const router = useRouter()
  const [email, setEmail] = React.useState<string | null>(null)

  React.useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initial = email ? email[0].toUpperCase() : 'U'

  return (
    <header
      data-slot="header"
      className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm"
    >
      <div className="flex h-14 items-center justify-between px-4">
        <span className="font-semibold">{APP_NAME}</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-7">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{email ?? '내 계정'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
