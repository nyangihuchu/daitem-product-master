import type {
  Product,
  Supplier,
  Order,
  OrderItem,
  Purchase,
  PurchaseItem,
  MarketFee,
  Schedule,
  Settlement,
  MarketListing,
  PriceHistory,
  MarginSummary,
  PeriodStats,
  User,
} from './types'

// ─── 공급처 ────────────────────────────────────────────────────────────────

const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: '한국공구산업(주)',
    contact_name: '김철수',
    contact_phone: '02-1234-5678',
    payment_term: 'monthly',
    lead_time_days: 3,
    memo: '매월 말일 정산',
    deleted_at: null,
    created_at: '2024-01-05T09:00:00Z',
  },
  {
    id: 'sup-002',
    name: '대한전기자재(주)',
    contact_name: '이영희',
    contact_phone: '031-9876-5432',
    payment_term: 'postpaid',
    lead_time_days: 5,
    memo: null,
    deleted_at: null,
    created_at: '2024-01-10T09:00:00Z',
  },
  {
    id: 'sup-003',
    name: '(주)신일산업',
    contact_name: '박민준',
    contact_phone: '032-2222-3333',
    payment_term: 'prepaid',
    lead_time_days: 7,
    memo: '선불 결제 후 발주',
    deleted_at: null,
    created_at: '2024-02-01T09:00:00Z',
  },
  {
    id: 'sup-004',
    name: '(주)대성공업',
    contact_name: '최수진',
    contact_phone: '051-7777-8888',
    payment_term: 'monthly',
    lead_time_days: 14,
    memo: '특수 공구 전문',
    deleted_at: null,
    created_at: '2024-02-15T09:00:00Z',
  },
  {
    id: 'sup-005',
    name: '태양전기상사',
    contact_name: '정동현',
    contact_phone: '042-4444-5555',
    payment_term: 'postpaid',
    lead_time_days: 2,
    memo: null,
    deleted_at: null,
    created_at: '2024-03-01T09:00:00Z',
  },
]

export function getDummySuppliers(): Supplier[] {
  return SUPPLIERS
}

