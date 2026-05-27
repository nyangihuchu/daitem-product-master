import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product, MarketListing, ProductStatus } from '@/lib/types'

interface GetProductsParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  status?: string
  supplierId?: string
}

interface ProductInput {
  supplier_id?: string | null
  sku: string
  supplier_item_no?: string | null
  internal_code: string
  name: string
  brand?: string | null
  model_name?: string | null
  category_large?: string | null
  category_medium?: string | null
  category_small?: string | null
  spec?: string | null
  unit?: string | null
  origin?: string | null
  image_url?: string | null
  price_list_image_url?: string | null
  standard_price?: number | null
  base_selling_price?: number | null
  purchase_price?: number
  shipping_fee?: number | null
  lead_time_desc?: string | null
  is_returnable?: boolean
  status?: ProductStatus
  stock_quantity?: number
  min_stock_quantity?: number
  cafe24_product_id?: string | null
}

export async function getProducts({
  page = 1,
  pageSize = 20,
  search,
  category,
  status,
  supplierId,
}: GetProductsParams = {}): Promise<{ data: Product[], total: number }> {
  const supabase = await createClient()

  const buildBaseQuery = (select: string, opts?: { count?: 'exact', head?: boolean }) =>
    supabase.from('products').select(select, opts).is('deleted_at', null)

  let countQuery = buildBaseQuery('id', { count: 'exact', head: true })
  if (search) countQuery = countQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%,internal_code.ilike.%${search}%`)
  if (category && category !== 'all') countQuery = countQuery.eq('category_large', category)
  if (status && status !== 'all') countQuery = countQuery.eq('status', status as ProductStatus)
  if (supplierId && supplierId !== 'all') countQuery = countQuery.eq('supplier_id', supplierId)
  const { count } = await countQuery

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let dataQuery = buildBaseQuery('*, suppliers(id, name)')
    .order('created_at', { ascending: false })
    .range(from, to)
  if (search) dataQuery = dataQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%,internal_code.ilike.%${search}%`)
  if (category && category !== 'all') dataQuery = dataQuery.eq('category_large', category)
  if (status && status !== 'all') dataQuery = dataQuery.eq('status', status as ProductStatus)
  if (supplierId && supplierId !== 'all') dataQuery = dataQuery.eq('supplier_id', supplierId)

  const { data, error } = await dataQuery
  if (error) throw new Error(error.message)

  const products = (data ?? []) as unknown as Product[]

  if (products.length > 0) {
    const ids = products.map((p) => p.id)
    const { data: listingsData } = await supabase
      .from('market_listings')
      .select('product_id, market_name')
      .in('product_id', ids)

    const listingMap: Record<string, { market_name: string }[]> = {}
    for (const l of listingsData ?? []) {
      if (!listingMap[l.product_id]) listingMap[l.product_id] = []
      listingMap[l.product_id].push({ market_name: l.market_name })
    }
    for (const p of products) {
      p.market_listings = (listingMap[p.id] ?? []) as unknown as MarketListing[]
    }
  }

  return { data: products, total: count ?? 0 }
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('category_large')
    .is('deleted_at', null)
    .not('category_large', 'is', null)
    .order('category_large')

  if (error) throw new Error(error.message)

  const seen = new Set<string>()
  const result: string[] = []
  for (const row of data ?? []) {
    if (row.category_large && !seen.has(row.category_large)) {
      seen.add(row.category_large)
      result.push(row.category_large)
    }
  }
  return result
}

export async function getProduct(id: string): Promise<Product> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(id, name)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Product
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .insert({
      sku: input.sku,
      internal_code: input.internal_code,
      name: input.name,
      purchase_price: input.purchase_price ?? 0,
      status: input.status ?? 'pending',
      stock_quantity: input.stock_quantity ?? 0,
      min_stock_quantity: input.min_stock_quantity ?? 0,
      is_returnable: input.is_returnable ?? false,
      supplier_id: input.supplier_id ?? null,
      supplier_item_no: input.supplier_item_no ?? null,
      brand: input.brand ?? null,
      model_name: input.model_name ?? null,
      category_large: input.category_large ?? null,
      category_medium: input.category_medium ?? null,
      category_small: input.category_small ?? null,
      spec: input.spec ?? null,
      unit: input.unit ?? null,
      origin: input.origin ?? null,
      image_url: input.image_url ?? null,
      price_list_image_url: input.price_list_image_url ?? null,
      standard_price: input.standard_price ?? null,
      base_selling_price: input.base_selling_price ?? null,
      shipping_fee: input.shipping_fee ?? null,
      lead_time_desc: input.lead_time_desc ?? null,
      cafe24_product_id: input.cafe24_product_id ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Product
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...(input.sku !== undefined && { sku: input.sku }),
      ...(input.internal_code !== undefined && { internal_code: input.internal_code }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.purchase_price !== undefined && { purchase_price: input.purchase_price }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.stock_quantity !== undefined && { stock_quantity: input.stock_quantity }),
      ...(input.min_stock_quantity !== undefined && { min_stock_quantity: input.min_stock_quantity }),
      ...(input.is_returnable !== undefined && { is_returnable: input.is_returnable }),
      ...(input.supplier_id !== undefined && { supplier_id: input.supplier_id }),
      ...(input.supplier_item_no !== undefined && { supplier_item_no: input.supplier_item_no }),
      ...(input.brand !== undefined && { brand: input.brand }),
      ...(input.model_name !== undefined && { model_name: input.model_name }),
      ...(input.category_large !== undefined && { category_large: input.category_large }),
      ...(input.category_medium !== undefined && { category_medium: input.category_medium }),
      ...(input.category_small !== undefined && { category_small: input.category_small }),
      ...(input.spec !== undefined && { spec: input.spec }),
      ...(input.unit !== undefined && { unit: input.unit }),
      ...(input.origin !== undefined && { origin: input.origin }),
      ...(input.image_url !== undefined && { image_url: input.image_url }),
      ...(input.price_list_image_url !== undefined && { price_list_image_url: input.price_list_image_url }),
      ...(input.standard_price !== undefined && { standard_price: input.standard_price }),
      ...(input.base_selling_price !== undefined && { base_selling_price: input.base_selling_price }),
      ...(input.shipping_fee !== undefined && { shipping_fee: input.shipping_fee }),
      ...(input.lead_time_desc !== undefined && { lead_time_desc: input.lead_time_desc }),
      ...(input.cafe24_product_id !== undefined && { cafe24_product_id: input.cafe24_product_id }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Product
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getAllProductsForExport(params: {
  search?: string
  category?: string
  status?: string
  supplierId?: string
} = {}): Promise<Product[]> {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('id, sku, internal_code, name, supplier_item_no, brand, model_name, category_large, category_medium, category_small, spec, unit, origin, standard_price, base_selling_price, purchase_price, shipping_fee, lead_time_desc, is_returnable, status, stock_quantity, min_stock_quantity')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200000)

  const { search, category, status, supplierId } = params
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,internal_code.ilike.%${search}%`)
  if (category && category !== 'all') query = query.eq('category_large', category)
  if (status && status !== 'all') query = query.eq('status', status as ProductStatus)
  if (supplierId && supplierId !== 'all') query = query.eq('supplier_id', supplierId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Product[]
}

export async function upsertProducts(rows: ProductInput[]): Promise<{ count: number }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .upsert(rows as never[], { onConflict: 'sku' })

  if (error) throw new Error(error.message)
  return { count: rows.length }
}

export async function getProductMarketListings(productId: string): Promise<MarketListing[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_listings')
    .select('*')
    .eq('product_id', productId)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as MarketListing[]
}
