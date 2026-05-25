import { NextResponse, type NextRequest } from 'next/server'
import { getPeriodStats } from '@/lib/services/margin-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const periodParam = searchParams.get('period') ?? 'monthly'

    if (!['daily', 'weekly', 'monthly'].includes(periodParam)) {
      return NextResponse.json(
        { error: 'period는 daily, weekly, monthly 중 하나여야 합니다' },
        { status: 400 },
      )
    }

    const data = await getPeriodStats(periodParam as 'daily' | 'weekly' | 'monthly')
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