// ─── 상품 ────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 'prd-001',
    supplier_id: 'sup-001',
    sku: '100-0016',
    supplier_item_no: '1223919',
    internal_code: 'INT-001',
    name: '육각렌치 세트 9PCS',
    brand: 'STANLEY',
    model_name: 'ST-HEX9',
    category_large: '공구',
    category_medium: '수공구',
    category_small: '렌치',
    spec: '9PCS',
    unit: 'SET',
    origin: 'CHINA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 25000,
    base_selling_price: 18000,
    purchase_price: 9500,
    shipping_fee: 3000,
    lead_time_desc: '주문후3일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 142,
    min_stock_quantity: 10,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-01-10T09:00:00Z',
    supplier: { id: 'sup-001', name: '한국공구산업(주)' },
  },
  {
    id: 'prd-002',
    supplier_id: 'sup-001',
    sku: '100-0045',
    supplier_item_no: '1224001',
    internal_code: 'INT-002',
    name: '드라이버 비트 세트 30PCS',
    brand: 'BOSCH',
    model_name: 'BS-30BIT',
    category_large: '공구',
    category_medium: '전동공구',
    category_small: '비트',
    spec: '30PCS',
    unit: 'SET',
    origin: 'GERMANY',
    image_url: null,
    price_list_image_url: null,
    standard_price: 42000,
    base_selling_price: 32000,
    purchase_price: 18000,
    shipping_fee: null,
    lead_time_desc: '주문후3일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 85,
    min_stock_quantity: 5,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-01-12T09:00:00Z',
    supplier: { id: 'sup-001', name: '한국공구산업(주)' },
  },
  {
    id: 'prd-003',
    supplier_id: 'sup-002',
    sku: '200-1101',
    supplier_item_no: '2301123',
    internal_code: 'INT-003',
    name: '멀티탭 6구 3M',
    brand: 'LOTTE히타치',
    model_name: 'LH-6P3M',
    category_large: '전기',
    category_medium: '전원',
    category_small: '멀티탭',
    spec: '6구/3M',
    unit: 'EA',
    origin: 'KOREA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 22000,
    base_selling_price: 15900,
    purchase_price: 7200,
    shipping_fee: 2500,
    lead_time_desc: '주문후2일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 312,
    min_stock_quantity: 20,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-01-15T09:00:00Z',
    supplier: { id: 'sup-002', name: '대한전기자재(주)' },
  },
  {
    id: 'prd-004',
    supplier_id: 'sup-002',
    sku: '200-1205',
    supplier_item_no: '2301456',
    internal_code: 'INT-004',
    name: '절연 장갑 (10KV)',
    brand: 'HONEYWELL',
    model_name: 'HW-10KV-M',
    category_large: '안전',
    category_medium: '보호구',
    category_small: '장갑',
    spec: '10KV/M사이즈',
    unit: 'EA',
    origin: 'USA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 88000,
    base_selling_price: 72000,
    purchase_price: 45000,
    shipping_fee: null,
    lead_time_desc: '주문후7일이내',
    is_returnable: false,
    status: 'selling',
    stock_quantity: 28,
    min_stock_quantity: 5,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-01-20T09:00:00Z',
    supplier: { id: 'sup-002', name: '대한전기자재(주)' },
  },
  {
    id: 'prd-005',
    supplier_id: 'sup-003',
    sku: '300-0011',
    supplier_item_no: '3101001',
    internal_code: 'INT-005',
    name: '자동 페인트 롤러 세트',
    brand: 'SINNIL',
    model_name: 'SN-PRS2',
    category_large: '도장',
    category_medium: '도구',
    category_small: '롤러',
    spec: '9인치/2개입',
    unit: 'SET',
    origin: 'KOREA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 15000,
    base_selling_price: 11000,
    purchase_price: 5500,
    shipping_fee: 3000,
    lead_time_desc: '주문후5일이내',
    is_returnable: true,
    status: 'out_of_stock',
    stock_quantity: 0,
    min_stock_quantity: 15,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-02-01T09:00:00Z',
    supplier: { id: 'sup-003', name: '(주)신일산업' },
  },
  {
    id: 'prd-006',
    supplier_id: 'sup-003',
    sku: '300-0099',
    supplier_item_no: '3102200',
    internal_code: 'INT-006',
    name: '산업용 마스크 KF94 50매',
    brand: 'CLEANPRO',
    model_name: 'CP-KF94-50',
    category_large: '안전',
    category_medium: '보호구',
    category_small: '마스크',
    spec: 'KF94/50매입',
    unit: 'BOX',
    origin: 'KOREA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 35000,
    base_selling_price: 28000,
    purchase_price: 14000,
    shipping_fee: null,
    lead_time_desc: '주문후3일이내',
    is_returnable: false,
    status: 'selling',
    stock_quantity: 450,
    min_stock_quantity: 50,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-02-10T09:00:00Z',
    supplier: { id: 'sup-003', name: '(주)신일산업' },
  },
  {
    id: 'prd-007',
    supplier_id: 'sup-004',
    sku: '400-0033',
    supplier_item_no: '4201033',
    internal_code: 'INT-007',
    name: '토크 렌치 1/2인치',
    brand: 'PROTO',
    model_name: 'PT-TW12',
    category_large: '공구',
    category_medium: '수공구',
    category_small: '렌치',
    spec: '1/2인치/20~200Nm',
    unit: 'EA',
    origin: 'USA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 180000,
    base_selling_price: 145000,
    purchase_price: 95000,
    shipping_fee: null,
    lead_time_desc: '주문후14일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 7,
    min_stock_quantity: 3,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-02-15T09:00:00Z',
    supplier: { id: 'sup-004', name: '(주)대성공업' },
  },
  {
    id: 'prd-008',
    supplier_id: 'sup-004',
    sku: '400-0077',
    supplier_item_no: '4201077',
    internal_code: 'INT-008',
    name: '에어 임팩트 렌치 3/4인치',
    brand: 'INGERSOLL RAND',
    model_name: 'IR-2175MAX',
    category_large: '공구',
    category_medium: '공압공구',
    category_small: '임팩트렌치',
    spec: '3/4인치/2034Nm',
    unit: 'EA',
    origin: 'USA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 520000,
    base_selling_price: 430000,
    purchase_price: 280000,
    shipping_fee: null,
    lead_time_desc: '주문후60일이내',
    is_returnable: true,
    status: 'discontinued',
    stock_quantity: 2,
    min_stock_quantity: 0,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-02-20T09:00:00Z',
    supplier: { id: 'sup-004', name: '(주)대성공업' },
  },
  {
    id: 'prd-009',
    supplier_id: 'sup-005',
    sku: '500-0021',
    supplier_item_no: '5101021',
    internal_code: 'INT-009',
    name: 'LED 투광등 50W',
    brand: 'TAEYANG',
    model_name: 'TY-LED50',
    category_large: '전기',
    category_medium: '조명',
    category_small: '투광등',
    spec: '50W/주광색',
    unit: 'EA',
    origin: 'CHINA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 45000,
    base_selling_price: 35000,
    purchase_price: 18500,
    shipping_fee: 3000,
    lead_time_desc: '주문후2일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 3,
    min_stock_quantity: 10,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-03-01T09:00:00Z',
    supplier: { id: 'sup-005', name: '태양전기상사' },
  },
  {
    id: 'prd-010',
    supplier_id: 'sup-005',
    sku: '500-0055',
    supplier_item_no: '5101055',
    internal_code: 'INT-010',
    name: '디지털 멀티미터',
    brand: 'FLUKE',
    model_name: 'FL-117',
    category_large: '측정',
    category_medium: '전기측정',
    category_small: '멀티미터',
    spec: 'CAT III 600V',
    unit: 'EA',
    origin: 'USA',
    image_url: null,
    price_list_image_url: null,
    standard_price: 165000,
    base_selling_price: 138000,
    purchase_price: 88000,
    shipping_fee: null,
    lead_time_desc: '주문후3일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 19,
    min_stock_quantity: 5,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-03-05T09:00:00Z',
    supplier: { id: 'sup-005', name: '태양전기상사' },
  },
  {
    id: 'prd-011',
    supplier_id: 'sup-001',
    sku: '100-0120',
    supplier_item_no: '1225001',
    internal_code: 'INT-011',
    name: '스패너 세트 8PCS',
    brand: 'STANLEY',
    model_name: 'ST-SP8',
    category_large: '공구',
    category_medium: '수공구',
    category_small: '스패너',
    spec: '8-22mm/8PCS',
    unit: 'SET',
    origin: 'TAIWAN',
    image_url: null,
    price_list_image_url: null,
    standard_price: 38000,
    base_selling_price: 29000,
    purchase_price: 14500,
    shipping_fee: 3000,
    lead_time_desc: '주문후3일이내',
    is_returnable: true,
    status: 'selling',
    stock_quantity: 67,
    min_stock_quantity: 10,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-03-10T09:00:00Z',
    supplier: { id: 'sup-001', name: '한국공구산업(주)' },
  },
  {
    id: 'prd-012',
    supplier_id: 'sup-002',
    sku: '200-1300',
    supplier_item_no: '2302000',
    internal_code: 'INT-012',
    name: '방수 IP65 소켓 콘센트',
    brand: 'SCHNEIDER',
    model_name: 'SE-IP65-16A',
    category_large: '전기',
    category_medium: '콘센트',
    category_small: '방수콘센트',
    spec: '16A/IP65',
    unit: 'EA',
    origin: 'FRANCE',
    image_url: null,
    price_list_image_url: null,
    standard_price: 12000,
    base_selling_price: 9800,
    purchase_price: 4800,
    shipping_fee: null,
    lead_time_desc: '주문후5일이내',
    is_returnable: true,
    status: 'pending',
    stock_quantity: 0,
    min_stock_quantity: 20,
    cafe24_product_id: null,
    deleted_at: null,
    created_at: '2024-03-15T09:00:00Z',
    supplier: { id: 'sup-002', name: '대한전기자재(주)' },
  },
]

