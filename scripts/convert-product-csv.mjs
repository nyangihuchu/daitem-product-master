import { readFileSync } from 'fs'
import { resolve } from 'path'
import iconv from 'iconv-lite'
import * as XLSX from 'xlsx'

const INPUT  = 'e:/cjl2211/superfix/ExcelProductList_원본.csv'
const OUTPUT = 'e:/cjl2211/superfix/ExcelProductList_표준화.xlsx'

// ── 1. EUC-KR 디코딩 ──────────────────────────────────────────────
console.log('파일 읽는 중...')
const raw = iconv.decode(readFileSync(resolve(INPUT)), 'EUC-KR')

// ── 2. CSV 파싱 ───────────────────────────────────────────────────
const lines = raw.split('\n')
const header = lines[0].split(',')

function getIdx(name) {
  return header.findIndex(h => h.trim() === name)
}

const IDX = {
  sku:              getIdx('상품코드'),
  supplier_item_no: getIdx('품번'),
  name:             getIdx('기본품명'),
  brand:            getIdx('브랜드명'),
  model_name:       getIdx('모델명'),
  category_large:   getIdx('대분류'),
  category_medium:  getIdx('중분류'),
  category_small:   getIdx('소분류'),
  spec:             getIdx('규격'),
  unit:             getIdx('단위명'),
  origin:           getIdx('원산지'),
  image_url:        getIdx('제품이미지'),
  price_list_image_url: getIdx('가격표이미지'),
  standard_price:   getIdx('표준가격'),
  base_selling_price: getIdx('판매가격'),
  purchase_price:   getIdx('매입가격'),
  shipping_fee:     getIdx('배송비가격(쇼핑몰)'),
  lead_time_desc:   getIdx('표준납기일'),
  is_returnable_raw: getIdx('반품불가'),
  discontinued:     getIdx('단종여부'),
  out_of_stock:     getIdx('품절설정'),
  stock_quantity:   getIdx('재고수량'),
}

console.log('컬럼 인덱스 확인:', IDX)

// ── 헬퍼 ────────────────────────────────────────────────────────
function clean(val) {
  if (val === undefined || val === null) return null
  const s = val.trim().replace(/^"|"$/g, '')
  if (s === '' || s === '정보없음' || s === '0' && false) return null
  return s
}

function toNum(val) {
  const n = Number(clean(val))
  return isNaN(n) ? 0 : n
}

function toNullableNum(val) {
  const s = clean(val)
  if (s === null || s === '0') return null
  const n = Number(s)
  return isNaN(n) ? null : n
}

function deriveStatus(row) {
  const disc = (row[IDX.discontinued] || '').trim().toLowerCase()
  const oos  = (row[IDX.out_of_stock]  || '').trim().toLowerCase()
  if (disc === 'y') return 'discontinued'
  if (oos  === 'y') return 'out_of_stock'
  return 'selling'
}

function deriveReturnable(row) {
  const v = (row[IDX.is_returnable_raw] || '').trim().toLowerCase()
  return v === 'y' ? 'FALSE' : 'TRUE'
}

// ── 3. 헤더 행 ───────────────────────────────────────────────────
const OUTPUT_HEADERS = [
  'sku', 'supplier_item_no', 'name', 'brand', 'model_name',
  'category_large', 'category_medium', 'category_small',
  'spec', 'unit', 'origin',
  'image_url', 'price_list_image_url',
  'standard_price', 'base_selling_price', 'purchase_price', 'shipping_fee',
  'lead_time_desc', 'is_returnable', 'status',
  'stock_quantity', 'min_stock_quantity',
]

