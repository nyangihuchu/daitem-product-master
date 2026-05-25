import { NextResponse, type NextRequest } from 'next/server'
import { getProducts, createProduct } from '@/lib/services/product-service'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = Number(searchParams.get('page') ?? 1)
    const pageSize = Number(searchParams.get('page_size') ?? PAGE_SIZE)
    const search = searchParams.get('search') ?? undefined
    const category = searchParams.get('category') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const supplierId = searchParams.get('supplier_id') ?? undefined

    const { data, total } = await getProducts({ page, pageSize, search, category, status, supplierId })
    return NextResponse.json({ data, total, page, pageSize })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ error: '상품명을 입력하세요' }, { status: 400 })
    }
    if (!body.sku || typeof body.sku !== 'string' || body.sku.trim() === '') {
      return NextResponse.json({ error: 'SKU를 입력하세요' }, { status: 400 })
    }
    if (!body.internal_code || typeof body.internal_code !== 'string' || body.internal_code.trim() === '') {
      return NextResponse.json({ error: '내부코드를 입력하세요' }, { status: 400 })
    }
    if (body.purchase_price == null || isNaN(Number(body.purchase_price))) {
      return NextResponse.json({ error: '구입가를 입력하세요' }, { status: 400 })
    }

    const data = await createProduct({
      ...body,
      name: body.name.trim(),
      sku: body.sku.trim(),
      internal_code: body.internal_code.trim(),
      purchase_price: Number(body.purchase_price),
    })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
