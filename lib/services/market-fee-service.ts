import { createClient } from '@/lib/supabase/server'
import type { MarketFee, MarketChannel } from '@/lib/types'

const VALID_CHANNELS: MarketChannel[] = ['cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st']

export function isValidMarketChannel(v: string): v is MarketChannel {
  return (VALID_CHANNELS as string[]).includes(v)
}

export async function getCurrentFees(): Promise<MarketFee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_fees')
    .select('*')
    .order('applied_at', { ascending: false })

  if (error) throw new Error(error.message)

  const seen = new Set<string>()
  const result: MarketFee[] = []
  for (const row of data ?? []) {
    if (!seen.has(row.market_name)) {
      seen.add(row.market_name)
      result.push(row as unknown as MarketFee)
    }
  }
  return result
}

export async function getFeeHistory(marketName: MarketChannel): Promise<MarketFee[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('market_fees')
    .select('*')
    .eq('market_name', marketName)
    .order('applied_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as MarketFee[]
}

export async function setFeeRate(marketName: MarketChannel, feeRate: number): Promise<MarketFee> {
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('market_fees')
    .insert({ market_name: marketName, fee_rate: feeRate, applied_at: today })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as MarketFee
}