// ── 4. 데이터 변환 ────────────────────────────────────────────────
console.log('데이터 변환 중... (약 11만 7천 행)')
const rows = [OUTPUT_HEADERS]
let skipped = 0

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line.trim()) continue

  // 쉼표 분리 (따옴표 내 쉼표 보호)
  const row = []
  let inQuote = false
  let cell = ''
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote }
    else if (ch === ',' && !inQuote) { row.push(cell); cell = '' }
    else { cell += ch }
  }
  row.push(cell)

  const sku = clean(row[IDX.sku])
  const name = clean(row[IDX.name])
  const purchase = toNum(row[IDX.purchase_price])

  if (!sku || !name) { skipped++; continue }

  rows.push([
    sku,
    clean(row[IDX.supplier_item_no]),
    name,
    clean(row[IDX.brand]),
    clean(row[IDX.model_name]),
    clean(row[IDX.category_large]),
    clean(row[IDX.category_medium]),
    clean(row[IDX.category_small]),
    clean(row[IDX.spec]),
    clean(row[IDX.unit]),
    clean(row[IDX.origin]),
    clean(row[IDX.image_url]),
    clean(row[IDX.price_list_image_url]),
    toNullableNum(row[IDX.standard_price]),
    toNullableNum(row[IDX.base_selling_price]),
    purchase,
    toNullableNum(row[IDX.shipping_fee]),
    clean(row[IDX.lead_time_desc]),
    deriveReturnable(row),
    deriveStatus(row),
    toNum(row[IDX.stock_quantity]),
    0,
  ])

  if (i % 10000 === 0) {
    process.stdout.write(`\r  ${i.toLocaleString()} / ${(lines.length - 1).toLocaleString()} 행 처리됨`)
  }
}
console.log(`\n변환 완료: ${(rows.length - 1).toLocaleString()}행 (스킵: ${skipped}행)`)

// ── 5. spec 시트 ─────────────────────────────────────────────────
const SPEC_ROWS = [
  ['필드명', '타입', '필수', '설명', '원본 CSV 컬럼'],
  ['sku',                  'text',    '✅', '공급처 상품코드 (예: 100-0016)',         '상품코드'],
  ['supplier_item_no',     'text',    '',   '공급처 내부 품번 (예: 1223919)',          '품번'],
  ['name',                 'text',    '✅', '상품명',                                 '기본품명'],
  ['brand',                'text',    '',   '브랜드명',                               '브랜드명'],
  ['model_name',           'text',    '',   '모델명',                                 '모델명'],
  ['category_large',       'text',    '',   '대분류',                                 '대분류'],
  ['category_medium',      'text',    '',   '중분류',                                 '중분류'],
  ['category_small',       'text',    '',   '소분류',                                 '소분류'],
  ['spec',                 'text',    '',   '규격 (예: 12PCS)',                        '규격'],
  ['unit',                 'text',    '',   '단위명 (EA, SET 등)',                     '단위명'],
  ['origin',               'text',    '',   '원산지 (예: CHINA)',                      '원산지'],
  ['image_url',            'text',    '',   '제품 이미지 URL',                         '제품이미지'],
  ['price_list_image_url', 'text',    '',   '가격표 이미지 URL',                       '가격표이미지'],
  ['standard_price',       'number',  '',   '표준가격 (권장소비자가)',                  '표준가격'],
  ['base_selling_price',   'number',  '',   '공급처 기본 판매가',                      '판매가격'],
  ['purchase_price',       'number',  '✅', '매입가격',                               '매입가격'],
  ['shipping_fee',         'number',  '',   '배송비 (원)',                             '배송비가격(쇼핑몰)'],
  ['lead_time_desc',       'text',    '',   '표준납기일 (예: 주문후60일이내)',           '표준납기일'],
  ['is_returnable',        'boolean', '',   'TRUE=반품가능, FALSE=반품불가',           '반품불가 (반전)'],
  ['status',               'text',    '',   'selling / out_of_stock / discontinued',  '단종여부+품절설정 파생'],
  ['stock_quantity',       'number',  '',   '재고수량',                               '재고수량'],
  ['min_stock_quantity',   'number',  '',   '최소재고 (기본값 0)',                      '—'],
]

// ── 6. Excel 저장 ────────────────────────────────────────────────
console.log('Excel 파일 생성 중...')
const wb = XLSX.utils.book_new()

const wsData = XLSX.utils.aoa_to_sheet(rows)
XLSX.utils.book_append_sheet(wb, wsData, 'products')

const wsSpec = XLSX.utils.aoa_to_sheet(SPEC_ROWS)
XLSX.utils.book_append_sheet(wb, wsSpec, 'spec')

XLSX.writeFile(wb, resolve(OUTPUT))
console.log(`✅ 저장 완료: ${OUTPUT}`)
console.log(`   - products 시트: ${(rows.length - 1).toLocaleString()}행`)
console.log(`   - spec 시트: 컬럼 설명 ${SPEC_ROWS.length - 1}개`)
