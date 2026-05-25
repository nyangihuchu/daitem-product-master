'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PeriodStats } from '@/lib/types'

interface Props {
  periodStats: PeriodStats[]
}

function formatKRW(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}백만`
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
  return value.toLocaleString()
}

const DAILY_DATA = [
  { period: '5/18', total_revenue: 198000, total_purchase: 99000, total_profit: 99000 },
  { period: '5/19', total_revenue: 245000, total_purchase: 122500, total_profit: 122500 },
  { period: '5/20', total_revenue: 312000, total_purchase: 156000, total_profit: 156000 },
  { period: '5/21', total_revenue: 178000, total_purchase: 89000, total_profit: 89000 },
  { period: '5/22', total_revenue: 420000, total_purchase: 210000, total_profit: 210000 },
  { period: '5/23', total_revenue: 289000, total_purchase: 144500, total_profit: 144500 },
  { period: '5/24', total_revenue: 368000, total_purchase: 184000, total_profit: 184000 },
]

const WEEKLY_DATA = [
  { period: '4주전', total_revenue: 1320000, total_purchase: 660000, total_profit: 660000 },
  { period: '3주전', total_revenue: 1580000, total_purchase: 790000, total_profit: 790000 },
  { period: '2주전', total_revenue: 1450000, total_purchase: 725000, total_profit: 725000 },
  { period: '지난주', total_revenue: 1750000, total_purchase: 875000, total_profit: 875000 },
]

const QUARTERLY_DATA = [
  { period: '2025 Q2', total_revenue: 14200000, total_purchase: 7100000, total_profit: 7100000 },
  { period: '2025 Q3', total_revenue: 16800000, total_purchase: 8400000, total_profit: 8400000 },
  { period: '2025 Q4', total_revenue: 18950000, total_purchase: 9475000, total_profit: 9475000 },
  { period: '2026 Q1', total_revenue: 16310000, total_purchase: 8155000, total_profit: 8155000 },
]

const ANNUAL_DATA = [
  { period: '2023', total_revenue: 52000000, total_purchase: 26000000, total_profit: 26000000 },
  { period: '2024', total_revenue: 68400000, total_purchase: 34200000, total_profit: 34200000 },
  { period: '2025', total_revenue: 73500000, total_purchase: 36750000, total_profit: 36750000 },
  { period: '2026 (YTD)', total_revenue: 28210000, total_purchase: 14105000, total_profit: 14105000 },
]

function ChartContent({ data }: { data: { period: string; total_revenue: number; total_purchase: number; total_profit: number }[] }) {
  return (
    <div className='h-[260px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
          <XAxis dataKey='period' tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatKRW} tick={{ fontSize: 11 }} width={56} />
          <Tooltip
            formatter={(v, name) => {
              const labels: Record<string, string> = {
                total_revenue: '매출',
                total_purchase: '매입',
                total_profit: '이익',
              }
              return [`${Number(v).toLocaleString()}원`, labels[name as string] ?? name]
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                total_revenue: '매출',
                total_purchase: '매입',
                total_profit: '이익',
              }
              return labels[value] ?? value
            }}
          />
          <Bar dataKey='total_revenue' fill='#6366f1' radius={[3, 3, 0, 0]} />
          <Bar dataKey='total_purchase' fill='#f97316' radius={[3, 3, 0, 0]} />
          <Bar dataKey='total_profit' fill='#22c55e' radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PeriodSalesChart({ periodStats }: Props) {
  const monthlyData = periodStats.map((s) => ({
    period: s.period.slice(2).replace('-', '/'),
    total_revenue: s.total_revenue,
    total_purchase: s.total_purchase,
    total_profit: s.total_profit,
  }))

  return (
    <Tabs defaultValue='monthly'>
      <TabsList className='mb-4 flex-wrap'>
        <TabsTrigger value='daily'>일간</TabsTrigger>
        <TabsTrigger value='weekly'>주간</TabsTrigger>
        <TabsTrigger value='monthly'>월간</TabsTrigger>
        <TabsTrigger value='quarterly'>분기</TabsTrigger>
        <TabsTrigger value='annual'>연간</TabsTrigger>
      </TabsList>

      <TabsContent value='daily'><ChartContent data={DAILY_DATA} /></TabsContent>
      <TabsContent value='weekly'><ChartContent data={WEEKLY_DATA} /></TabsContent>
      <TabsContent value='monthly'><ChartContent data={monthlyData} /></TabsContent>
      <TabsContent value='quarterly'><ChartContent data={QUARTERLY_DATA} /></TabsContent>
      <TabsContent value='annual'><ChartContent data={ANNUAL_DATA} /></TabsContent>
    </Tabs>
  )
}
