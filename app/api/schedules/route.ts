import { NextResponse, type NextRequest } from 'next/server'
import { getSchedules, createSchedule } from '@/lib/services/schedule-service'
import type { ScheduleType } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') ?? undefined
    const isCompletedParam = searchParams.get('is_completed')
    const is_completed =
      isCompletedParam === 'true' ? true : isCompletedParam === 'false' ? false : undefined
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 200

    const data = await getSchedules({ type, is_completed, limit })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.type) {
      return NextResponse.json({ error: '일정 유형을 선택하세요' }, { status: 400 })
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 })
    }
    if (!body.scheduled_at) {
      return NextResponse.json({ error: '일정 날짜는 필수입니다' }, { status: 400 })
    }

    const data = await createSchedule({
      type: body.type as ScheduleType,
      title: body.title,
      description: body.description,
      scheduled_at: body.scheduled_at,
      notify_days_before: body.notify_days_before ?? [],
      assigned_user_id: body.assigned_user_id,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
