import type { Metadata } from 'next'
import { getCurrentFees } from '@/lib/services/market-fee-service'
import {
  getChannelMarginSummary,
  getPeriodStats,
  getTopProductSales,
} from '@/lib/services/margin-service'
import { getProducts } from '@/lib/services/product-service'
import { AnalyticsClient } from '@/components/analytics/analytics-client'

export const metadata: Metadata = { title: '수익 분석' }

export default async function AnalyticsPage() {
  const [fees, marginSummary, periodStats, topProducts, productsResult] = await Promise.all([
    getCurrentFees(),
    getChannelMarginSummary(),
    getPeriodStats('monthly'),
    getTopProductSales(10),
    getProducts({ pageSize: 100 }),
  ])

  return (
    <AnalyticsClient
      fees={fees}
      marginSummary={marginSummary}
      periodStats={periodStats}
      topProducts={topProducts}
      products={productsResult.data}
    />
  )
}
