import { NextResponse, type NextRequest } from 'next/server'
import { getFeeHistory, isValidMarketChannel } from '@/lib/services/market-fee-service'

export async function GET(request: NextRequest) {
  try {
    const marketName = request.nextUrl.searchParams.get('market_name')

    if (!marketName || !isValidMarketChannel(marketName)) {
      return NextResponse.json({ error: '유효하지 않은 마켓 채널입니다' }, { status: 400 })
    }

    const data = await getFeeHistory(marketName)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
