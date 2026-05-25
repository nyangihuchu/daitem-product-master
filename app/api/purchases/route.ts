import { NextResponse, type NextRequest } from 'next/server'
import { getPurchases, createPurchase } from '@/lib/services/purchase-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') ?? undefined
    const supplierId = searchParams.get('supplier_id') ?? undefined
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50

    const data = await getPurchases({ status, supplierId, page, limit })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.supplier_id) {
      return NextResponse.json({ error: '공급처를 선택하세요' }, { status: 400 })
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: '상품을 1개 이상 입력하세요' }, { status: 400 })
    }

    for (const item of body.items) {
      if (!item.product_id) {
        return NextResponse.json({ error: '상품 ID가 누락됐습니다' }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ error: '수량은 1 이상의 정수여야 합니다' }, { status: 400 })
      }
      if (typeof item.purchase_price !== 'number' || item.purchase_price < 0) {
        return NextResponse.json({ error: '매입가는 0 이상이어야 합니다' }, { status: 400 })
      }
    }

    const data = await createPurchase({
      supplier_id: body.supplier_id,
      items: body.items,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
