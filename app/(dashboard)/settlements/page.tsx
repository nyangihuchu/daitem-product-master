import type { Metadata } from 'next'
import { getSettlements } from '@/lib/services/settlement-service'
import { getCurrentFees } from '@/lib/services/market-fee-service'
import { SettlementsClient } from '@/components/settlements/settlements-client'

export const metadata: Metadata = { title: '정산 관리' }

export default async function SettlementsPage() {
  const [settlements, fees] = await Promise.allSettled([
    getSettlements({ limit: 100 }),
    getCurrentFees(),
  ])

  return (
    <SettlementsClient
      settlements={settlements.status === 'fulfilled' ? settlements.value : []}
      fees={fees.status === 'fulfilled' ? fees.value : []}
    />
  )
}
