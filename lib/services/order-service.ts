import { createClient } from '@/lib/supabase/server'
import type { Order, OrderStatus, MarketChannel } from '@/lib/types'

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received:  ['ordered', 'cancelled'],
  ordered:   ['shipping', 'cancelled'],
  shipping:  ['delivered', 'cancelled'],
  delivered: ['settled', 'returned'],
  settled:   [],
  cancelled: [],
  returned:  [],
}

function generateInternalOrderNo(): string {
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `ORD-${date}-${suffix}`
}

interface GetOrdersParams {
  search?: string
  channel?: string
  status?: string
  page?: number
  limit?: number
}

interface OrderItemInput {
  product_id: string
  quantity: number
  selling_price: number
}

interface CreateOrderInput {
  channel: MarketChannel
  market_order_no?: string | null
  ordered_at?: string
  items: OrderItemInput[]
}

export async function getOrders({
  search,
  channel,
  status,
  page = 1,
  limit = 50,
}: GetOrdersParams = {}): Promise<Order[]> {
  const supabase = await createClient()

  const offset = (page - 1) * limit

  let query = supabase
    .from('orders')
    .select('*, order_items(*, product:products(id, name, sku, internal_code))')
    .order('ordered_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (channel && channel !== 'all') {
    query = query.eq('channel', channel as MarketChannel)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status as OrderStatus)
  }

  if (search) {
    query = query.or(
      `internal_order_no.ilike.%${search}%,market_order_no.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []) as Order[]
}

export async function getOrder(id: string): Promise<Order> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(id, name, sku, internal_code))')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Order
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = await createClient()

  let order: Order | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    const internalOrderNo = generateInternalOrderNo()

    const { data, error } = await supabase
      .from('orders')
      .insert({
        internal_order_no: internalOrderNo,
        market_order_no: input.market_order_no ?? null,
        channel: input.channel,
        source_type: 'manual',
        status: 'received',
        ordered_at: input.ordered_at ?? new Date().toISOString(),
      })
      .select()
      .single()

    if (!error) {
      order = data as Order
      break
    }

    // 23505 = unique_violation (PostgreSQL)
    if (error.code !== '23505') {
      throw new Error(error.message)
    }
  }

  if (!order) throw new Error('내부주문번호 생성에 실패했습니다')

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .insert(
      input.items.map((item) => ({
        order_id: order!.id,
        product_id: item.product_id,
        quantity: item.quantity,
        selling_price: item.selling_price,
      }))
    )
    .select('*, product:products(id, name, sku, internal_code)')

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message)
  }

  return { ...order, order_items: items ?? [] } as Order
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus
): Promise<Order> {
  const order = await getOrder(id)
  const allowed = ALLOWED_TRANSITIONS[order.status]

  if (!allowed.includes(newStatus)) {
    throw new Error(
      `'${order.status}' 상태에서 '${newStatus}'로 전이할 수 없습니다`
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Order
}

export async function updateOrderMarketNo(
  id: string,
  marketOrderNo: string
): Promise<Order> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ market_order_no: marketOrderNo })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Order
}
