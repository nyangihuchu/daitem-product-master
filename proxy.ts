import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import type { Database } from '@/lib/database.types'

const PROTECTED_PATHS = ['/dashboard', '/suppliers', '/products', '/inventory']
const AUTH_PATHS = ['/login', '/register']
const SETTINGS_PATHS = ['/dashboard/settings']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, user, authError } = await updateSession(request)

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))
  const isRoot = pathname === '/'

  // 루트 → 인증 상태에 따라 분기
  if (isRoot) {
    const target = user ? '/dashboard' : '/login'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 미인증 사용자 보호 경로 접근 차단
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 이미 로그인한 사용자가 인증 페이지 접근 → 대시보드 리디렉션
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // RBAC: viewer는 /dashboard/settings 접근 불가 → /dashboard 리다이렉트
  if (user && SETTINGS_PATHS.some((p) => pathname.startsWith(p))) {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => {
            cookies.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'viewer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
