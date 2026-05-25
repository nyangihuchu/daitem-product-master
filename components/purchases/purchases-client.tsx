'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  FileTextIcon, MailIcon, PlusIcon, Trash2Icon, CheckSquareIcon,
} from 'lucide-react'
import type { Purchase, Supplier, Product } from '@/lib/types'
import { PURCHASE_STATUS_LABELS } from '@/lib/constants'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:  ['ordered'],
  ordered:  ['shipping'],
  shipping: ['received'],
  received: [],
}

const NEXT_STATUS_LABELS: Record<string, string> = {
  ordered:  '발주 완료',
  shipping: '배송 중',
  received: '입고 완료',
}

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ordered:  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipping: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

interface PurchaseLineItem {
  productId: string
  quantity: number
  price: number
}

interface Props {
  purchases: Purchase[]
  suppliers: Supplier[]
}

export function PurchasesClient({ purchases, suppliers }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [createSupplierId, setCreateSupplierId] = useState('')
  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([
    { productId: '', quantity: 1, price: 0 },
  ])
  const [supplierProducts, setSupplierProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailPurchaseId, setEmailPurchaseId] = useState('')
  const [emailTo, setEmailTo] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const filtered = useMemo(() =>
    purchases.filter((p) => filterStatus === 'all' || p.status === filterStatus),
    [purchases, filterStatus]
  )

  async function loadProducts(supplierId: string) {
    setSupplierProducts([])
    if (!supplierId) return
    setLoadingProducts(true)
    try {
      const res = await fetch(`/api/products?supplier_id=${supplierId}&limit=200&status=selling`)
      const json = await res.json()
      setSupplierProducts(json.data ?? [])
    } finally {
      setLoadingProducts(false)
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); return next }
      const all = [...next, id]
      const supplierIds = new Set(all.map((pid) => purchases.find((p) => p.id === pid)?.supplier_id))
      if (supplierIds.size > 1) {
        alert('동일 공급처 발주만 일괄 처리할 수 있습니다.')
        return prev
      }
      next.add(id)
      return next
    })
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { productId: '', quantity: 1, price: 0 }])
  }

  function removeLineItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateLineItem(idx: number, field: keyof PurchaseLineItem, value: string | number) {
    setLineItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const lineTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)

  async function handleCreatePurchase() {
    if (!createSupplierId) { alert('공급처를 선택하세요'); return }
    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0)
    if (validItems.length === 0) { alert('발주 항목을 1개 이상 입력하세요'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: createSupplierId,
          items: validItems.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
            purchase_price: i.price,
          })),
        }),
      })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error ?? '발주 생성에 실패했습니다')
        return
      }
      setShowCreateSheet(false)
      setCreateSupplierId('')
      setLineItems([{ productId: '', quantity: 1, price: 0 }])
      setSupplierProducts([])
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await fetch(`/api/purchases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? '상태 변경에 실패했습니다')
      return
    }
    setSelectedPurchase(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하면 복구할 수 없습니다. 계속하시겠습니까?')) return
    const res = await fetch(`/api/purchases/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? '삭제에 실패했습니다')
      return
    }
    setSelectedPurchase(null)
    router.refresh()
  }

  async function handleBulkOrder() {
    const pendingSelected = [...selected].filter(
      (id) => purchases.find((p) => p.id === id)?.status === 'pending'
    )
    if (pendingSelected.length === 0) {
      alert('발주 대기(pending) 상태의 발주만 일괄 처리할 수 있습니다')
      return
    }
    for (const id of pendingSelected) {
      const res = await fetch(`/api/purchases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ordered' }),
      })
      if (!res.ok) {
        const json = await res.json()
        alert(`${id} 처리 중 오류: ${json.error ?? '알 수 없는 오류'}`)
        break
      }
    }
    setSelected(new Set())
    router.refresh()
  }

  function openEmailDialog(id: string) {
    setEmailPurchaseId(id)
    setEmailTo('')
    setEmailDialogOpen(true)
  }

  async function handleSendEmail() {
    if (!emailTo) { alert('이메일 주소를 입력하세요'); return }
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/purchases/${emailPurchaseId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo }),
      })
      if (res.ok) {
        setEmailDialogOpen(false)
        alert('이메일이 발송되었습니다')
      } else {
        const json = await res.json()
        alert(json.error ?? '이메일 발송에 실패했습니다')
      }
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>발주 관리</h1>
          <p className='text-muted-foreground mt-1 text-sm'>전체 {purchases.length}건</p>
        </div>
        <div className='flex gap-2'>
          {selected.size > 0 && (
            <Button variant='outline' size='sm' onClick={handleBulkOrder}>
              <CheckSquareIcon className='mr-1.5 size-4' />
              선택 발주 ({selected.size}건)
            </Button>
          )}
          <Button size='sm' onClick={() => { setShowCreateSheet(true); setLineItems([{ productId: '', quantity: 1, price: 0 }]); setCreateSupplierId(''); setSupplierProducts([]) }}>
            <PlusIcon className='mr-1.5 size-4' />
            발주 생성
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <div className='flex gap-2'>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='상태' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 상태</SelectItem>
            {Object.entries(PURCHASE_STATUS_LABELS).map(([k, v]) => (
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
              <TableHead className='w-[40px]' />
              <TableHead>발주번호</TableHead>
              <TableHead>공급처</TableHead>
              <TableHead>발주일</TableHead>
              <TableHead>트리거</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className='text-right'>총액</TableHead>
              <TableHead className='w-[120px]'>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-muted-foreground py-12 text-center text-sm'>
                  발주 내역이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  className='cursor-pointer'
                  onClick={() => setSelectedPurchase(p)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type='checkbox'
                      className='size-4 cursor-pointer rounded'
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </TableCell>
                  <TableCell className='font-mono text-xs font-medium'>{p.id.toUpperCase()}</TableCell>
                  <TableCell className='font-medium'>{p.supplier?.name ?? '-'}</TableCell>
                  <TableCell className='text-muted-foreground text-xs'>{p.ordered_at.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Badge variant={p.trigger_type === 'auto' ? 'default' : 'outline'} className='text-xs'>
                      {p.trigger_type === 'auto' ? '자동' : '수동'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status]}`}>
                      {PURCHASE_STATUS_LABELS[p.status]}
                    </span>
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {p.total_amount.toLocaleString()}원
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className='flex gap-1'>
                      <Button variant='ghost' size='icon' className='size-8' title='PDF 미리보기'
                        onClick={() => window.open(`/api/purchases/${p.id}/pdf`, '_blank')}>
                        <FileTextIcon className='size-3.5' />
                      </Button>
                      <Button variant='ghost' size='icon' className='size-8' title='이메일 발송'
                        onClick={() => openEmailDialog(p.id)}>
                        <MailIcon className='size-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 발주 상세 Sheet */}
      <Sheet open={selectedPurchase !== null} onOpenChange={(open) => { if (!open) setSelectedPurchase(null) }}>
        <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>발주 상세</SheetTitle>
          </SheetHeader>
          {selectedPurchase && (
            <div className='mt-4 flex flex-col gap-5'>
              <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                {[
                  ['공급처', selectedPurchase.supplier?.name ?? '-'],
                  ['발주일', selectedPurchase.ordered_at.slice(0, 10)],
                  ['트리거', selectedPurchase.trigger_type === 'auto' ? '자동' : '수동'],
                  ['상태', PURCHASE_STATUS_LABELS[selectedPurchase.status]],
                  ['총액', `${selectedPurchase.total_amount.toLocaleString()}원`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='text-muted-foreground text-xs'>{label}</dt>
                    <dd className='font-medium'>{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <h3 className='mb-2 text-sm font-semibold'>발주 항목</h3>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-xs'>상품명</TableHead>
                        <TableHead className='text-right text-xs'>수량</TableHead>
                        <TableHead className='text-right text-xs'>단가</TableHead>
                        <TableHead className='text-right text-xs'>소계</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedPurchase.purchase_items ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='text-xs'>{item.product?.name ?? item.product_id}</TableCell>
                          <TableCell className='text-right text-xs'>{item.quantity}</TableCell>
                          <TableCell className='text-right text-xs'>{item.purchase_price.toLocaleString()}원</TableCell>
                          <TableCell className='text-right text-xs font-medium'>{(item.purchase_price * item.quantity).toLocaleString()}원</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 상태 변경 버튼 */}
              {ALLOWED_TRANSITIONS[selectedPurchase.status]?.length > 0 && (
                <div className='flex flex-col gap-2'>
                  <p className='text-xs font-medium text-muted-foreground'>상태 변경</p>
                  <div className='flex gap-2'>
                    {ALLOWED_TRANSITIONS[selectedPurchase.status].map((next) => (
                      <Button
                        key={next}
                        size='sm'
                        className='flex-1'
                        onClick={() => handleStatusChange(selectedPurchase.id, next)}
                      >
                        {NEXT_STATUS_LABELS[next] ?? next}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex gap-2'>
                <Button variant='outline' size='sm' className='flex-1' onClick={() => window.open(`/api/purchases/${selectedPurchase.id}/pdf`, '_blank')}>
                  <FileTextIcon className='mr-1.5 size-4' /> PDF 미리보기
                </Button>
                <Button variant='outline' size='sm' className='flex-1' onClick={() => openEmailDialog(selectedPurchase.id)}>
                  <MailIcon className='mr-1.5 size-4' /> 이메일 발송
                </Button>
              </div>

              {/* 소프트 딜리트 */}
              <Button
                variant='destructive'
                size='sm'
                onClick={() => handleDelete(selectedPurchase.id)}
              >
                <Trash2Icon className='mr-1.5 size-4' />
                발주 삭제
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 이메일 발송 Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>이메일 발송</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-3 py-2'>
            <label className='text-sm font-medium'>수신 이메일 주소 *</label>
            <Input
              type='email'
              placeholder='supplier@example.com'
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendEmail() }}
            />
            <p className='text-xs text-muted-foreground'>
              발주서 PDF가 첨부되어 발송됩니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEmailDialogOpen(false)}>
              취소
            </Button>
            <Button disabled={sendingEmail} onClick={handleSendEmail}>
              {sendingEmail ? '발송 중...' : '발송'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 발주 생성 Sheet */}
      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>발주서 생성</SheetTitle>
          </SheetHeader>
          <div className='mt-4 flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium'>공급처 *</label>
              <Select value={createSupplierId} onValueChange={(v) => { setCreateSupplierId(v); loadProducts(v) }}>
                <SelectTrigger><SelectValue placeholder='공급처 선택' /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className='mb-2 flex items-center justify-between'>
                <label className='text-sm font-medium'>발주 항목</label>
                <Button variant='ghost' size='sm' onClick={addLineItem}>
                  <PlusIcon className='mr-1 size-3.5' /> 항목 추가
                </Button>
              </div>
              {loadingProducts && (
                <p className='text-xs text-muted-foreground py-2 text-center'>상품 불러오는 중...</p>
              )}
              <div className='flex flex-col gap-2'>
                <div className='grid grid-cols-[1fr_60px_80px_32px] gap-1 text-xs text-muted-foreground px-1'>
                  <span>상품</span><span className='text-center'>수량</span><span className='text-right'>단가</span><span />
                </div>
                {lineItems.map((item, idx) => (
                  <div key={idx} className='grid grid-cols-[1fr_60px_80px_32px] gap-1 items-center'>
                    <Select
                      value={item.productId}
                      onValueChange={(v) => {
                        const p = supplierProducts.find((p) => p.id === v)
                        updateLineItem(idx, 'productId', v)
                        if (p) updateLineItem(idx, 'price', p.purchase_price)
                      }}
                    >
                      <SelectTrigger className='h-8 text-xs'><SelectValue placeholder='상품 선택' /></SelectTrigger>
                      <SelectContent>
                        {supplierProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type='number' min={1} className='h-8 text-xs text-center'
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                    />
                    <Input
                      type='number' min={0} className='h-8 text-xs text-right'
                      value={item.price}
                      onChange={(e) => updateLineItem(idx, 'price', Number(e.target.value))}
                    />
                    <Button
                      variant='ghost' size='icon' className='size-8'
                      disabled={lineItems.length === 1}
                      onClick={() => removeLineItem(idx)}
                    >
                      <Trash2Icon className='size-3.5 text-destructive' />
                    </Button>
                  </div>
                ))}
                <div className='flex justify-end pt-2 text-sm font-semibold'>
                  합계: {lineTotal.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
          <SheetFooter className='mt-4'>
            <Button className='w-full' disabled={saving} onClick={handleCreatePurchase}>
              {saving ? '저장 중...' : '발주서 생성'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
