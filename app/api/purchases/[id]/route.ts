import { NextResponse, type NextRequest } from 'next/server'
import {
  getPurchase,
  updatePurchaseStatus,
  softDeletePurchase,
} from '@/lib/services/purchase-service'
import type { PurchaseStatus } from '@/lib/types'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const data = await getPurchase(id)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.status !== undefined) {
      try {
        const data = await updatePurchaseStatus(id, body.status as PurchaseStatus)
        return NextResponse.json(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        if (message.includes('전이할 수 없습니다')) {
          return NextResponse.json({ error: message }, { status: 400 })
        }
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }

    return NextResponse.json({ error: '변경할 필드가 없습니다' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await softDeletePurchase(id)
    return new Response(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
