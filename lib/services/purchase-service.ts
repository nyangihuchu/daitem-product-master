import { createClient } from '@/lib/supabase/server'
import type { Purchase, PurchaseStatus } from '@/lib/types'

const ALLOWED_TRANSITIONS: Record<PurchaseStatus, PurchaseStatus[]> = {
  pending:  ['ordered'],
  ordered:  ['shipping'],
  shipping: ['received'],
  received: [],
}

interface GetPurchasesParams {
  status?: string
  supplierId?: string
  page?: number
  limit?: number
}

interface PurchaseItemInput {
  product_id: string
  quantity: number
  purchase_price: number
}

interface CreatePurchaseInput {
  supplier_id: string
  items: PurchaseItemInput[]
}

export async function getPurchases({
  status,
  supplierId,
  page = 1,
  limit = 50,
}: GetPurchasesParams = {}): Promise<Purchase[]> {
  const supabase = await createClient()

  const offset = (page - 1) * limit

  let query = supabase
    .from('purchases')
    .select('*, supplier:suppliers(id, name), purchase_items(*, product:products(id, name, sku, internal_code))')
    .is('deleted_at', null)
    .order('ordered_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status as PurchaseStatus)
  }

  if (supplierId) {
    query = query.eq('supplier_id', supplierId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []) as Purchase[]
}

export async function getPurchase(id: string): Promise<Purchase> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .select('*, supplier:suppliers(id, name), purchase_items(*, product:products(id, name, sku, internal_code))')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Purchase
}

export async function createPurchase(input: CreatePurchaseInput): Promise<Purchase> {
  const supabase = await createClient()

  const total_amount = input.items.reduce(
    (sum, item) => sum + item.quantity * item.purchase_price,
    0
  )

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      supplier_id: input.supplier_id,
      trigger_type: 'manual',
      status: 'pending',
      total_amount,
      ordered_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (purchaseError) throw new Error(purchaseError.message)

  const { data: items, error: itemsError } = await supabase
    .from('purchase_items')
    .insert(
      input.items.map((item) => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        purchase_price: item.purchase_price,
      }))
    )
    .select('*, product:products(id, name, sku, internal_code)')

  if (itemsError) {
    await supabase.from('purchases').delete().eq('id', purchase.id)
    throw new Error(itemsError.message)
  }

  return { ...purchase, purchase_items: items ?? [] } as Purchase
}

export async function updatePurchaseStatus(
  id: string,
  newStatus: PurchaseStatus
): Promise<Purchase> {
  const current = await getPurchase(id)
  const allowed = ALLOWED_TRANSITIONS[current.status]

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `'${current.status}' 상태에서 '${newStatus}'로 전이할 수 없습니다`
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('purchases')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Purchase
}

export async function softDeletePurchase(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('purchases')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
