import { NextResponse } from 'next/server'
import { getDashboardKPI, getChannelSales } from '@/lib/services/dashboard-service'

export async function GET() {
  try {
    const [kpi, channelSales] = await Promise.all([getDashboardKPI(), getChannelSales()])
    return NextResponse.json({ kpi, channelSales })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
