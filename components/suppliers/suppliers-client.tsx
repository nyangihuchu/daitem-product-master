'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SearchIcon, PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { Supplier } from '@/lib/types'
import { PAYMENT_TERM_LABELS } from '@/lib/constants'

const supplierSchema = z.object({
  name: z.string().min(1, '공급처명을 입력하세요'),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  payment_term: z.enum(['prepaid', 'postpaid', 'monthly']),
  lead_time_days: z.string().optional(),
  memo: z.string().optional(),
})
type SupplierForm = z.infer<typeof supplierSchema>

const PAYMENT_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  prepaid: 'default',
  postpaid: 'secondary',
  monthly: 'outline',
}

interface Props {
  suppliers: Supplier[]
}

export function SuppliersClient({ suppliers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [filterTerm, setFilterTerm] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [sheetMode, setSheetMode] = useState<'detail' | 'new' | 'edit'>('detail')

  const filtered = suppliers.filter((s) => {
    if (search && !s.name.includes(search) && !(s.contact_name ?? '').includes(search)) return false
    if (filterTerm !== 'all' && s.payment_term !== filterTerm) return false
    return true
  })

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setValue,
    setError,
    formState: { errors },
  } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { payment_term: 'postpaid' },
  })

  function openNew() {
    resetForm({ payment_term: 'postpaid' })
    setSelectedSupplier(null)
    setSheetMode('new')
  }

  function openEdit(s: Supplier) {
    resetForm({
      name: s.name,
      contact_name: s.contact_name ?? '',
      contact_phone: s.contact_phone ?? '',
      payment_term: s.payment_term,
      lead_time_days: s.lead_time_days != null ? String(s.lead_time_days) : undefined,
      memo: s.memo ?? '',
    })
    setSelectedSupplier(s)
    setSheetMode('edit')
  }

  function closeSheet() {
    setSelectedSupplier(null)
    setSheetMode('detail')
  }

  async function onSubmit(data: SupplierForm) {
    const payload = {
      ...data,
      lead_time_days: data.lead_time_days ? parseInt(data.lead_time_days, 10) : null,
    }

    try {
      const url = sheetMode === 'new'
        ? '/api/suppliers'
        : `/api/suppliers/${selectedSupplier!.id}`
      const method = sheetMode === 'new' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        setError('root', { message: json.error ?? '저장에 실패했습니다' })
        return
      }

      closeSheet()
      startTransition(() => router.refresh())
    } catch {
      setError('root', { message: '네트워크 오류가 발생했습니다' })
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      closeSheet()
      startTransition(() => router.refresh())
    } catch {
      // 삭제 실패 시 무시
    }
  }

  const isFormSheet = sheetMode === 'new' || sheetMode === 'edit'
  const sheetOpen = selectedSupplier !== null || sheetMode === 'new'

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>공급처 관리</h1>
          <p className='text-muted-foreground mt-1 text-sm'>전체 {suppliers.length}개 공급처</p>
        </div>
        <Button size='sm' onClick={openNew}>
          <PlusIcon className='mr-1.5 size-4' />
          공급처 등록
        </Button>
      </div>

      {/* 필터바 */}
      <div className='flex flex-wrap gap-2'>
        <div className='relative flex-1 min-w-[180px]'>
          <SearchIcon className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            className='pl-8'
            placeholder='공급처명·담당자 검색'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterTerm} onValueChange={setFilterTerm}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='계약조건' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 조건</SelectItem>
            {Object.entries(PAYMENT_TERM_LABELS).map(([k, v]) => (
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
              <TableHead className='min-w-[160px]'>공급처명</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>계약조건</TableHead>
              <TableHead className='text-right'>리드타임</TableHead>
              <TableHead className='w-[80px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-muted-foreground py-12 text-center text-sm'>
                  검색 결과가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className='cursor-pointer'
                  onClick={() => { setSelectedSupplier(s); setSheetMode('detail') }}
                >
                  <TableCell className='font-medium'>{s.name}</TableCell>
                  <TableCell className='text-muted-foreground'>{s.contact_name ?? '-'}</TableCell>
                  <TableCell className='text-muted-foreground font-mono text-xs'>{s.contact_phone ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={PAYMENT_VARIANT[s.payment_term]}>
                      {PAYMENT_TERM_LABELS[s.payment_term]}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right text-sm'>
                    {s.lead_time_days != null ? `${s.lead_time_days}일` : '-'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button variant='ghost' size='icon' className='size-8' onClick={() => openEdit(s)}>
                      <PencilIcon className='size-3.5' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) closeSheet() }}>
        <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'new' ? '공급처 등록' : sheetMode === 'edit' ? '공급처 수정' : '공급처 상세'}
            </SheetTitle>
          </SheetHeader>

          {isFormSheet ? (
            <form onSubmit={handleSubmit(onSubmit)} className='mt-4 flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>공급처명 *</label>
                <Input {...register('name')} placeholder='예) 한국공구산업(주)' />
                {errors.name && <p className='text-destructive text-xs'>{errors.name.message}</p>}
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>담당자</label>
                  <Input {...register('contact_name')} placeholder='홍길동' />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>연락처</label>
                  <Input {...register('contact_phone')} placeholder='02-0000-0000' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>계약조건</label>
                  <Select
                    defaultValue='postpaid'
                    onValueChange={(v) => setValue('payment_term', v as SupplierForm['payment_term'])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_TERM_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>리드타임 (일)</label>
                  <Input {...register('lead_time_days')} type='number' min={0} placeholder='7' />
                </div>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>메모</label>
                <Input {...register('memo')} placeholder='특이사항 입력' />
              </div>
              {errors.root && (
                <p className='text-destructive text-sm'>{errors.root.message}</p>
              )}
              <SheetFooter className='mt-2'>
                <Button type='submit' className='w-full' disabled={isPending}>
                  {isPending ? '저장 중...' : '저장'}
                </Button>
              </SheetFooter>
            </form>
          ) : selectedSupplier && (
            <div className='mt-4 flex flex-col gap-4'>
              <Tabs defaultValue='info'>
                <TabsList className='w-full'>
                  <TabsTrigger value='info' className='flex-1'>담당자정보</TabsTrigger>
                  <TabsTrigger value='contract' className='flex-1'>계약조건</TabsTrigger>
                  <TabsTrigger value='products' className='flex-1'>연계상품</TabsTrigger>
                </TabsList>
                <TabsContent value='info' className='pt-4'>
                  <dl className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                    {[
                      ['공급처명', selectedSupplier.name],
                      ['담당자', selectedSupplier.contact_name ?? '-'],
                      ['연락처', selectedSupplier.contact_phone ?? '-'],
                      ['메모', selectedSupplier.memo ?? '-'],
                    ].map(([label, value]) => (
                      <div key={label} className='col-span-2'>
                        <dt className='text-muted-foreground text-xs'>{label}</dt>
                        <dd className='font-medium'>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
                <TabsContent value='contract' className='pt-4'>
                  <dl className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                    {[
                      ['계약조건', PAYMENT_TERM_LABELS[selectedSupplier.payment_term]],
                      ['리드타임', selectedSupplier.lead_time_days != null ? `${selectedSupplier.lead_time_days}일` : '-'],
                      ['등록일', selectedSupplier.created_at.slice(0, 10)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className='text-muted-foreground text-xs'>{label}</dt>
                        <dd className='font-medium'>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
                <TabsContent value='products' className='pt-4'>
                  <p className='text-muted-foreground text-sm'>상품 API 연동 예정 (Task 017)</p>
                </TabsContent>
              </Tabs>

              {/* 하단 액션 버튼 */}
              <div className='flex gap-2 pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1'
                  onClick={() => openEdit(selectedSupplier)}
                >
                  <PencilIcon className='mr-1.5 size-3.5' />
                  수정
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive' size='sm' className='flex-1'>
                      <Trash2Icon className='mr-1.5 size-3.5' />
                      삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>공급처를 삭제하시겠습니까?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedSupplier.name} 공급처를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(selectedSupplier.id)}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
