import { createClient } from '@/lib/supabase/server'
import { getCurrentFees } from '@/lib/services/market-fee-service'
import type { MarginSummary, PeriodStats, MarketChannel } from '@/lib/types'

export interface ProductSalesSummary {
  name: string
  category: string
  brand: string
  qty: number
  revenue: number
  purchaseTotal: number
  marginRate: number
}

interface CalculateMarginParams {
  sellingPrice: number
  purchasePrice: number
  feeRate: number
  shippingFee?: number
  returnCost?: number
  adCost?: number
}

export interface CalculateMarginResult {
  feeAmount: number
  marginAmount: number
  marginRate: number
}

export function calculateMargin({
  sellingPrice,
  purchasePrice,
  feeRate,
  shippingFee,
  returnCost,
  adCost,
}: CalculateMarginParams): CalculateMarginResult {
  const feeAmount = Math.round(sellingPrice * (feeRate / 100))
  const marginAmount =
    sellingPrice -
    purchasePrice -
    feeAmount -
    (shippingFee ?? 0) -
    (returnCost ?? 0) -
    (adCost ?? 0)
  const marginRate = sellingPrice > 0 ? (marginAmount / sellingPrice) * 100 : 0
  return { feeAmount, marginAmount, marginRate }
}

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'

function getDateRangeStart(period: PeriodType): string {
  const d = new Date()
  if (period === 'annual') {
    d.setFullYear(d.getFullYear() - 5)
  } else if (period === 'quarterly') {
    d.setFullYear(d.getFullYear() - 2)
  } else if (period === 'monthly') {
    d.setMonth(d.getMonth() - 12)
  } else {
    d.setDate(d.getDate() - 90)
  }
  return d.toISOString()
}

function formatPeriodKey(orderedAt: string, period: PeriodType): string {
  const d = new Date(orderedAt)
  const year = d.getFullYear()
  if (period === 'daily') {
    return d.toISOString().slice(0, 10)
  }
  if (period === 'monthly') {
    return d.toISOString().slice(0, 7)
  }
  if (period === 'quarterly') {
    const quarter = Math.ceil((d.getMonth() + 1) / 3)
    return `${year}-Q${quarter}`
  }
  if (period === 'annual') {
    return `${year}`
  }
  const startOfYear = new Date(year, 0, 1)
  const weekNo = Math.ceil(
    ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  )
  return `${year}-W${String(weekNo).padStart(2, '0')}`
}

type OrderItemRow = {
  product_id: string
  quantity: number
  selling_price: number
  products: { purchase_price: number; name: string; brand: string | null; category_medium: string | null } | null
}

type OrderRow = {
  channel: string
  ordered_at: string
  order_items: OrderItemRow[]
}

export async function getChannelMarginSummary(): Promise<MarginSummary[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('channel, order_items(product_id, quantity, selling_price, products(purchase_price))')
    .not('status', 'in', '(cancelled,returned)')
    .gte('ordered_at', getDateRangeStart('daily'))

  if (error) throw new Error(error.message)

  const fees = await getCurrentFees()
  const feeMap = new Map(fees.map((f) => [f.market_name as MarketChannel, f.fee_rate]))

  type ChannelAgg = { sellingTotal: number; purchaseTotal: number }
  const channelMap = new Map<MarketChannel, ChannelAgg>()

  for (const order of (data ?? []) as unknown as OrderRow[]) {
    const channel = order.channel as MarketChannel
    if (!channelMap.has(channel)) {
      channelMap.set(channel, { sellingTotal: 0, purchaseTotal: 0 })
    }
    const agg = channelMap.get(channel)!
    for (const item of order.order_items ?? []) {
      const revenue = item.quantity * item.selling_price
      const purchaseCost = item.quantity * (item.products?.purchase_price ?? 0)
      agg.sellingTotal += revenue
      agg.purchaseTotal += purchaseCost
    }
  }

  return Array.from(channelMap.entries())
    .sort(([, a], [, b]) => b.sellingTotal - a.sellingTotal)
    .map(([channel, agg]) => {
      const feeRate = feeMap.get(channel) ?? 0
      const { feeAmount, marginAmount, marginRate } = calculateMargin({
        sellingPrice: agg.sellingTotal,
        purchasePrice: agg.purchaseTotal,
        feeRate,
      })
      return {
        channel,
        selling_price: agg.sellingTotal,
        purchase_price: agg.purchaseTotal,
        fee_rate: feeRate,
        fee_amount: feeAmount,
        margin_amount: marginAmount,
        margin_rate: Math.round(marginRate * 10) / 10,
      }
    })
}

export async function getPeriodStats(
  period: PeriodType = 'monthly',
): Promise<PeriodStats[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('ordered_at, order_items(quantity, selling_price, products(purchase_price))')
    .not('status', 'in', '(cancelled,returned)')
    .gte('ordered_at', getDateRangeStart(period))
    .order('ordered_at', { ascending: true })

  if (error) throw new Error(error.message)

  type PeriodAgg = {
    total_revenue: number
    total_purchase: number
    order_count: number
  }
  const periodMap = new Map<string, PeriodAgg>()

  for (const order of (data ?? []) as unknown as OrderRow[]) {
    const key = formatPeriodKey(order.ordered_at, period)
    if (!periodMap.has(key)) {
      periodMap.set(key, { total_revenue: 0, total_purchase: 0, order_count: 0 })
    }
    const agg = periodMap.get(key)!
    agg.order_count += 1
    for (const item of order.order_items ?? []) {
      agg.total_revenue += item.quantity * item.selling_price
      agg.total_purchase += item.quantity * (item.products?.purchase_price ?? 0)
    }
  }

  return Array.from(periodMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, agg]) => ({
      period: p,
      total_revenue: agg.total_revenue,
      total_purchase: agg.total_purchase,
      total_profit: agg.total_revenue - agg.total_purchase,
      order_count: agg.order_count,
    }))
}

export async function getTopProductSales(limit = 10): Promise<ProductSalesSummary[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(
      'order_items(product_id, quantity, selling_price, products(name, brand, category_medium, purchase_price))',
    )
    .not('status', 'in', '(cancelled,returned)')
    .gte('ordered_at', getDateRangeStart('daily'))

  if (error) throw new Error(error.message)

  type ProductAgg = {
    name: string
    category: string
    brand: string
    qty: number
    revenue: number
    purchaseTotal: number
  }
  const productMap = new Map<string, ProductAgg>()

  for (const order of (data ?? []) as unknown as Pick<OrderRow, 'order_items'>[]) {
    for (const item of order.order_items ?? []) {
      if (!item.product_id || !item.products) continue
      const revenue = item.quantity * item.selling_price
      const purchaseCost = item.quantity * (item.products.purchase_price ?? 0)
      const existing = productMap.get(item.product_id)
      if (existing) {
        existing.qty += item.quantity
        existing.revenue += revenue
        existing.purchaseTotal += purchaseCost
      } else {
        productMap.set(item.product_id, {
          name: item.products.name,
          category: item.products.category_medium ?? '-',
          brand: item.products.brand ?? '-',
          qty: item.quantity,
          revenue,
          purchaseTotal: purchaseCost,
        })
      }
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((s) => ({
      ...s,
      marginRate: s.revenue > 0 ? ((s.revenue - s.purchaseTotal) / s.revenue) * 100 : 0,
    }))
}
