import { createClient } from '@/lib/supabase/server'
import type { Settlement, SettlementStatus, MarketChannel } from '@/lib/types'

const VALID_CHANNELS: MarketChannel[] = ['cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st']
const VALID_CYCLES = ['weekly', 'biweekly', 'monthly'] as const

interface GetSettlementsParams {
  status?: string
  market?: string
  page?: number
  limit?: number
}

interface CreateSettlementInput {
  market_name: MarketChannel
  settlement_cycle: 'weekly' | 'biweekly' | 'monthly'
  expected_date: string
  expected_amount: number
}

interface UpdateSettlementInput {
  status?: SettlementStatus
  actual_amount?: number | null
}

export interface SettlementSummary {
  pendingTotal: number
  overdueTotal: number
  completedCount: number
}

export async function getSettlements({
  status,
  market,
  page = 1,
  limit = 50,
}: GetSettlementsParams = {}): Promise<Settlement[]> {
  const supabase = await createClient()
  const offset = (page - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('settlements')
    .select('*')
    .is('deleted_at', null)
    .order('expected_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (market) query = query.eq('market_name', market)

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []) as Settlement[]
}

export async function createSettlement(input: CreateSettlementInput): Promise<Settlement> {
  if (!(VALID_CHANNELS as string[]).includes(input.market_name)) {
    throw new Error('유효하지 않은 마켓 채널입니다')
  }
  if (!(VALID_CYCLES as readonly string[]).includes(input.settlement_cycle)) {
    throw new Error('유효하지 않은 정산 주기입니다')
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('settlements')
    .insert({
      market_name: input.market_name,
      settlement_cycle: input.settlement_cycle,
      expected_date: input.expected_date,
      expected_amount: input.expected_amount,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Settlement
}

export async function updateSettlement(
  id: string,
  patch: UpdateSettlementInput,
): Promise<Settlement> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('settlements')
    .update(patch)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Settlement
}

export async function getSettlementSummary(): Promise<SettlementSummary> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('settlements')
    .select('status, expected_amount')
    .is('deleted_at', null)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as { status: string; expected_amount: number }[]

  const pendingTotal = rows
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.expected_amount), 0)

  const overdueTotal = rows
    .filter((r) => r.status === 'overdue')
    .reduce((sum, r) => sum + Number(r.expected_amount), 0)

  const completedCount = rows.filter((r) => r.status === 'completed').length

  return { pendingTotal, overdueTotal, completedCount }
}
