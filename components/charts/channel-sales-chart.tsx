'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CHANNEL_DATA = [
  { name: '카페24',    value: 1250000, color: '#6366f1' },
  { name: '네이버',    value: 890000,  color: '#22c55e' },
  { name: '쿠팡',      value: 2340000, color: '#f97316' },
  { name: '지마켓',    value: 650000,  color: '#eab308' },
  { name: '롯데온',    value: 310000,  color: '#ec4899' },
  { name: '11번가',    value: 560000,  color: '#14b8a6' },
]

function formatKRW(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}백만`
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
  return value.toLocaleString()
}

export function ChannelSalesChart() {
  return (
    <Tabs defaultValue='bar'>
      <TabsList className='mb-4'>
        <TabsTrigger value='bar'>막대</TabsTrigger>
        <TabsTrigger value='pie'>파이</TabsTrigger>
      </TabsList>

      <TabsContent value='bar'>
        <div className='h-[220px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={CHANNEL_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
            <XAxis dataKey='name' tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatKRW} tick={{ fontSize: 11 }} width={52} />
            <Tooltip
              formatter={(v) => [`${Number(v).toLocaleString()}원`, '매출']}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey='value' radius={[4, 4, 0, 0]}>
              {CHANNEL_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value='pie'>
        <div className='h-[220px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={CHANNEL_DATA}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {CHANNEL_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${Number(v).toLocaleString()}원`, '매출']}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
