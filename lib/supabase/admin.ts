import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// 서비스 롤 키 사용 — RLS를 우회하는 서버 전용 클라이언트
// 반드시 API 라우트 / 서버 액션에서만 사용할 것
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
