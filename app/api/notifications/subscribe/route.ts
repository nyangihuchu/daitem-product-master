import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '미인증' }, { status: 401 })

  const body = await req.json()
  const { endpoint, keys } = body as {
    endpoint: string
    keys: { auth: string; p256dh: string }
  }

  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return NextResponse.json({ error: 'endpoint, keys.auth, keys.p256dh 필수' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        keys_auth: keys.auth,
        keys_p256dh: keys.p256dh,
      },
      { onConflict: 'endpoint' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '미인증' }, { status: 401 })

  const body = await req.json()
  const { endpoint } = body as { endpoint: string }

  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint 필수' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
