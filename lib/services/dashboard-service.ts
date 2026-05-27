import { createClient } from '@/lib/supabase/server'
import { MARKET_CHANNELS } from '@/lib/constants'
import type { Product, Schedule, MarketChannel } from '@/lib/types'

export interface DashboardKPI {
  monthlyRevenue: number
  revenueChange: number
  monthlyOrders: number
  ordersChange: number
  pendingPurchases: number
  pendingSettlement: number
}

export interface ChannelSaleData {
  name: string
  value: number
  color: string
}

const CHANNEL_COLORS: Record<MarketChannel, string> = {
  cafe24: '#6366f1',
  naver: '#22c55e',
  coupang: '#f97316',
  gmarket: '#eab308',
  auction: '#ec4899',
  lotteon: '#ef4444',
  '11st': '#14b8a6',
}

function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString()
  const end = new Date(Date.UTC(year, month, 1)).toISOString()
  return { start, end }
}

function sumOrderItems(
  orders: { order_items: { quantity: number; selling_price: number }[] }[],
): { revenue: number; count: number } {
  let revenue = 0
  let count = 0
  for (const order of orders) {
    count += 1
    for (const item of order.order_items ?? []) {
      revenue += item.quantity * item.selling_price
    }
  }
  return { revenue, count }
}

function diffDays(scheduledAt: string): number {
  const target = new Date(scheduledAt)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export async function getDashboardKPI(): Promise<DashboardKPI> {
  const supabase = await createClient()

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1
  const lastYear = thisMonth === 1 ? thisYear - 1 : thisYear
  const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1

  const thisRange = getMonthRange(thisYear, thisMonth)
  const lastRange = getMonthRange(lastYear, lastMonth)

  const [thisMonthRes, lastMonthRes, pendingRes, deliveredRes] = await Promise.all([
    supabase
      .from('orders')
      .select('order_items(quantity, selling_price)')
      .not('status', 'in', '(cancelled,returned)')
      .gte('ordered_at', thisRange.start)
      .lt('ordered_at', thisRange.end),
    supabase
      .from('orders')
      .select('order_items(quantity, selling_price)')
      .not('status', 'in', '(cancelled,returned)')
      .gte('ordered_at', lastRange.start)
      .lt('ordered_at', lastRange.end),
    supabase
      .from('purchases')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null),
    supabase
      .from('orders')
      .select('order_items(quantity, selling_price)')
      .eq('status', 'delivered'),
  ])

  if (thisMonthRes.error) throw new Error(thisMonthRes.error.message)
  if (lastMonthRes.error) throw new Error(lastMonthRes.error.message)
  if (pendingRes.error) throw new Error(pendingRes.error.message)
  if (deliveredRes.error) throw new Error(deliveredRes.error.message)

  type OrderRow = { order_items: { quantity: number; selling_price: number }[] }

  const thisData = sumOrderItems(thisMonthRes.data as unknown as OrderRow[])
  const lastData = sumOrderItems(lastMonthRes.data as unknown as OrderRow[])
  const deliveredData = sumOrderItems(deliveredRes.data as unknown as OrderRow[])

  const revenueChange =
    lastData.revenue > 0
      ? Math.round(((thisData.revenue - lastData.revenue) / lastData.revenue) * 1000) / 10
      : 0

  const ordersChange =
    lastData.count > 0
      ? Math.round(((thisData.count - lastData.count) / lastData.count) * 1000) / 10
      : 0

  return {
    monthlyRevenue: thisData.revenue,
    revenueChange,
    monthlyOrders: thisData.count,
    ordersChange,
    pendingPurchases: pendingRes.count ?? 0,
    pendingSettlement: deliveredData.revenue,
  }
}

export async function getChannelSales(): Promise<ChannelSaleData[]> {
  const supabase = await createClient()

  const now = new Date()
  const { start, end } = getMonthRange(now.getFullYear(), now.getMonth() + 1)

  const { data, error } = await supabase
    .from('orders')
    .select('channel, order_items(quantity, selling_price)')
    .not('status', 'in', '(cancelled,returned)')
    .gte('ordered_at', start)
    .lt('ordered_at', end)

  if (error) throw new Error(error.message)

  type OrderRow = { channel: string; order_items: { quantity: number; selling_price: number }[] }
  const channelMap = new Map<MarketChannel, number>()

  for (const order of (data ?? []) as unknown as OrderRow[]) {
    const ch = order.channel as MarketChannel
    let total = channelMap.get(ch) ?? 0
    for (const item of order.order_items ?? []) {
      total += item.quantity * item.selling_price
    }
    channelMap.set(ch, total)
  }

  return Array.from(channelMap.entries())
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([ch, value]) => ({
      name: MARKET_CHANNELS.find((c) => c.value === ch)?.label ?? ch,
      value,
      color: CHANNEL_COLORS[ch] ?? '#94a3b8',
    }))
}

export async function getLowStockProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(id, name)')
    .neq('status', 'discontinued')
    .is('deleted_at', null)
    .limit(50)

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as Product[]).filter(
    (p) => p.stock_quantity < p.min_stock_quantity,
  )
}

export async function getUpcomingSchedules(): Promise<(Schedule & { dday: number })[]> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)
  sevenDaysLater.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('is_completed', false)
    .gte('scheduled_at', today.toISOString())
    .lte('scheduled_at', sevenDaysLater.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as Schedule[]).map((s) => ({
    ...s,
    dday: diffDays(s.scheduled_at),
  }))
}
