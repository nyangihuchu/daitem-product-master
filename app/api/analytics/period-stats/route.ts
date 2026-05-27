import { NextResponse, type NextRequest } from 'next/server'
import { getPeriodStats, type PeriodType } from '@/lib/services/margin-service'

const VALID_PERIODS: PeriodType[] = ['daily', 'weekly', 'monthly', 'quarterly', 'annual']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const periodParam = searchParams.get('period')

    if (!periodParam || !VALID_PERIODS.includes(periodParam as PeriodType)) {
      return NextResponse.json(
        { error: 'period는 daily, weekly, monthly, quarterly, annual 중 하나여야 합니다' },
        { status: 400 },
      )
    }

    const data = await getPeriodStats(periodParam as PeriodType)
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
