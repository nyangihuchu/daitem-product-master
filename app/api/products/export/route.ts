import { type NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { getAllProductsForExport } from '@/lib/services/product-service'

const HEADERS = [
  'sku', 'internal_code', 'name', 'supplier_item_no', 'brand', 'model_name',
  'category_large', 'category_medium', 'category_small', 'spec', 'unit', 'origin',
  'standard_price', 'base_selling_price', 'purchase_price', 'shipping_fee',
  'lead_time_desc', 'is_returnable', 'status', 'stock_quantity', 'min_stock_quantity',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search') ?? undefined
    const category = searchParams.get('category') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const supplierId = searchParams.get('supplier_id') ?? undefined

    const products = await getAllProductsForExport({ search, category, status, supplierId })

    const rows = products.map((p) => [
      p.sku,
      p.internal_code,
      p.name,
      p.supplier_item_no ?? '',
      p.brand ?? '',
      p.model_name ?? '',
      p.category_large ?? '',
      p.category_medium ?? '',
      p.category_small ?? '',
      p.spec ?? '',
      p.unit ?? '',
      p.origin ?? '',
      p.standard_price ?? '',
      p.base_selling_price ?? '',
      p.purchase_price,
      p.shipping_fee ?? '',
      p.lead_time_desc ?? '',
      p.is_returnable ? 'TRUE' : 'FALSE',
      p.status,
      p.stock_quantity,
      p.min_stock_quantity,
    ])

    const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'products')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
    const date = new Date().toISOString().slice(0, 10)

    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="products-${date}.xlsx"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