export function getDummyProducts(): Product[] {
  return PRODUCTS
}

export function getDummyProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

// ─── 마켓 수수료 ───────────────────────────────────────────────────────────

const MARKET_FEES: MarketFee[] = [
  { id: 'fee-001', market_name: 'cafe24',  fee_rate: 2.5,  applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'fee-002', market_name: 'naver',   fee_rate: 4.5,  applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'fee-003', market_name: 'coupang', fee_rate: 10.8, applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'fee-004', market_name: 'gmarket', fee_rate: 9.0,  applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'fee-005', market_name: 'auction', fee_rate: 9.0,  applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'fee-006', market_name: 'lotteon', fee_rate: 7.0,  applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
  { id: 'fee-007', market_name: '11st',    fee_rate: 8.5,  applied_at: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
]

export function getDummyMarketFees(): MarketFee[] {
  return MARKET_FEES
}

// ─── 마켓 등록 현황 ────────────────────────────────────────────────────────

const MARKET_LISTINGS: MarketListing[] = [
  { id: 'ml-001', product_id: 'prd-001', market_name: 'cafe24',  market_product_code: 'C24-001', listing_url: null, selling_price: 18000, registered_at: '2024-01-15T00:00:00Z' },
  { id: 'ml-002', product_id: 'prd-001', market_name: 'naver',   market_product_code: 'NV-001',  listing_url: null, selling_price: 17500, registered_at: '2024-01-15T00:00:00Z' },
  { id: 'ml-003', product_id: 'prd-001', market_name: 'coupang', market_product_code: 'CP-001',  listing_url: null, selling_price: 17900, registered_at: '2024-01-16T00:00:00Z' },
  { id: 'ml-004', product_id: 'prd-002', market_name: 'cafe24',  market_product_code: 'C24-002', listing_url: null, selling_price: 32000, registered_at: '2024-01-20T00:00:00Z' },
  { id: 'ml-005', product_id: 'prd-002', market_name: 'naver',   market_product_code: 'NV-002',  listing_url: null, selling_price: 31500, registered_at: '2024-01-20T00:00:00Z' },
  { id: 'ml-006', product_id: 'prd-003', market_name: 'coupang', market_product_code: 'CP-003',  listing_url: null, selling_price: 15900, registered_at: '2024-01-22T00:00:00Z' },
  { id: 'ml-007', product_id: 'prd-003', market_name: 'gmarket', market_product_code: 'GM-003',  listing_url: null, selling_price: 15500, registered_at: '2024-01-22T00:00:00Z' },
  { id: 'ml-008', product_id: 'prd-010', market_name: 'cafe24',  market_product_code: 'C24-010', listing_url: null, selling_price: 138000, registered_at: '2024-03-10T00:00:00Z' },
]

export function getDummyMarketListings(productId?: string): MarketListing[] {
  if (productId) return MARKET_LISTINGS.filter((ml) => ml.product_id === productId)
  return MARKET_LISTINGS
}

// ─── 주문 ────────────────────────────────────────────────────────────────

const ORDERS: Order[] = [
  {
    id: 'ord-001',
    internal_order_no: 'ORD-2024-0001',
    market_order_no: 'NV-2024010001',
    channel: 'naver',
    source_type: 'manual',
    status: 'delivered',
    ordered_at: '2024-05-01T10:30:00Z',
    created_at: '2024-05-01T10:30:00Z',
    order_items: [
      { id: 'oi-001', order_id: 'ord-001', product_id: 'prd-001', quantity: 2, selling_price: 17500, product: { id: 'prd-001', name: '육각렌치 세트 9PCS', sku: '100-0016', internal_code: 'INT-001' } },
    ],
  },
  {
    id: 'ord-002',
    internal_order_no: 'ORD-2024-0002',
    market_order_no: 'CP-2024010002',
    channel: 'coupang',
    source_type: 'manual',
    status: 'settled',
    ordered_at: '2024-05-02T14:00:00Z',
    created_at: '2024-05-02T14:00:00Z',
    order_items: [
      { id: 'oi-002', order_id: 'ord-002', product_id: 'prd-003', quantity: 3, selling_price: 15900, product: { id: 'prd-003', name: '멀티탭 6구 3M', sku: '200-1101', internal_code: 'INT-003' } },
    ],
  },
  {
    id: 'ord-003',
    internal_order_no: 'ORD-2024-0003',
    market_order_no: 'C24-2024010003',
    channel: 'cafe24',
    source_type: 'manual',
    status: 'shipping',
    ordered_at: '2024-05-10T09:15:00Z',
    created_at: '2024-05-10T09:15:00Z',
    order_items: [
      { id: 'oi-003', order_id: 'ord-003', product_id: 'prd-002', quantity: 1, selling_price: 32000, product: { id: 'prd-002', name: '드라이버 비트 세트 30PCS', sku: '100-0045', internal_code: 'INT-002' } },
      { id: 'oi-004', order_id: 'ord-003', product_id: 'prd-009', quantity: 2, selling_price: 35000, product: { id: 'prd-009', name: 'LED 투광등 50W', sku: '500-0021', internal_code: 'INT-009' } },
    ],
  },
  {
    id: 'ord-004',
    internal_order_no: 'ORD-2024-0004',
    market_order_no: 'GM-2024010004',
    channel: 'gmarket',
    source_type: 'manual',
    status: 'received',
    ordered_at: '2024-05-12T16:20:00Z',
    created_at: '2024-05-12T16:20:00Z',
    order_items: [
      { id: 'oi-005', order_id: 'ord-004', product_id: 'prd-006', quantity: 5, selling_price: 28000, product: { id: 'prd-006', name: '산업용 마스크 KF94 50매', sku: '300-0099', internal_code: 'INT-006' } },
    ],
  },
  {
    id: 'ord-005',
    internal_order_no: 'ORD-2024-0005',
    market_order_no: null,
    channel: 'cafe24',
    source_type: 'manual',
    status: 'ordered',
    ordered_at: '2024-05-15T11:00:00Z',
    created_at: '2024-05-15T11:00:00Z',
    order_items: [
      { id: 'oi-006', order_id: 'ord-005', product_id: 'prd-010', quantity: 1, selling_price: 138000, product: { id: 'prd-010', name: '디지털 멀티미터', sku: '500-0055', internal_code: 'INT-010' } },
    ],
  },
  {
    id: 'ord-006',
    internal_order_no: 'ORD-2024-0006',
    market_order_no: 'NV-2024010006',
    channel: 'naver',
    source_type: 'manual',
    status: 'cancelled',
    ordered_at: '2024-05-16T13:45:00Z',
    created_at: '2024-05-16T13:45:00Z',
    order_items: [
      { id: 'oi-007', order_id: 'ord-006', product_id: 'prd-011', quantity: 2, selling_price: 29000, product: { id: 'prd-011', name: '스패너 세트 8PCS', sku: '100-0120', internal_code: 'INT-011' } },
    ],
  },
  {
    id: 'ord-007',
    internal_order_no: 'ORD-2024-0007',
    market_order_no: 'CP-2024010007',
    channel: 'coupang',
    source_type: 'manual',
    status: 'received',
    ordered_at: '2024-05-18T08:30:00Z',
    created_at: '2024-05-18T08:30:00Z',
    order_items: [
      { id: 'oi-008', order_id: 'ord-007', product_id: 'prd-004', quantity: 1, selling_price: 72000, product: { id: 'prd-004', name: '절연 장갑 (10KV)', sku: '200-1205', internal_code: 'INT-004' } },
      { id: 'oi-009', order_id: 'ord-007', product_id: 'prd-001', quantity: 4, selling_price: 17900, product: { id: 'prd-001', name: '육각렌치 세트 9PCS', sku: '100-0016', internal_code: 'INT-001' } },
    ],
  },
  {
    id: 'ord-008',
    internal_order_no: 'ORD-2024-0008',
    market_order_no: 'NV-2024010008',
    channel: 'naver',
    source_type: 'manual',
    status: 'returned',
    ordered_at: '2024-05-20T10:00:00Z',
    created_at: '2024-05-20T10:00:00Z',
    order_items: [
      { id: 'oi-010', order_id: 'ord-008', product_id: 'prd-007', quantity: 1, selling_price: 145000, product: { id: 'prd-007', name: '토크 렌치 1/2인치', sku: '400-0033', internal_code: 'INT-007' } },
    ],
  },
]

export function getDummyOrders(): Order[] {
  return ORDERS
}

export function getDummyOrder(id: string): Order | undefined {
  return ORDERS.find((o) => o.id === id)
}

// ─── 발주 ────────────────────────────────────────────────────────────────

const PURCHASES: Purchase[] = [
  {
    id: 'pur-001',
    supplier_id: 'sup-001',
    trigger_type: 'manual',
    status: 'received',
    total_amount: 95000,
    ordered_at: '2024-04-28T09:00:00Z',
    deleted_at: null,
    created_at: '2024-04-28T09:00:00Z',
    supplier: { id: 'sup-001', name: '한국공구산업(주)' },
    purchase_items: [
      { id: 'pi-001', purchase_id: 'pur-001', product_id: 'prd-001', quantity: 10, purchase_price: 9500, product: { id: 'prd-001', name: '육각렌치 세트 9PCS', sku: '100-0016', internal_code: 'INT-001' } },
    ],
  },
  {
    id: 'pur-002',
    supplier_id: 'sup-002',
    trigger_type: 'manual',
    status: 'ordered',
    total_amount: 144000,
    ordered_at: '2024-05-10T10:00:00Z',
    deleted_at: null,
    created_at: '2024-05-10T10:00:00Z',
    supplier: { id: 'sup-002', name: '대한전기자재(주)' },
    purchase_items: [
      { id: 'pi-002', purchase_id: 'pur-002', product_id: 'prd-003', quantity: 20, purchase_price: 7200, product: { id: 'prd-003', name: '멀티탭 6구 3M', sku: '200-1101', internal_code: 'INT-003' } },
    ],
  },
  {
    id: 'pur-003',
    supplier_id: 'sup-005',
    trigger_type: 'manual',
    status: 'pending',
    total_amount: 185000,
    ordered_at: '2024-05-18T14:00:00Z',
    deleted_at: null,
    created_at: '2024-05-18T14:00:00Z',
    supplier: { id: 'sup-005', name: '태양전기상사' },
    purchase_items: [
      { id: 'pi-003', purchase_id: 'pur-003', product_id: 'prd-009', quantity: 10, purchase_price: 18500, product: { id: 'prd-009', name: 'LED 투광등 50W', sku: '500-0021', internal_code: 'INT-009' } },
    ],
  },
  {
    id: 'pur-004',
    supplier_id: 'sup-001',
    trigger_type: 'manual',
    status: 'shipping',
    total_amount: 261000,
    ordered_at: '2024-05-20T09:00:00Z',
    deleted_at: null,
    created_at: '2024-05-20T09:00:00Z',
    supplier: { id: 'sup-001', name: '한국공구산업(주)' },
    purchase_items: [
      { id: 'pi-004', purchase_id: 'pur-004', product_id: 'prd-002', quantity: 10, purchase_price: 18000, product: { id: 'prd-002', name: '드라이버 비트 세트 30PCS', sku: '100-0045', internal_code: 'INT-002' } },
      { id: 'pi-005', purchase_id: 'pur-004', product_id: 'prd-011', quantity: 7, purchase_price: 14500, product: { id: 'prd-011', name: '스패너 세트 8PCS', sku: '100-0120', internal_code: 'INT-011' } },
    ],
  },
]

export function getDummyPurchases(): Purchase[] {
  return PURCHASES
}

export function getDummyPurchase(id: string): Purchase | undefined {
  return PURCHASES.find((p) => p.id === id)
}

// ─── 일정 ────────────────────────────────────────────────────────────────

const SCHEDULES: Schedule[] = [
  {
    id: 'sch-001',
    type: 'supplier',
    title: '한국공구산업 납품 일정 협의',
    description: '6월 납품 물량 및 단가 협의',
    assigned_user_id: null,
    scheduled_at: '2026-05-28',
    notify_days_before: [3, 1],
    is_completed: false,
    created_at: '2026-05-20T09:00:00Z',
  },
  {
    id: 'sch-002',
    type: 'market',
    title: '쿠팡 로켓배송 입점 신청 마감',
    description: '상품 데이터 제출 포함',
    assigned_user_id: null,
    scheduled_at: '2026-05-30',
    notify_days_before: [7, 3],
    is_completed: false,
    created_at: '2026-05-15T09:00:00Z',
  },
  {
    id: 'sch-003',
    type: 'internal',
    title: '월말 재고 실사',
    description: '창고 전체 재고 수량 확인',
    assigned_user_id: null,
    scheduled_at: '2026-05-31',
    notify_days_before: [3],
    is_completed: false,
    created_at: '2026-05-01T09:00:00Z',
  },
  {
    id: 'sch-004',
    type: 'market',
    title: '네이버 스토어 판매자 정산일',
    description: '5월 1~15일 매출 정산',
    assigned_user_id: null,
    scheduled_at: '2026-06-05',
    notify_days_before: [3, 1],
    is_completed: false,
    created_at: '2026-05-20T09:00:00Z',
  },
  {
    id: 'sch-005',
    type: 'supplier',
    title: '대한전기자재 신규 상품 카탈로그 수령',
    description: '2026년 하반기 신제품 목록',
    assigned_user_id: null,
    scheduled_at: '2026-06-10',
    notify_days_before: [1],
    is_completed: false,
    created_at: '2026-05-22T09:00:00Z',
  },
  {
    id: 'sch-006',
    type: 'internal',
    title: '6월 발주 계획 수립',
    description: '재고 소진 예측 기반 발주량 산정',
    assigned_user_id: null,
    scheduled_at: '2026-06-15',
    notify_days_before: [7],
    is_completed: false,
    created_at: '2026-05-20T09:00:00Z',
  },
  {
    id: 'sch-007',
    type: 'market',
    title: '지마켓/옥션 하계 특가 행사 신청',
    description: '7월 행사 기획전 사전 신청',
    assigned_user_id: null,
    scheduled_at: '2026-06-20',
    notify_days_before: [7, 3],
    is_completed: false,
    created_at: '2026-05-20T09:00:00Z',
  },
  {
    id: 'sch-008',
    type: 'supplier',
    title: '(주)신일산업 자동 롤러 재고 보충 확인',
    description: '품절 상품 입고 예정일 확인',
    assigned_user_id: null,
    scheduled_at: '2026-05-26',
    notify_days_before: [1],
    is_completed: false,
    created_at: '2026-05-23T09:00:00Z',
  },
]

export function getDummySchedules(): Schedule[] {
  return SCHEDULES
}

// ─── 정산 ────────────────────────────────────────────────────────────────

const SETTLEMENTS: Settlement[] = [
  {
    id: 'set-001',
    market_name: 'cafe24',
    settlement_cycle: 'monthly',
    expected_date: '2026-06-05',
    expected_amount: 1250000,
    actual_amount: null,
    status: 'pending',
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'set-002',
    market_name: 'naver',
    settlement_cycle: 'biweekly',
    expected_date: '2026-06-05',
    expected_amount: 890000,
    actual_amount: null,
    status: 'pending',
    created_at: '2026-05-16T00:00:00Z',
  },
  {
    id: 'set-003',
    market_name: 'coupang',
    settlement_cycle: 'weekly',
    expected_date: '2026-05-28',
    expected_amount: 2340000,
    actual_amount: null,
    status: 'pending',
    created_at: '2026-05-21T00:00:00Z',
  },
  {
    id: 'set-004',
    market_name: 'gmarket',
    settlement_cycle: 'monthly',
    expected_date: '2026-05-20',
    expected_amount: 650000,
    actual_amount: 640000,
    status: 'completed',
    created_at: '2026-04-30T00:00:00Z',
  },
  {
    id: 'set-005',
    market_name: 'auction',
    settlement_cycle: 'monthly',
    expected_date: '2026-05-20',
    expected_amount: 420000,
    actual_amount: null,
    status: 'overdue',
    created_at: '2026-04-30T00:00:00Z',
  },
  {
    id: 'set-006',
    market_name: 'lotteon',
    settlement_cycle: 'biweekly',
    expected_date: '2026-05-25',
    expected_amount: 310000,
    actual_amount: 310000,
    status: 'completed',
    created_at: '2026-05-11T00:00:00Z',
  },
  {
    id: 'set-007',
    market_name: '11st',
    settlement_cycle: 'monthly',
    expected_date: '2026-06-10',
    expected_amount: 560000,
    actual_amount: null,
    status: 'pending',
    created_at: '2026-05-01T00:00:00Z',
  },
]

export function getDummySettlements(): Settlement[] {
  return SETTLEMENTS
}

// ─── 가격 이력 ────────────────────────────────────────────────────────────

const PRICE_HISTORIES: PriceHistory[] = [
  { id: 'ph-001', product_id: 'prd-001', previous_price: 8500,  new_price: 9500,  changed_at: '2024-03-01T09:00:00Z' },
  { id: 'ph-002', product_id: 'prd-002', previous_price: 16000, new_price: 18000, changed_at: '2024-04-01T09:00:00Z' },
  { id: 'ph-003', product_id: 'prd-010', previous_price: 82000, new_price: 88000, changed_at: '2024-04-15T09:00:00Z' },
]

export function getDummyPriceHistory(productId: string): PriceHistory[] {
  return PRICE_HISTORIES.filter((ph) => ph.product_id === productId)
}

// ─── 수익 분석 ────────────────────────────────────────────────────────────

export function getDummyMarginSummary(): MarginSummary[] {
  return [
    { channel: 'cafe24',  selling_price: 1250000, purchase_price: 612500, fee_rate: 2.5,  fee_amount: 31250,  margin_amount: 606250,  margin_rate: 48.5 },
    { channel: 'naver',   selling_price: 890000,  purchase_price: 445000, fee_rate: 4.5,  fee_amount: 40050,  margin_amount: 404950,  margin_rate: 45.5 },
    { channel: 'coupang', selling_price: 2340000, purchase_price: 1287000, fee_rate: 10.8, fee_amount: 252720, margin_amount: 800280,  margin_rate: 34.2 },
    { channel: 'gmarket', selling_price: 650000,  purchase_price: 325000, fee_rate: 9.0,  fee_amount: 58500,  margin_amount: 266500,  margin_rate: 41.0 },
    { channel: 'lotteon', selling_price: 310000,  purchase_price: 155000, fee_rate: 7.0,  fee_amount: 21700,  margin_amount: 133300,  margin_rate: 43.0 },
    { channel: '11st',    selling_price: 560000,  purchase_price: 280000, fee_rate: 8.5,  fee_amount: 47600,  margin_amount: 232400,  margin_rate: 41.5 },
  ]
}

export function getDummyPeriodStats(): PeriodStats[] {
  return [
    { period: '2026-01', total_revenue: 4850000, total_purchase: 2425000, total_profit: 2425000, order_count: 38 },
    { period: '2026-02', total_revenue: 5120000, total_purchase: 2560000, total_profit: 2560000, order_count: 44 },
    { period: '2026-03', total_revenue: 6340000, total_purchase: 3170000, total_profit: 3170000, order_count: 52 },
    { period: '2026-04', total_revenue: 5890000, total_purchase: 2945000, total_profit: 2945000, order_count: 47 },
    { period: '2026-05', total_revenue: 6010000, total_purchase: 3005000, total_profit: 3005000, order_count: 50 },
  ]
}

// ─── 사용자 ────────────────────────────────────────────────────────────────

const USERS: User[] = [
  {
    id: 'usr-001',
    email: 'admin@daitem.co.kr',
    role: 'admin',
    notification_settings: { email: true, browser_push: true, kakao: false },
    created_at: '2024-01-01T09:00:00Z',
  },
  {
    id: 'usr-002',
    email: 'operator1@daitem.co.kr',
    role: 'operator',
    notification_settings: { email: true, browser_push: false, kakao: false },
    created_at: '2024-02-10T09:00:00Z',
  },
  {
    id: 'usr-003',
    email: 'operator2@daitem.co.kr',
    role: 'operator',
    notification_settings: null,
    created_at: '2024-03-15T09:00:00Z',
  },
  {
    id: 'usr-004',
    email: 'viewer@daitem.co.kr',
    role: 'viewer',
    notification_settings: null,
    created_at: '2024-04-01T09:00:00Z',
  },
]

export function getDummyUsers(): User[] {
  return USERS
}

// ─── 대시보드 요약 ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number
  revenueChange: number
  totalOrders: number
  ordersChange: number
  lowStockCount: number
  pendingSettlement: number
  upcomingSchedules: number
}

export function getDummyDashboardStats(): DashboardStats {
  return {
    totalRevenue: 6010000,
    revenueChange: 2.0,
    totalOrders: 50,
    ordersChange: 6.4,
    lowStockCount: 3,
    pendingSettlement: 5240000,
    upcomingSchedules: 3,
  }
}
