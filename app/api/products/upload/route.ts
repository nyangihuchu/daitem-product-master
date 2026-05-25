import { NextResponse, type NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { upsertProducts } from '@/lib/services/product-service'
import type { ProductStatus } from '@/lib/types'

const CHUNK_SIZE = 100

interface UploadError {
  row: number
  sku: string
  message: string
}

interface UploadRow {
  sku: string
  internal_code: string
  name: string
  supplier_item_no?: string
  brand?: string
  model_name?: string
  category_large?: string
  category_medium?: string
  category_small?: string
  spec?: string
  unit?: string
  origin?: string
  standard_price?: number | null
  base_selling_price?: number | null
  purchase_price?: number
  shipping_fee?: number | null
  lead_time_desc?: string
  is_returnable?: boolean
  status?: ProductStatus
  stock_quantity?: number
  min_stock_quantity?: number
}

function toStr(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null
  return String(v).trim() || null
}

function toNum(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  const s = String(v).trim().toUpperCase()
  return s === 'TRUE' || s === '1' || s === 'Y'
}

function isValidStatus(s: string): s is ProductStatus {
  return ['selling', 'out_of_stock', 'discontinued', 'pending', 'reviewing'].includes(s)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '파일을 선택하세요' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let wb: XLSX.WorkBook
    try {
      wb = XLSX.read(buffer, { type: 'buffer' })
    } catch {
      return NextResponse.json({ error: '파일을 파싱할 수 없습니다. XLSX/XLS/CSV 형식을 사용하세요' }, { status: 400 })
    }

    const sheetName = wb.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: '시트가 없습니다' }, { status: 400 })
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName])

    if (rawRows.length === 0) {
      return NextResponse.json({ error: '데이터가 없습니다' }, { status: 400 })
    }

    const errors: UploadError[] = []
    const validRows: UploadRow[] = []

    for (let i = 0; i < rawRows.length; i++) {
      const raw = rawRows[i]
      const rowNum = i + 2

      const sku = toStr(raw['sku'])
      const name = toStr(raw['name'])
      const purchasePriceRaw = toNum(raw['purchase_price'])

      if (!sku) {
        errors.push({ row: rowNum, sku: '', message: 'sku가 없습니다' })
        continue
      }
      if (!name) {
        errors.push({ row: rowNum, sku, message: 'name이 없습니다' })
        continue
      }
      if (purchasePriceRaw === null) {
        errors.push({ row: rowNum, sku, message: 'purchase_price가 없거나 숫자가 아닙니다' })
        continue
      }

      const statusRaw = toStr(raw['status'])
      const status: ProductStatus = statusRaw && isValidStatus(statusRaw) ? statusRaw : 'pending'

      validRows.push({
        sku,
        internal_code: toStr(raw['internal_code']) ?? sku,
        name,
        supplier_item_no: toStr(raw['supplier_item_no']) ?? undefined,
        brand: toStr(raw['brand']) ?? undefined,
        model_name: toStr(raw['model_name']) ?? undefined,
        category_large: toStr(raw['category_large']) ?? undefined,
        category_medium: toStr(raw['category_medium']) ?? undefined,
        category_small: toStr(raw['category_small']) ?? undefined,
        spec: toStr(raw['spec']) ?? undefined,
        unit: toStr(raw['unit']) ?? undefined,
        origin: toStr(raw['origin']) ?? undefined,
        standard_price: toNum(raw['standard_price']),
        base_selling_price: toNum(raw['base_selling_price']),
        purchase_price: purchasePriceRaw,
        shipping_fee: toNum(raw['shipping_fee']),
        lead_time_desc: toStr(raw['lead_time_desc']) ?? undefined,
        is_returnable: raw['is_returnable'] !== undefined ? toBool(raw['is_returnable']) : true,
        status,
        stock_quantity: toNum(raw['stock_quantity']) ?? 0,
        min_stock_quantity: toNum(raw['min_stock_quantity']) ?? 0,
      })
    }

    let success = 0
    let failed = 0

    for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
      const chunk = validRows.slice(i, i + CHUNK_SIZE)
      try {
        await upsertProducts(chunk)
        success += chunk.length
      } catch (err) {
        failed += chunk.length
        const message = err instanceof Error ? err.message : '알 수 없는 오류'
        for (let j = 0; j < chunk.length; j++) {
          errors.push({ row: i + j + 2, sku: chunk[j].sku, message })
        }
      }
    }

    return NextResponse.json({ success, failed, errors })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
