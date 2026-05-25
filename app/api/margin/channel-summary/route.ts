import { NextResponse } from 'next/server'
import { getChannelMarginSummary } from '@/lib/services/margin-service'

export async function GET() {
  try {
    const data = await getChannelMarginSummary()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
