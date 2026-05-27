import webpush from 'web-push'
import { Resend } from 'resend'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { getSchedules } from '@/lib/services/schedule-service'
import type { NotificationSettings } from '@/lib/types'

// ----------------------------------------------------------------
// 채널 어댑터 인터페이스
// ----------------------------------------------------------------

interface NotificationPayload {
  to: string
  subject: string
  body: string
}

interface NotificationChannel {
  name: string
  send(payload: NotificationPayload): Promise<void>
}

// ----------------------------------------------------------------
// 이메일 채널 (Resend)
// ----------------------------------------------------------------

class EmailChannel implements NotificationChannel {
  name = 'email'

  async send(payload: NotificationPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY 환경변수가 설정되지 않았습니다')

    const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: `<p>${payload.body.replace(/\n/g, '<br/>')}</p>`,
    })
    if (error) throw new Error(error.message)
  }
}

// ----------------------------------------------------------------
// 브라우저 푸시 채널 (web-push / VAPID)
// ----------------------------------------------------------------

class BrowserPushChannel implements NotificationChannel {
  name = 'browser_push'

  async send(payload: NotificationPayload): Promise<void> {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const email = process.env.VAPID_EMAIL

    if (!publicKey || !privateKey || !email) {
      throw new Error('VAPID 환경변수가 설정되지 않았습니다')
    }

    webpush.setVapidDetails(email, publicKey, privateKey)

    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subs } = await (supabase as any)
      .from('push_subscriptions')
      .select('endpoint, keys_auth, keys_p256dh')
      .eq('user_id', payload.to)

    if (!subs?.length) return

    const message = JSON.stringify({ title: payload.subject, body: payload.body })
    await Promise.allSettled(
      subs.map((sub: { endpoint: string; keys_auth: string; keys_p256dh: string }) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { auth: sub.keys_auth, p256dh: sub.keys_p256dh } },
          message,
        ),
      ),
    )
  }
}

// ----------------------------------------------------------------
// 카카오 알림톡 채널 (Phase 6 stub)
// ----------------------------------------------------------------

class KakaoChannel implements NotificationChannel {
  name = 'kakao'

  async send(payload: NotificationPayload): Promise<void> {
    console.warn('[Kakao stub - Phase 6]', payload.subject, payload.to)
  }
}

// ----------------------------------------------------------------
// 채널 인스턴스
// ----------------------------------------------------------------

const emailChannel = new EmailChannel()
const pushChannel = new BrowserPushChannel()
const kakaoChannel = new KakaoChannel()

// ----------------------------------------------------------------
// 단일 사용자에게 알림 발송
// ----------------------------------------------------------------

export async function sendNotification(
  userId: string,
  payload: Omit<NotificationPayload, 'to'>,
): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user } = await (supabase as any)
    .from('users')
    .select('email, notification_settings')
    .eq('id', userId)
    .single()

  if (!user) return

  const settings: NotificationSettings = user.notification_settings ?? {
    email: false,
    browser_push: false,
    kakao: false,
  }

  const tasks: Promise<void>[] = []

  if (settings.email && user.email) {
    tasks.push(emailChannel.send({ ...payload, to: user.email }))
  }
  if (settings.browser_push) {
    tasks.push(pushChannel.send({ ...payload, to: userId }))
  }
  if (settings.kakao) {
    tasks.push(kakaoChannel.send({ ...payload, to: userId }))
  }

  const results = await Promise.allSettled(tasks)
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[notification] 채널 ${i} 발송 실패:`, r.reason)
    }
  })
}

// ----------------------------------------------------------------
// 일정 D-day 알림 트리거
// ----------------------------------------------------------------

interface TriggerResult {
  sent: number
  errors: number
}

export async function triggerScheduleReminders(): Promise<TriggerResult> {
  const supabase = await createClient()
  const today = startOfDay(new Date())

  const schedules = await getSchedules({ is_completed: false, limit: 500 })

  let sent = 0
  let errors = 0

  for (const schedule of schedules) {
    if (!schedule.notify_days_before?.length) continue

    const daysUntil = differenceInDays(
      startOfDay(parseISO(schedule.scheduled_at)),
      today,
    )

    if (!schedule.notify_days_before.includes(daysUntil)) continue

    let userIds: string[] = []

    if (schedule.assigned_user_id) {
      userIds = [schedule.assigned_user_id]
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: admins } = await (supabase as any)
        .from('users')
        .select('id')
        .in('role', ['admin', 'operator'])
      userIds = (admins ?? []).map((u: { id: string }) => u.id)
    }

    for (const uid of userIds) {
      try {
        await sendNotification(uid, {
          subject: `[DAITEM] 일정 알림: ${schedule.title}`,
          body: `${daysUntil}일 후 일정이 있습니다.\n제목: ${schedule.title}\n날짜: ${schedule.scheduled_at}`,
        })
        sent++
      } catch (err) {
        console.error('[triggerScheduleReminders] 발송 실패:', err)
        errors++
      }
    }
  }

  return { sent, errors }
}

// ----------------------------------------------------------------
// 재고 부족 알림 트리거
// ----------------------------------------------------------------

export async function triggerLowStockAlerts(): Promise<TriggerResult> {
  const supabase = await createClient()

  // stock_quantity <= min_stock_quantity: Supabase JS 클라이언트가 컬럼 간 비교를 지원하지 않아 JS 필터 적용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allProducts } = await (supabase as any)
    .from('products')
    .select('id, name, stock_quantity, min_stock_quantity')
    .is('deleted_at', null)

  const lowList = (allProducts ?? []).filter(
    (p: { stock_quantity: number; min_stock_quantity: number }) =>
      p.stock_quantity <= p.min_stock_quantity,
  )

  if (!lowList.length) return { sent: 0, errors: 0 }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: managers } = await (supabase as any)
    .from('users')
    .select('id')
    .in('role', ['admin', 'operator'])

  const userIds: string[] = (managers ?? []).map((u: { id: string }) => u.id)

  const body =
    `재고 부족 상품 ${lowList.length}건:\n` +
    lowList
      .map(
        (p: { name: string; stock_quantity: number; min_stock_quantity: number }) =>
          `- ${p.name} (현재 ${p.stock_quantity} / 최소 ${p.min_stock_quantity})`,
      )
      .join('\n')

  let sent = 0
  let errors = 0

  for (const uid of userIds) {
    try {
      await sendNotification(uid, {
        subject: '[DAITEM] 재고 부족 알림',
        body,
      })
      sent++
    } catch (err) {
      console.error('[triggerLowStockAlerts] 발송 실패:', err)
      errors++
    }
  }

  return { sent, errors }
}
