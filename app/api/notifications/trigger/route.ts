import { NextRequest, NextResponse } from 'next/server'
import {
  triggerScheduleReminders,
  triggerLowStockAlerts,
} from '@/lib/services/notification-service'

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  try {
    const [schedule, stock] = await Promise.all([
      triggerScheduleReminders(),
      triggerLowStockAlerts(),
    ])
    return NextResponse.json({ schedule, stock })
  } catch (err) {
    console.error('[/api/notifications/trigger]', err)
    return NextResponse.json({ error: '알림 트리거 실패' }, { status: 500 })
  }
}
