'use client'

import { useState, useEffect } from 'react'
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

function ChartContent({ data }: { data: PeriodStats[] }) {
  if (data.length === 0) {
    return (
      <div className='flex h-[260px] items-center justify-center'>
        <p className='text-muted-foreground text-sm'>데이터 없음</p>
      </div>
    )
  }
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
  const [activePeriod, setActivePeriod] = useState('monthly')
  const [data, setData] = useState<PeriodStats[]>(periodStats)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      return
    }
    setLoading(true)
    fetch('/api/analytics/period-stats?period=' + activePeriod)
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activePeriod])

  return (
    <Tabs defaultValue='monthly' onValueChange={setActivePeriod}>
      <TabsList className='mb-4 flex-wrap'>
        <TabsTrigger value='daily'>일간</TabsTrigger>
        <TabsTrigger value='weekly'>주간</TabsTrigger>
        <TabsTrigger value='monthly'>월간</TabsTrigger>
        <TabsTrigger value='quarterly'>분기</TabsTrigger>
        <TabsTrigger value='annual'>연간</TabsTrigger>
      </TabsList>

      <TabsContent value={activePeriod}>
        {loading ? (
          <div className='flex h-[260px] items-center justify-center'>
            <p className='text-muted-foreground text-sm'>로딩 중...</p>
          </div>
        ) : (
          <ChartContent data={data} />
        )}
      </TabsContent>
    </Tabs>
  )
}
