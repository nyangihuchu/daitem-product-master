import { NextResponse, type NextRequest } from 'next/server'
import { updateSchedule, deleteSchedule } from '@/lib/services/schedule-service'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: '변경할 필드가 없습니다' }, { status: 400 })
    }

    const data = await updateSchedule(id, body)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await deleteSchedule(id)
    return new Response(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
