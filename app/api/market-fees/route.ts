import { NextResponse, type NextRequest } from 'next/server'
import { getCurrentFees, setFeeRate, isValidMarketChannel } from '@/lib/services/market-fee-service'

export async function GET() {
  try {
    const data = await getCurrentFees()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { market_name, fee_rate } = body

    if (!market_name || typeof market_name !== 'string' || !isValidMarketChannel(market_name)) {
      return NextResponse.json({ error: '유효하지 않은 마켓 채널입니다' }, { status: 400 })
    }

    const rate = Number(fee_rate)
    if (isNaN(rate) || rate <= 0 || rate > 100) {
      return NextResponse.json({ error: '수수료율은 0 초과 100 이하의 숫자여야 합니다' }, { status: 400 })
    }

    const data = await setFeeRate(market_name, rate)
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
