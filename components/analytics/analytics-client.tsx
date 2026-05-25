'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUpIcon, TrendingDownIcon, BarChart3Icon, PieChartIcon } from 'lucide-react'
import { MarginCalculator } from './margin-calculator'
import { PeriodSalesChart } from './period-sales-chart'
import { ChannelPieChart } from './channel-pie-chart'
import type { Product, MarketFee, MarginSummary, PeriodStats } from '@/lib/types'
import type { ProductSalesSummary } from '@/lib/services/margin-service'
import { MARKET_CHANNELS } from '@/lib/constants'

interface Props {
  periodStats: PeriodStats[]
  marginSummary: MarginSummary[]
  products: Product[]
  topProducts: ProductSalesSummary[]
  fees: MarketFee[]
}

function fmt(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

export function AnalyticsClient({ periodStats, marginSummary, products, topProducts, fees }: Props) {
  const totalRevenue = periodStats.reduce((s, p) => s + p.total_revenue, 0)
  const totalProfit = periodStats.reduce((s, p) => s + p.total_profit, 0)
  const overallMarginRate = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  const topChannel = [...marginSummary].sort((a, b) => b.selling_price - a.selling_price)[0]
  const topChannelLabel = MARKET_CHANNELS.find((c) => c.value === topChannel?.channel)?.label ?? '-'

  const salesRanking = topProducts
  const topSellers = topProducts.slice(0, 5)

  const excessStock = [...products]
    .filter((p) => p.stock_quantity > (p.min_stock_quantity ?? 0) * 3)
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 5)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>수익 분석</h1>
        <p className='text-muted-foreground mt-1 text-sm'>매출·매입·마진 현황을 분석합니다.</p>
      </div>

      {/* KPI 요약 */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <Card>
          <CardContent className='pt-5'>
            <p className='text-muted-foreground text-xs'>누적 매출</p>
            <p className='mt-1 text-xl font-bold text-blue-600 dark:text-blue-400'>{fmt(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-5'>
            <p className='text-muted-foreground text-xs'>누적 이익</p>
            <p className='mt-1 text-xl font-bold text-green-600 dark:text-green-400'>{fmt(totalProfit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-5'>
            <p className='text-muted-foreground text-xs'>평균 마진율</p>
            <div className='mt-1 flex items-center gap-1'>
              {overallMarginRate >= 30 ? (
                <TrendingUpIcon className='size-4 text-green-500' />
              ) : (
                <TrendingDownIcon className='size-4 text-red-500' />
              )}
              <p className='text-xl font-bold'>{overallMarginRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-5'>
            <p className='text-muted-foreground text-xs'>최고 매출 채널</p>
            <p className='mt-1 text-xl font-bold'>{topChannelLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* 마진 계산기 */}
      <MarginCalculator fees={fees} />

      {/* 기간별 차트 + 파이 차트 */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <BarChart3Icon className='text-muted-foreground size-4' />
              <CardTitle>기간별 매출·매입·이익</CardTitle>
            </div>
            <CardDescription>탭을 선택하여 기간 단위를 변경합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <PeriodSalesChart periodStats={periodStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <PieChartIcon className='text-muted-foreground size-4' />
              <CardTitle>채널별 매출 비중</CardTitle>
            </div>
            <CardDescription>마켓 채널별 매출 점유율</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelPieChart marginSummary={marginSummary} />
          </CardContent>
        </Card>
      </div>

      {/* 채널별 마진 상세 */}
      <Card>
        <CardHeader>
          <CardTitle>채널별 마진 현황</CardTitle>
          <CardDescription>채널별 판매가·매입가·수수료·마진 요약</CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-muted-foreground border-b text-xs'>
                <th className='pb-2 text-left font-medium'>채널</th>
                <th className='pb-2 text-right font-medium'>매출액</th>
                <th className='pb-2 text-right font-medium'>매입액</th>
                <th className='pb-2 text-right font-medium'>수수료율</th>
                <th className='pb-2 text-right font-medium'>수수료액</th>
                <th className='pb-2 text-right font-medium'>마진액</th>
                <th className='pb-2 text-right font-medium'>마진율</th>
              </tr>
            </thead>
            <tbody>
              {marginSummary.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-muted-foreground py-6 text-center text-sm'>
                    데이터 없음
                  </td>
                </tr>
              ) : (
                marginSummary.map((m) => {
                  const label = MARKET_CHANNELS.find((c) => c.value === m.channel)?.label ?? m.channel
                  return (
                    <tr key={m.channel} className='border-b last:border-0'>
                      <td className='py-2 font-medium'>{label}</td>
                      <td className='py-2 text-right'>{m.selling_price.toLocaleString()}원</td>
                      <td className='py-2 text-right'>{m.purchase_price.toLocaleString()}원</td>
                      <td className='py-2 text-right'>{m.fee_rate}%</td>
                      <td className='text-muted-foreground py-2 text-right'>{m.fee_amount.toLocaleString()}원</td>
                      <td className='py-2 text-right font-semibold text-green-600 dark:text-green-400'>
                        {m.margin_amount.toLocaleString()}원
                      </td>
                      <td className='py-2 text-right'>
                        <Badge
                          variant={m.margin_rate >= 40 ? 'default' : m.margin_rate >= 30 ? 'secondary' : 'destructive'}
                          className='text-xs'
                        >
                          {m.margin_rate}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 판매 순위 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>상품별 판매 순위</CardTitle>
          <CardDescription>최근 90일 주문 기준 상위 판매 상품</CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          {salesRanking.length === 0 ? (
            <p className='text-muted-foreground py-6 text-center text-sm'>데이터 없음</p>
          ) : (
            <table className='w-full text-sm'>
              <thead>
                <tr className='text-muted-foreground border-b text-xs'>
                  <th className='pb-2 text-left font-medium'>순위</th>
                  <th className='pb-2 text-left font-medium'>상품명</th>
                  <th className='pb-2 text-left font-medium'>카테고리</th>
                  <th className='pb-2 text-left font-medium'>브랜드</th>
                  <th className='pb-2 text-right font-medium'>판매량</th>
                  <th className='pb-2 text-right font-medium'>매출액</th>
                  <th className='pb-2 text-right font-medium'>마진율</th>
                </tr>
              </thead>
              <tbody>
                {salesRanking.map((item, i) => (
                  <tr key={item.name + i} className='border-b last:border-0'>
                    <td className='py-2 text-center font-bold text-blue-600 dark:text-blue-400'>
                      {i + 1}
                    </td>
                    <td className='max-w-[160px] truncate py-2 font-medium'>{item.name}</td>
                    <td className='text-muted-foreground py-2'>{item.category}</td>
                    <td className='text-muted-foreground py-2'>{item.brand}</td>
                    <td className='py-2 text-right'>{item.qty}개</td>
                    <td className='py-2 text-right'>{item.revenue.toLocaleString()}원</td>
                    <td className='py-2 text-right'>
                      <Badge
                        variant={item.marginRate >= 40 ? 'default' : item.marginRate >= 20 ? 'secondary' : 'destructive'}
                        className='text-xs'
                      >
                        {item.marginRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* 분류 카드: 판매 상위 / 재고 과다 */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* 판매 상위 5개 */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base text-green-600 dark:text-green-400'>잘 팔리는 상품 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellers.length === 0 ? (
              <p className='text-muted-foreground py-4 text-center text-sm'>데이터 없음</p>
            ) : (
              <ul className='flex flex-col gap-2'>
                {topSellers.map((item, i) => (
                  <li key={item.name + i} className='flex items-center justify-between gap-2'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300'>
                        {i + 1}
                      </span>
                      <span className='truncate text-sm'>{item.name}</span>
                    </div>
                    <span className='text-muted-foreground shrink-0 text-xs'>{item.qty}개</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 재고 과다 5개 */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base text-orange-600 dark:text-orange-400'>재고 정리 필요 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            {excessStock.length === 0 ? (
              <p className='text-muted-foreground py-4 text-center text-sm'>해당 상품 없음</p>
            ) : (
              <ul className='flex flex-col gap-2'>
                {excessStock.map((p, i) => (
                  <li key={p.id} className='flex items-center justify-between gap-2'>
                    <div className='flex min-w-0 items-center gap-2'>
                      <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900 dark:text-orange-300'>
                        {i + 1}
                      </span>
                      <span className='truncate text-sm'>{p.name}</span>
                    </div>
                    <span className='text-muted-foreground shrink-0 text-xs'>재고 {p.stock_quantity}개</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
