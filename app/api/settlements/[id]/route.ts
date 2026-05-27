import { NextResponse, type NextRequest } from 'next/server'
import { updateSettlement } from '@/lib/services/settlement-service'
import type { SettlementStatus } from '@/lib/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.status === undefined && body.actual_amount === undefined) {
      return NextResponse.json(
        { error: 'status 또는 actual_amount 중 하나 이상을 입력하세요' },
        { status: 400 },
      )
    }

    const VALID_STATUSES: SettlementStatus[] = ['pending', 'completed', 'overdue']
    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
    }

    const patch: { status?: SettlementStatus; actual_amount?: number | null } = {}
    if (body.status !== undefined) patch.status = body.status as SettlementStatus
    if (body.actual_amount !== undefined) patch.actual_amount = body.actual_amount

    const data = await updateSettlement(id, patch)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
