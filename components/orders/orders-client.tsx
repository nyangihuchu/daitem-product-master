'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PlusIcon, SearchIcon } from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/types'
import { MARKET_CHANNELS, ORDER_STATUS_LABELS } from '@/lib/constants'

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received:  ['ordered', 'cancelled'],
  ordered:   ['shipping', 'cancelled'],
  shipping:  ['delivered', 'cancelled'],
  delivered: ['settled', 'returned'],
  settled:   [],
  cancelled: [],
  returned:  [],
}

const STATUS_COLOR: Record<string, string> = {
  received:  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ordered:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  shipping:  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  settled:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  returned:  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const orderSchema = z.object({
  channel: z.enum(['cafe24', 'naver', 'coupang', 'gmarket', 'auction', 'lotteon', '11st']),
  market_order_no: z.string().optional(),
  product_id: z.string().uuid({ message: '유효한 상품 UUID를 입력하세요' }),
  quantity: z.number().int().min(1, { message: '수량은 1 이상이어야 합니다' }),
  selling_price: z.number().min(0, { message: '판매가는 0 이상이어야 합니다' }),
})

type OrderFormValues = z.infer<typeof orderSchema>

interface Props {
  orders: Order[]
}

export function OrdersClient({ orders }: Props) {
  const router = useRouter()
  const [filterChannel, setFilterChannel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      channel: 'naver',
      market_order_no: '',
      product_id: '',
      quantity: 1,
      selling_price: 0,
    },
  })

  const filtered = useMemo(() => orders.filter((o) => {
    if (filterChannel !== 'all' && o.channel !== filterChannel) return false
    if (filterStatus !== 'all' && o.status !== filterStatus) return false
    if (search && !o.internal_order_no.includes(search) && !(o.market_order_no ?? '').includes(search)) return false
    return true
  }), [orders, filterChannel, filterStatus, search])

  const totalAmount = (o: Order) =>
    (o.order_items ?? []).reduce((sum, i) => sum + i.selling_price * i.quantity, 0)

  async function handleCreateOrder(values: OrderFormValues) {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: values.channel,
          market_order_no: values.market_order_no || null,
          items: [{
            product_id: values.product_id,
            quantity: values.quantity,
            selling_price: values.selling_price,
          }],
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        alert(json.error ?? '주문 생성에 실패했습니다')
        return
      }

      form.reset()
      setShowNewDialog(false)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setIsChangingStatus(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const json = await res.json()
        alert(json.error ?? '상태 변경에 실패했습니다')
        return
      }

      setSelectedOrder(null)
      router.refresh()
    } finally {
      setIsChangingStatus(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>주문 관리</h1>
          <p className='text-muted-foreground mt-1 text-sm'>전체 {orders.length}건</p>
        </div>
        <Button size='sm' onClick={() => setShowNewDialog(true)}>
          <PlusIcon className='mr-1.5 size-4' />
          주문 수동 입력
        </Button>
      </div>

      {/* 필터바 */}
      <div className='flex flex-wrap gap-2'>
        <div className='relative flex-1 min-w-[180px]'>
          <SearchIcon className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            className='pl-8'
            placeholder='주문번호 검색'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='채널' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 채널</SelectItem>
            {MARKET_CHANNELS.map((ch) => (
              <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='w-[130px]'>
            <SelectValue placeholder='상태' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 상태</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 테이블 */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>내부주문번호</TableHead>
              <TableHead>마켓주문번호</TableHead>
              <TableHead>채널</TableHead>
              <TableHead>주문일</TableHead>
              <TableHead>상품</TableHead>
              <TableHead className='text-right'>금액</TableHead>
              <TableHead>입력유형</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-muted-foreground py-12 text-center text-sm'>
                  주문 내역이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => {
                const items = o.order_items ?? []
                const firstItem = items[0]
                const amount = totalAmount(o)
                const ch = MARKET_CHANNELS.find((c) => c.value === o.channel)
                return (
                  <TableRow
                    key={o.id}
                    className='cursor-pointer'
                    onClick={() => setSelectedOrder(o)}
                  >
                    <TableCell className='font-mono text-xs font-medium'>{o.internal_order_no}</TableCell>
                    <TableCell className='font-mono text-xs text-muted-foreground'>
                      {o.market_order_no ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-xs'>{ch?.label ?? o.channel}</Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground text-xs'>
                      {o.ordered_at.slice(0, 10)}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {firstItem?.product?.name ?? '-'}
                      {items.length > 1 && (
                        <span className='text-muted-foreground ml-1 text-xs'>외 {items.length - 1}건</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right text-sm font-medium'>
                      {amount.toLocaleString()}원
                    </TableCell>
                    <TableCell>
                      {o.source_type === 'manual' && (
                        <Badge variant='outline' className='text-xs'>수동입력</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 주문 상세 Sheet */}
      <Sheet open={selectedOrder !== null} onOpenChange={(open) => { if (!open) setSelectedOrder(null) }}>
        <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>주문 상세</SheetTitle>
          </SheetHeader>
          {selectedOrder && (
            <div className='mt-4 flex flex-col gap-5'>
              <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                {[
                  ['내부주문번호', selectedOrder.internal_order_no],
                  ['마켓주문번호', selectedOrder.market_order_no ?? '-'],
                  ['채널', MARKET_CHANNELS.find((c) => c.value === selectedOrder.channel)?.label ?? selectedOrder.channel],
                  ['주문일', selectedOrder.ordered_at.slice(0, 10)],
                  ['입력유형', selectedOrder.source_type === 'manual' ? '수동입력' : 'API 자동'],
                  ['현재상태', ORDER_STATUS_LABELS[selectedOrder.status]],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='text-muted-foreground text-xs'>{label}</dt>
                    <dd className='font-medium'>{value}</dd>
                  </div>
                ))}
              </dl>

              {/* 상태 변경 */}
              {ALLOWED_TRANSITIONS[selectedOrder.status].length > 0 && (
                <div className='flex flex-col gap-2'>
                  <h3 className='text-sm font-semibold'>상태 변경</h3>
                  <div className='flex gap-2'>
                    {ALLOWED_TRANSITIONS[selectedOrder.status].map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        size='sm'
                        variant={nextStatus === 'cancelled' || nextStatus === 'returned' ? 'destructive' : 'default'}
                        disabled={isChangingStatus}
                        onClick={() => handleStatusChange(selectedOrder.id, nextStatus)}
                      >
                        {ORDER_STATUS_LABELS[nextStatus] ?? nextStatus}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className='mb-2 text-sm font-semibold'>주문 항목</h3>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>상품명</TableHead>
                        <TableHead className='text-right text-xs'>수량</TableHead>
                        <TableHead className='text-right text-xs'>판매가</TableHead>
                        <TableHead className='text-right text-xs'>소계</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedOrder.order_items ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='text-xs'>{item.product?.name ?? item.product_id}</TableCell>
                          <TableCell className='text-right text-xs'>{item.quantity}</TableCell>
                          <TableCell className='text-right text-xs'>{item.selling_price.toLocaleString()}원</TableCell>
                          <TableCell className='text-right text-xs font-medium'>{(item.selling_price * item.quantity).toLocaleString()}원</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className='text-right text-xs font-semibold'>합계</TableCell>
                        <TableCell className='text-right text-sm font-bold'>{totalAmount(selectedOrder).toLocaleString()}원</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <h3 className='text-sm font-semibold'>운송장번호</h3>
                <p className='text-muted-foreground text-xs'>추후 지원 예정</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 수동 주문 입력 Dialog */}
      <Dialog open={showNewDialog} onOpenChange={(open) => {
        if (!open) { form.reset(); }
        setShowNewDialog(open)
      }}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>주문 수동 입력</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateOrder)}>
            <div className='flex flex-col gap-3 py-2'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>채널 *</label>
                <Select
                  value={form.watch('channel')}
                  onValueChange={(v) => form.setValue('channel', v as OrderFormValues['channel'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='채널 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKET_CHANNELS.map((ch) => (
                      <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.channel && (
                  <p className='text-destructive text-xs'>{form.formState.errors.channel.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>마켓 주문번호</label>
                <Input
                  placeholder='마켓 주문번호 입력'
                  {...form.register('market_order_no')}
                />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>상품 ID *</label>
                <Input
                  placeholder='상품 UUID 입력'
                  {...form.register('product_id')}
                />
                {form.formState.errors.product_id && (
                  <p className='text-destructive text-xs'>{form.formState.errors.product_id.message}</p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>수량 *</label>
                  <Input
                    type='number'
                    min={1}
                    {...form.register('quantity', { valueAsNumber: true })}
                  />
                  {form.formState.errors.quantity && (
                    <p className='text-destructive text-xs'>{form.formState.errors.quantity.message}</p>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>판매가 (원) *</label>
                  <Input
                    type='number'
                    min={0}
                    placeholder='0'
                    {...form.register('selling_price', { valueAsNumber: true })}
                  />
                  {form.formState.errors.selling_price && (
                    <p className='text-destructive text-xs'>{form.formState.errors.selling_price.message}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => { form.reset(); setShowNewDialog(false) }}>
                취소
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
