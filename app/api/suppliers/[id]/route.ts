import { NextResponse, type NextRequest } from 'next/server'
import {
  updateSupplier,
  deleteSupplier,
} from '@/lib/services/supplier-service'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const data = await updateSupplier(id, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.contact_name !== undefined && { contact_name: body.contact_name || null }),
      ...(body.contact_phone !== undefined && { contact_phone: body.contact_phone || null }),
      ...(body.payment_term !== undefined && { payment_term: body.payment_term }),
      ...(body.lead_time_days !== undefined && {
        lead_time_days: body.lead_time_days != null ? Number(body.lead_time_days) : null,
      }),
      ...(body.memo !== undefined && { memo: body.memo || null }),
    })

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await deleteSupplier(id)
    return new Response(null, { status: 204 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
