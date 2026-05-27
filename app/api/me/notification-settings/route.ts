import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NotificationSettings } from '@/lib/types'

const DEFAULT_SETTINGS: NotificationSettings = {
  email: false,
  browser_push: false,
  kakao: false,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '미인증' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('notification_settings')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings: NotificationSettings = data?.notification_settings ?? DEFAULT_SETTINGS
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '미인증' }, { status: 401 })

  const patch = (await req.json()) as Partial<NotificationSettings>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('users')
    .select('notification_settings')
    .eq('id', user.id)
    .single()

  const merged: NotificationSettings = {
    ...DEFAULT_SETTINGS,
    ...(existing?.notification_settings ?? {}),
    ...patch,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('users')
    .update({ notification_settings: merged })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(merged)
}
