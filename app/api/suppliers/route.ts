import { NextResponse, type NextRequest } from 'next/server'
import {
  getSuppliers,
  createSupplier,
} from '@/lib/services/supplier-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') ?? undefined
    const paymentTerm = searchParams.get('payment_term') ?? undefined

    const data = await getSuppliers({ search, paymentTerm })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: '공급처명을 입력하세요' }, { status: 400 })
    }

    const data = await createSupplier({
      name: body.name.trim(),
      contact_name: body.contact_name || null,
      contact_phone: body.contact_phone || null,
      payment_term: body.payment_term,
      lead_time_days: body.lead_time_days != null ? Number(body.lead_time_days) : null,
      memo: body.memo || null,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
