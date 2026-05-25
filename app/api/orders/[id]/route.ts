import { NextResponse, type NextRequest } from 'next/server'
import {
  getOrder,
  updateOrderStatus,
  updateOrderMarketNo,
} from '@/lib/services/order-service'
import type { OrderStatus } from '@/lib/types'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const data = await getOrder(id)
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
        const data = await updateOrderStatus(id, body.status as OrderStatus)
        return NextResponse.json(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        // 상태 전이 오류는 400
        if (message.includes('전이할 수 없습니다')) {
          return NextResponse.json({ error: message }, { status: 400 })
        }
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }

    if (body.market_order_no !== undefined) {
      const data = await updateOrderMarketNo(id, body.market_order_no)
      return NextResponse.json(data)
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

    try {
      await updateOrderStatus(id, 'cancelled')
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      if (message.includes('전이할 수 없습니다')) {
        return NextResponse.json({ error: message }, { status: 400 })
      }
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return new Response(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
