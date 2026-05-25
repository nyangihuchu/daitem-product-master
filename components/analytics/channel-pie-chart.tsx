'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MarginSummary } from '@/lib/types'
import { MARKET_CHANNELS } from '@/lib/constants'

interface Props {
  marginSummary: MarginSummary[]
}

const CHANNEL_COLORS: Record<string, string> = {
  cafe24:  '#6366f1',
  naver:   '#22c55e',
  coupang: '#f97316',
  gmarket: '#eab308',
  auction: '#ef4444',
  lotteon: '#ec4899',
  '11st':  '#14b8a6',
}

export function ChannelPieChart({ marginSummary }: Props) {
  const data = marginSummary.map((s) => {
    const ch = MARKET_CHANNELS.find((c) => c.value === s.channel)
    return {
      name: ch?.label ?? s.channel,
      value: s.selling_price,
      color: CHANNEL_COLORS[s.channel] ?? '#94a3b8',
    }
  })

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className='h-[260px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={data}
            dataKey='value'
            nameKey='name'
            cx='50%'
            cy='45%'
            outerRadius={85}
            label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [
              `${Number(v).toLocaleString()}원 (${total > 0 ? ((Number(v) / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
