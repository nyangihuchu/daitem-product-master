import { NextResponse, type NextRequest } from 'next/server'
import { getSettlements, createSettlement } from '@/lib/services/settlement-service'
import type { MarketChannel } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') ?? undefined
    const market = searchParams.get('market') ?? undefined
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50

    const data = await getSettlements({ status, market, page, limit })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.market_name) {
      return NextResponse.json({ error: '마켓 채널을 선택하세요' }, { status: 400 })
    }
    if (!body.settlement_cycle) {
      return NextResponse.json({ error: '정산 주기를 선택하세요' }, { status: 400 })
    }
    if (!body.expected_date) {
      return NextResponse.json({ error: '정산 예정일을 입력하세요' }, { status: 400 })
    }
    if (typeof body.expected_amount !== 'number' || body.expected_amount < 0) {
      return NextResponse.json({ error: '정산 예상금액은 0 이상이어야 합니다' }, { status: 400 })
    }

    const data = await createSettlement({
      market_name: body.market_name as MarketChannel,
      settlement_cycle: body.settlement_cycle,
      expected_date: body.expected_date,
      expected_amount: body.expected_amount,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
