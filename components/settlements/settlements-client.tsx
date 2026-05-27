'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  WalletIcon,
  ClockIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CalendarIcon,
  Loader2Icon,
} from 'lucide-react'
import { MARKET_CHANNELS } from '@/lib/constants'
import type { Settlement, Order, MarketFee } from '@/lib/types'

interface Props {
  settlements: Settlement[]
  fees: MarketFee[]
}

const CYCLE_LABELS: Record<string, string> = {
  weekly: '주간',
  biweekly: '격주',
  monthly: '월간',
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:   { label: '정산예정', variant: 'secondary' },
  completed: { label: '정산완료', variant: 'default' },
  overdue:   { label: '미정산',   variant: 'destructive' },
}

function fmt(n: number) {
  return n.toLocaleString('ko-KR') + '원'
}

function channelLabel(ch: string) {
  return MARKET_CHANNELS.find((c) => c.value === ch)?.label ?? ch
}

export function SettlementsClient({ settlements, fees }: Props) {
  const [selected, setSelected] = useState<Settlement | null>(null)
  const [channelOrders, setChannelOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    if (!selected) {
      setChannelOrders([])
      return
    }
    setLoadingOrders(true)
    fetch(`/api/orders?channel=${selected.market_name}&limit=20`)
      .then((r) => r.json())
      .then((data) => setChannelOrders(Array.isArray(data) ? data : []))
      .catch(() => setChannelOrders([]))
      .finally(() => setLoadingOrders(false))
  }, [selected])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in30days = addDays(today, 30)

  const pendingThisMonth = settlements
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.expected_amount, 0)

  const overdueAmount = settlements
    .filter((s) => s.status === 'overdue')
    .reduce((sum, s) => sum + s.expected_amount, 0)

  const completedCount = settlements.filter((s) => s.status === 'completed').length

  const timeline = settlements
    .filter((s) => {
      const d = parseISO(s.expected_date)
      return (isAfter(d, today) || d.toDateString() === today.toDateString()) && isBefore(d, in30days)
    })
    .sort((a, b) => a.expected_date.localeCompare(b.expected_date))

  const detailFeeRate = selected
    ? fees.find((f) => f.market_name === selected.market_name)?.fee_rate ?? 0
    : 0

  const detailRevenue = channelOrders.reduce(
    (sum, o) => sum + (o.order_items ?? []).reduce((s, i) => s + i.quantity * i.selling_price, 0),
    0
  )
  const detailFeeAmount = Math.round(detailRevenue * (detailFeeRate / 100))

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>정산 관리</h1>
        <p className='text-muted-foreground mt-1 text-sm'>마켓별 정산 현황을 관리합니다.</p>
      </div>

      {/* 요약 카드 3종 */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Card>
          <CardContent className='pt-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-xs'>정산 예정액</p>
                <p className='mt-1 text-xl font-bold text-blue-600 dark:text-blue-400'>{fmt(pendingThisMonth)}</p>
              </div>
              <div className='flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950'>
                <WalletIcon className='size-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-xs'>미정산 잔액</p>
                <p className='mt-1 text-xl font-bold text-red-600 dark:text-red-400'>{fmt(overdueAmount)}</p>
              </div>
              <div className='flex size-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950'>
                <ClockIcon className='size-5 text-red-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-muted-foreground text-xs'>완료 건수</p>
                <p className='mt-1 text-xl font-bold text-green-600 dark:text-green-400'>{completedCount}건</p>
              </div>
              <div className='flex size-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950'>
                <CheckCircle2Icon className='size-5 text-green-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 영역: 테이블(2/3) + 타임라인(1/3) */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* 정산 현황 테이블 */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>정산 현황</CardTitle>
            <CardDescription>마켓별 정산 내역 및 상태</CardDescription>
          </CardHeader>
          <CardContent className='overflow-x-auto'>
            {settlements.length === 0 ? (
              <p className='text-muted-foreground py-8 text-center text-sm'>정산 내역이 없습니다.</p>
            ) : (
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-muted-foreground border-b text-xs'>
                    <th className='pb-2 text-left font-medium'>마켓</th>
                    <th className='pb-2 text-left font-medium'>정산주기</th>
                    <th className='pb-2 text-left font-medium'>정산예정일</th>
                    <th className='pb-2 text-right font-medium'>예상금액</th>
                    <th className='pb-2 text-right font-medium'>실정산금액</th>
                    <th className='pb-2 text-center font-medium'>상태</th>
                    <th className='pb-2 text-center font-medium'>상세</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => {
                    const cfg = STATUS_CONFIG[s.status]
                    return (
                      <tr key={s.id} className='border-b last:border-0'>
                        <td className='py-2.5 font-medium'>{channelLabel(s.market_name)}</td>
                        <td className='text-muted-foreground py-2.5'>{CYCLE_LABELS[s.settlement_cycle]}</td>
                        <td className='py-2.5'>
                          {format(parseISO(s.expected_date), 'yyyy-MM-dd')}
                        </td>
                        <td className='py-2.5 text-right'>{fmt(s.expected_amount)}</td>
                        <td className='py-2.5 text-right'>
                          {s.actual_amount !== null ? (
                            <span className='text-green-600 dark:text-green-400'>{fmt(s.actual_amount)}</span>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </td>
                        <td className='py-2.5 text-center'>
                          <Badge variant={cfg.variant} className='text-xs'>{cfg.label}</Badge>
                        </td>
                        <td className='py-2.5 text-center'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 px-2'
                            onClick={() => setSelected(s)}
                          >
                            <ChevronRightIcon className='size-4' />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* 정산 예정일 타임라인 */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='text-muted-foreground size-4' />
              <CardTitle>정산 예정 타임라인</CardTitle>
            </div>
            <CardDescription>향후 30일 이내 정산 예정</CardDescription>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className='text-muted-foreground py-6 text-center text-sm'>
                30일 내 정산 예정 없음
              </p>
            ) : (
              <ol className='relative border-l border-border ml-2 flex flex-col gap-0'>
                {timeline.map((s) => {
                  const d = parseISO(s.expected_date)
                  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <li key={s.id} className='mb-5 ml-4'>
                      <div className='absolute -left-1.5 mt-1.5 size-3 rounded-full border border-background bg-blue-500' />
                      <p className='text-xs text-muted-foreground'>
                        {format(d, 'M월 d일 (EEE)', { locale: ko })}
                        <span className='ml-1.5 font-semibold text-blue-600 dark:text-blue-400'>
                          D-{diffDays}
                        </span>
                      </p>
                      <p className='mt-0.5 text-sm font-medium'>{channelLabel(s.market_name)}</p>
                      <p className='text-xs text-muted-foreground'>{fmt(s.expected_amount)}</p>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 정산 상세 Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
          {selected && (
            <>
              <SheetHeader className='mb-6'>
                <SheetTitle>{channelLabel(selected.market_name)} 정산 상세</SheetTitle>
                <SheetDescription>
                  {format(parseISO(selected.expected_date), 'yyyy-MM-dd')} · {CYCLE_LABELS[selected.settlement_cycle]} 정산
                </SheetDescription>
              </SheetHeader>

              {/* 정산 금액 breakdown */}
              <div className='mb-6 rounded-lg border p-4 flex flex-col gap-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>총 매출액</span>
                  <span className='font-medium'>{fmt(detailRevenue || selected.expected_amount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>수수료 ({detailFeeRate}%)</span>
                  <span className='text-red-500'>-{fmt(detailFeeAmount)}</span>
                </div>
                <div className='border-t pt-2 flex justify-between font-semibold'>
                  <span>정산 예정액</span>
                  <span className='text-blue-600 dark:text-blue-400'>
                    {fmt(selected.actual_amount ?? selected.expected_amount)}
                  </span>
                </div>
                {selected.actual_amount !== null && (
                  <div className='flex justify-between text-green-600 dark:text-green-400 font-medium'>
                    <span>실 정산금액</span>
                    <span>{fmt(selected.actual_amount)}</span>
                  </div>
                )}
              </div>

              {/* 상태 */}
              <div className='mb-6 flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>상태</span>
                <Badge variant={STATUS_CONFIG[selected.status].variant}>
                  {STATUS_CONFIG[selected.status].label}
                </Badge>
              </div>

              {/* 관련 주문 목록 */}
              <div>
                <h3 className='mb-3 text-sm font-semibold'>관련 주문 내역</h3>
                {loadingOrders ? (
                  <div className='flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm'>
                    <Loader2Icon className='size-4 animate-spin' />
                    <span>주문 내역 로딩 중...</span>
                  </div>
                ) : channelOrders.length === 0 ? (
                  <p className='text-muted-foreground text-sm py-4 text-center'>주문 내역 없음</p>
                ) : (
                  <div className='flex flex-col gap-2'>
                    {channelOrders.map((o) => {
                      const orderTotal = (o.order_items ?? []).reduce(
                        (s, i) => s + i.quantity * i.selling_price, 0
                      )
                      return (
                        <div key={o.id} className='rounded-lg border p-3 text-sm'>
                          <div className='flex items-center justify-between'>
                            <span className='font-medium text-xs text-muted-foreground'>{o.internal_order_no}</span>
                            <span className='font-semibold'>{fmt(orderTotal)}</span>
                          </div>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {format(parseISO(o.ordered_at), 'yyyy-MM-dd')} ·{' '}
                            {(o.order_items ?? []).map((i) => i.product?.name ?? '-').join(', ')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
