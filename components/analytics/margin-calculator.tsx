'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MARKET_CHANNELS } from '@/lib/constants'
import type { MarketFee } from '@/lib/types'

interface Props {
  fees: MarketFee[]
}

function fmt(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

export function MarginCalculator({ fees }: Props) {
  const [sellingPrice, setSellingPrice] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [feeRate, setFeeRate] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<string>('')

  useEffect(() => {
    if (!selectedChannel) return
    const found = fees.find((f) => f.market_name === selectedChannel)
    if (found) setFeeRate(String(found.fee_rate))
  }, [selectedChannel, fees])

  const selling = parseFloat(sellingPrice) || 0
  const purchase = parseFloat(purchasePrice) || 0
  const rate = parseFloat(feeRate) || 0

  const feeAmount = Math.round(selling * (rate / 100))
  const marginAmount = selling - purchase - feeAmount
  const marginRate = selling > 0 ? (marginAmount / selling) * 100 : 0

  const isPositive = marginAmount >= 0
  const hasInput = selling > 0 || purchase > 0

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>마진 계산기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* 채널 선택 */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-xs font-medium'>채널 (수수료 자동입력)</label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className='h-9 text-sm'>
                <SelectValue placeholder='채널 선택' />
              </SelectTrigger>
              <SelectContent>
                {MARKET_CHANNELS.map((ch) => {
                  const fee = fees.find((f) => f.market_name === ch.value)
                  return (
                    <SelectItem key={ch.value} value={ch.value}>
                      {ch.label} {fee ? `(${fee.fee_rate}%)` : ''}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 판매가 */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-xs font-medium'>판매가 (원)</label>
            <input
              type='number'
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder='0'
              className='border-input bg-background h-9 rounded-md border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
            />
          </div>

          {/* 매입가 */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-xs font-medium'>매입가 (원)</label>
            <input
              type='number'
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder='0'
              className='border-input bg-background h-9 rounded-md border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
            />
          </div>

          {/* 수수료율 */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-muted-foreground text-xs font-medium'>수수료율 (%)</label>
            <input
              type='number'
              step='0.1'
              value={feeRate}
              onChange={(e) => setFeeRate(e.target.value)}
              placeholder='0.0'
              className='border-input bg-background h-9 rounded-md border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
            />
          </div>
        </div>

        {/* 계산 결과 */}
        {hasInput && (
          <div className='mt-4 grid grid-cols-3 gap-3 rounded-lg border p-4'>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>수수료</p>
              <p className='mt-1 text-base font-semibold text-orange-500'>{fmt(feeAmount)}</p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>마진액</p>
              <p className={`mt-1 text-xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? '+' : ''}{fmt(marginAmount)}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground text-xs'>마진율</p>
              <p className={`mt-1 text-xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {marginRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
