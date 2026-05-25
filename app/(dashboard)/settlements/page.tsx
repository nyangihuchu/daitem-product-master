import type { Metadata } from 'next'
import { getDummySettlements, getDummyOrders, getDummyMarketFees } from '@/lib/dummy-data'
import { SettlementsClient } from '@/components/settlements/settlements-client'

export const metadata: Metadata = { title: '정산 관리' }

export default function SettlementsPage() {
  const settlements = getDummySettlements()
  const orders = getDummyOrders()
  const fees = getDummyMarketFees()
  return <SettlementsClient settlements={settlements} orders={orders} fees={fees} />
}
