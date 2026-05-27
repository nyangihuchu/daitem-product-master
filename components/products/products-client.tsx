'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  UploadIcon, DownloadIcon, SearchIcon, XIcon, PlusIcon,
  ChevronLeftIcon, ChevronRightIcon, PencilIcon, Trash2Icon,
} from 'lucide-react'
import type { Product, Supplier, MarketListing } from '@/lib/types'
import { MARKET_CHANNELS, PRODUCT_STATUS_LABELS } from '@/lib/constants'

const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력하세요'),
  sku: z.string().min(1, 'SKU를 입력하세요'),
  internal_code: z.string().min(1, '내부코드를 입력하세요'),
  purchase_price: z.string().min(1, '구입가를 입력하세요'),
  status: z.enum(['selling', 'out_of_stock', 'discontinued', 'pending', 'reviewing']),
  stock_quantity: z.string().optional(),
})
type ProductForm = z.infer<typeof productSchema>

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  selling: 'default',
  out_of_stock: 'destructive',
  discontinued: 'secondary',
  pending: 'outline',
  reviewing: 'outline',
}

function marginRate(p: Product) {
  if (!p.base_selling_price || p.base_selling_price === 0) return null
  return ((p.base_selling_price - p.purchase_price) / p.base_selling_price * 100).toFixed(1)
}

interface Props {
  products: Product[]
  total: number
  page: number
  pageSize: number
  suppliers: Supplier[]
  categories: string[]
}

function buildUrl(params: {
  search?: string
  category?: string
  status?: string
  supplier_id?: string
  page?: number
}) {
  const sp = new URLSearchParams()
  if (params.search) sp.set('search', params.search)
  if (params.category && params.category !== 'all') sp.set('category', params.category)
  if (params.status && params.status !== 'all') sp.set('status', params.status)
  if (params.supplier_id && params.supplier_id !== 'all') sp.set('supplier_id', params.supplier_id)
  if (params.page && params.page > 1) sp.set('page', String(params.page))
  const qs = sp.toString()
  return `/dashboard/products${qs ? `?${qs}` : ''}`
}

export function ProductsClient({ products, total, page, pageSize, suppliers, categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') ?? ''
  const currentCategory = searchParams.get('category') ?? 'all'
  const currentStatus = searchParams.get('status') ?? 'all'
  const currentSupplierId = searchParams.get('supplier_id') ?? 'all'

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sheetMode, setSheetMode] = useState<'detail' | 'new' | 'edit'>('detail')
  const [listings, setListings] = useState<MarketListing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [uploadResult, setUploadResult] = useState<{
    success: number
    failed: number
    errors: Array<{ row: number, sku: string, message: string }>
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function navigate(params: Parameters<typeof buildUrl>[0]) {
    startTransition(() => {
      router.replace(buildUrl(params), { scroll: false })
    })
  }

  function getCurrentParams() {
    return {
      search: currentSearch || undefined,
      category: currentCategory !== 'all' ? currentCategory : undefined,
      status: currentStatus !== 'all' ? currentStatus : undefined,
      supplier_id: currentSupplierId !== 'all' ? currentSupplierId : undefined,
    }
  }

  function resetFilters() {
    navigate({ page: 1 })
  }

  const hasFilter = currentSearch || currentCategory !== 'all' || currentStatus !== 'all' || currentSupplierId !== 'all'

  const exportParams = new URLSearchParams()
  if (currentSearch) exportParams.set('search', currentSearch)
  if (currentCategory !== 'all') exportParams.set('category', currentCategory)
  if (currentStatus !== 'all') exportParams.set('status', currentStatus)
  if (currentSupplierId !== 'all') exportParams.set('supplier_id', currentSupplierId)
  const exportUrl = `/api/products/export${exportParams.toString() ? `?${exportParams.toString()}` : ''}`

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다')
      e.target.value = ''
      return
    }

    setUploadState('uploading')
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/products/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok) {
        setUploadResult(json)
      } else {
        setUploadResult({ success: 0, failed: 0, errors: [{ row: 0, sku: '', message: json.error ?? '업로드 실패' }] })
      }
    } catch {
      setUploadResult({ success: 0, failed: 0, errors: [{ row: 0, sku: '', message: '네트워크 오류가 발생했습니다' }] })
    } finally {
      setUploadState('done')
      e.target.value = ''
      startTransition(() => router.refresh())
    }
  }

  async function openDetail(p: Product) {
    setSelectedProduct(p)
    setSheetMode('detail')
    setListings([])
    setListingsLoading(true)
    try {
      const res = await fetch(`/api/products/${p.id}/listings`)
      if (res.ok) {
        const data = await res.json()
        setListings(data)
      }
    } finally {
      setListingsLoading(false)
    }
  }

  function openNew() {
    resetForm({ status: 'pending', purchase_price: '' })
    setSelectedProduct(null)
    setSheetMode('new')
  }

  function openEdit(p: Product) {
    resetForm({
      name: p.name,
      sku: p.sku,
      internal_code: p.internal_code,
      purchase_price: String(p.purchase_price),
      status: p.status,
      stock_quantity: String(p.stock_quantity),
    })
    setSelectedProduct(p)
    setSheetMode('edit')
  }

  function closeSheet() {
    setSelectedProduct(null)
    setSheetMode('detail')
    setListings([])
  }

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { status: 'pending', purchase_price: '' },
  })

  async function onSubmit(data: ProductForm) {
    const payload = {
      ...data,
      purchase_price: Number(data.purchase_price),
      stock_quantity: data.stock_quantity ? Number(data.stock_quantity) : 0,
    }

    try {
      const url = sheetMode === 'new'
        ? '/api/products'
        : `/api/products/${selectedProduct!.id}`
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
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setDeleteTarget(null)
      closeSheet()
      startTransition(() => router.refresh())
    } catch {
      // 삭제 실패 시 무시
    }
  }

  const isFormSheet = sheetMode === 'new' || sheetMode === 'edit'
  const sheetOpen = selectedProduct !== null || sheetMode === 'new'

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>상품 관리</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            전체 {total.toLocaleString()}개 상품
          </p>
        </div>
        <div className='flex gap-2'>
          <input
            ref={fileInputRef}
            type='file'
            accept='.xlsx,.xls,.csv'
            className='hidden'
            onChange={handleFileChange}
          />
          <Button
            variant='outline'
            size='sm'
            disabled={uploadState === 'uploading'}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className='mr-1.5 size-4' />
            {uploadState === 'uploading' ? '업로드 중...' : 'XLSX 업로드'}
          </Button>
          <a href={exportUrl} download>
            <Button variant='outline' size='sm'>
              <DownloadIcon className='mr-1.5 size-4' />
              XLSX 다운로드
            </Button>
          </a>
          <Button size='sm' onClick={openNew}>
            <PlusIcon className='mr-1.5 size-4' />
            상품 등록
          </Button>
        </div>
      </div>

      {/* 필터바 */}
      <div className='flex flex-wrap gap-2'>
        <div className='relative flex-1 min-w-[180px]'>
          <SearchIcon className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
          <Input
            className='pl-8'
            placeholder='상품명·SKU·내부코드 검색'
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate({ ...getCurrentParams(), search: e.currentTarget.value, page: 1 })
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget.value !== currentSearch) {
                navigate({ ...getCurrentParams(), search: e.currentTarget.value, page: 1 })
              }
            }}
          />
        </div>
        <Select value={currentCategory} onValueChange={(v) => navigate({ ...getCurrentParams(), category: v, page: 1 })}>
          <SelectTrigger className='w-[130px]'>
            <SelectValue placeholder='대분류' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 분류</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={currentStatus} onValueChange={(v) => navigate({ ...getCurrentParams(), status: v, page: 1 })}>
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='상태' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 상태</SelectItem>
            {Object.entries(PRODUCT_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={currentSupplierId} onValueChange={(v) => navigate({ ...getCurrentParams(), supplier_id: v, page: 1 })}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='공급처' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>전체 공급처</SelectItem>
            {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant='ghost' size='sm' onClick={resetFilters}>
            <XIcon className='mr-1 size-4' />
            초기화
          </Button>
        )}
      </div>

      {/* 테이블 */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>내부코드</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className='min-w-[200px]'>상품명</TableHead>
              <TableHead>분류</TableHead>
              <TableHead className='text-right'>구입가</TableHead>
              <TableHead className='text-right'>판매가</TableHead>
              <TableHead className='text-right'>마진율</TableHead>
              <TableHead className='text-right'>재고</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>마켓</TableHead>
              <TableHead className='w-[90px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className='text-muted-foreground py-12 text-center text-sm'>
                  {isPending ? '로딩 중...' : '검색 결과가 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const mr = marginRate(p)
                const registeredMarkets = (p.market_listings ?? []).map((l) => l.market_name)
                return (
                  <TableRow
                    key={p.id}
                    className='cursor-pointer'
                    onClick={() => openDetail(p)}
                  >
                    <TableCell className='font-mono text-xs'>{p.internal_code}</TableCell>
                    <TableCell className='font-mono text-xs'>{p.sku}</TableCell>
                    <TableCell className='font-medium'>{p.name}</TableCell>
                    <TableCell className='text-muted-foreground text-xs'>
                      {[p.category_large, p.category_medium].filter(Boolean).join(' > ')}
                    </TableCell>
                    <TableCell className='text-right text-sm'>
                      {p.purchase_price.toLocaleString()}원
                    </TableCell>
                    <TableCell className='text-right text-sm'>
                      {p.base_selling_price ? `${p.base_selling_price.toLocaleString()}원` : '-'}
                    </TableCell>
                    <TableCell className='text-right text-sm'>
                      {mr ? (
                        <span className={Number(mr) >= 30 ? 'text-green-600 dark:text-green-400' : Number(mr) >= 15 ? '' : 'text-red-600 dark:text-red-400'}>
                          {mr}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className='text-right text-sm'>
                      <span className={p.stock_quantity < p.min_stock_quantity ? 'font-bold text-red-600 dark:text-red-400' : ''}>
                        {p.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[p.status] ?? 'outline'} className='text-xs'>
                        {PRODUCT_STATUS_LABELS[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {MARKET_CHANNELS.map((ch) => (
                          <Badge
                            key={ch.value}
                            variant={registeredMarkets.includes(ch.value) ? 'default' : 'outline'}
                            className='px-1 py-0 text-[10px]'
                          >
                            {ch.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className='flex items-center gap-0.5'>
                        <Button variant='ghost' size='icon' className='size-8' onClick={() => openEdit(p)}>
                          <PencilIcon className='size-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-8 text-destructive hover:text-destructive'
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2Icon className='size-3.5' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground'>
          {total.toLocaleString()}개 중 {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} 표시
        </span>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline' size='icon' className='size-8'
            disabled={page <= 1 || isPending}
            onClick={() => navigate({ ...getCurrentParams(), page: page - 1 })}
          >
            <ChevronLeftIcon className='size-4' />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page + i - 2
            if (p > totalPages) return null
            return (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size='icon'
                className='size-8 text-xs'
                disabled={isPending}
                onClick={() => navigate({ ...getCurrentParams(), page: p })}
              >
                {p}
              </Button>
            )
          })}
          <Button
            variant='outline' size='icon' className='size-8'
            disabled={page >= totalPages || isPending}
            onClick={() => navigate({ ...getCurrentParams(), page: page + 1 })}
          >
            <ChevronRightIcon className='size-4' />
          </Button>
        </div>
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) closeSheet() }}>
        <SheetContent className='w-full sm:max-w-xl overflow-y-auto px-6'>
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'new' ? '상품 등록' : sheetMode === 'edit' ? '상품 수정' : '상품 상세'}
            </SheetTitle>
          </SheetHeader>

          {isFormSheet ? (
            <form onSubmit={handleSubmit(onSubmit)} className='mt-4 flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>상품명 *</label>
                <Input {...register('name')} placeholder='예) 전동드릴 세트' />
                {errors.name && <p className='text-destructive text-xs'>{errors.name.message}</p>}
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>SKU *</label>
                  <Input {...register('sku')} placeholder='예) 100-0016' />
                  {errors.sku && <p className='text-destructive text-xs'>{errors.sku.message}</p>}
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>내부코드 *</label>
                  <Input {...register('internal_code')} placeholder='예) PRD-001' />
                  {errors.internal_code && <p className='text-destructive text-xs'>{errors.internal_code.message}</p>}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>구입가 *</label>
                  <Input {...register('purchase_price')} type='number' min={0} placeholder='0' />
                  {errors.purchase_price && <p className='text-destructive text-xs'>{errors.purchase_price.message}</p>}
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium'>재고수량</label>
                  <Input {...register('stock_quantity')} type='number' min={0} placeholder='0' />
                </div>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-sm font-medium'>상태</label>
                <Select
                  defaultValue='pending'
                  onValueChange={(v) => setValue('status', v as ProductForm['status'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          ) : selectedProduct && (
            <div className='mt-4 flex flex-col gap-4'>
              <Tabs defaultValue='basic'>
                <TabsList className='w-full'>
                  <TabsTrigger value='basic' className='flex-1'>기본정보</TabsTrigger>
                  <TabsTrigger value='price' className='flex-1'>가격</TabsTrigger>
                  <TabsTrigger value='market' className='flex-1'>마켓등록</TabsTrigger>
                </TabsList>
                <TabsContent value='basic' className='flex flex-col gap-3 pt-4'>
                  {/* 이미지 섹션: 상품이미지 / 상세이미지 나란히 표시 */}
                  <div className='grid grid-cols-2 gap-3'>
                    {/* 상품이미지 */}
                    <div className='flex flex-col gap-1'>
                      <span className='text-muted-foreground text-xs font-medium'>상품이미지</span>
                      {selectedProduct.image_url ? (
                        <a
                          href={selectedProduct.image_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block'
                        >
                          <img
                            src={selectedProduct.image_url}
                            alt='상품이미지'
                            className='w-full max-h-48 rounded border object-contain bg-muted'
                          />
                        </a>
                      ) : (
                        /* 이미지 없을 때 placeholder */
                        <div className='flex w-full max-h-48 h-32 items-center justify-center rounded border bg-muted text-muted-foreground text-xs'>
                          이미지 없음
                        </div>
                      )}
                    </div>
                    {/* 상세이미지 */}
                    <div className='flex flex-col gap-1'>
                      <span className='text-muted-foreground text-xs font-medium'>상세이미지</span>
                      {selectedProduct.price_list_image_url ? (
                        <a
                          href={selectedProduct.price_list_image_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block'
                        >
                          <img
                            src={selectedProduct.price_list_image_url}
                            alt='상세이미지'
                            className='w-full max-h-48 rounded border object-contain bg-muted'
                          />
                        </a>
                      ) : (
                        /* 이미지 없을 때 placeholder */
                        <div className='flex w-full max-h-48 h-32 items-center justify-center rounded border bg-muted text-muted-foreground text-xs'>
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </div>
                  <dl className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                    {[
                      ['내부코드', selectedProduct.internal_code],
                      ['SKU', selectedProduct.sku],
                      ['품번', selectedProduct.supplier_item_no ?? '-'],
                      ['공급처', selectedProduct.supplier?.name ?? '-'],
                      ['상품명', selectedProduct.name],
                      ['브랜드', selectedProduct.brand ?? '-'],
                      ['모델명', selectedProduct.model_name ?? '-'],
                      ['대분류', selectedProduct.category_large ?? '-'],
                      ['중분류', selectedProduct.category_medium ?? '-'],
                      ['소분류', selectedProduct.category_small ?? '-'],
                      ['규격', selectedProduct.spec ?? '-'],
                      ['단위', selectedProduct.unit ?? '-'],
                      ['원산지', selectedProduct.origin ?? '-'],
                      ['납기일', selectedProduct.lead_time_desc ?? '-'],
                      ['반품가능', selectedProduct.is_returnable ? '가능' : '불가'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className='text-muted-foreground text-xs'>{label}</dt>
                        <dd className='font-medium text-sm'>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
                <TabsContent value='price' className='flex flex-col gap-3 pt-4'>
                  <dl className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                    {[
                      ['표준가격', selectedProduct.standard_price ? `${selectedProduct.standard_price.toLocaleString()}원` : '-'],
                      ['판매가격', selectedProduct.base_selling_price ? `${selectedProduct.base_selling_price.toLocaleString()}원` : '-'],
                      ['구입가격', `${selectedProduct.purchase_price.toLocaleString()}원`],
                      ['배송비', selectedProduct.shipping_fee ? `${selectedProduct.shipping_fee.toLocaleString()}원` : '-'],
                      ['마진율', marginRate(selectedProduct) ? `${marginRate(selectedProduct)}%` : '-'],
                      ['재고수량', `${selectedProduct.stock_quantity}개`],
                      ['최소재고', `${selectedProduct.min_stock_quantity}개`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className='text-muted-foreground text-xs'>{label}</dt>
                        <dd className='font-medium text-sm'>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
                <TabsContent value='market' className='pt-4'>
                  {listingsLoading ? (
                    <p className='text-muted-foreground text-sm'>로딩 중...</p>
                  ) : listings.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>등록된 마켓이 없습니다.</p>
                  ) : (
                    <ul className='flex flex-col gap-2 text-sm'>
                      {listings.map((l) => (
                        <li key={l.id} className='flex items-center justify-between border-b pb-2 last:border-0'>
                          <span className='font-medium'>{l.market_name}</span>
                          <span className='text-muted-foreground text-xs'>
                            {l.selling_price ? `${l.selling_price.toLocaleString()}원` : '-'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>

              {/* 하단 액션 */}
              <div className='flex gap-2 pt-2'>
                <Button variant='outline' size='sm' className='flex-1' onClick={() => openEdit(selectedProduct)}>
                  <PencilIcon className='mr-1.5 size-3.5' />
                  수정
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  className='flex-1'
                  onClick={() => setDeleteTarget(selectedProduct)}
                >
                  <Trash2Icon className='mr-1.5 size-3.5' />
                  삭제
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} 상품을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={uploadState === 'done'} onOpenChange={(open) => { if (!open) setUploadState('idle') }}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>업로드 결과</DialogTitle>
            {uploadResult && (
              <DialogDescription>
                성공 <span className='font-semibold text-green-600'>{uploadResult.success}건</span>
                {uploadResult.failed > 0 && (
                  <> · 실패 <span className='font-semibold text-red-600'>{uploadResult.failed}건</span></>
                )}
              </DialogDescription>
            )}
          </DialogHeader>
          {uploadResult && uploadResult.errors.length > 0 && (
            <div className='max-h-60 overflow-y-auto rounded border text-xs'>
              <table className='w-full'>
                <thead className='bg-muted sticky top-0'>
                  <tr>
                    <th className='px-2 py-1 text-left'>행</th>
                    <th className='px-2 py-1 text-left'>SKU</th>
                    <th className='px-2 py-1 text-left'>오류</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.errors.slice(0, 20).map((e, i) => (
                    <tr key={i} className='border-t'>
                      <td className='px-2 py-1 text-muted-foreground'>{e.row || '-'}</td>
                      <td className='px-2 py-1 font-mono'>{e.sku || '-'}</td>
                      <td className='px-2 py-1 text-red-600'>{e.message}</td>
                    </tr>
                  ))}
                  {uploadResult.errors.length > 20 && (
                    <tr className='border-t'>
                      <td colSpan={3} className='text-muted-foreground px-2 py-1 text-center'>
                        외 {uploadResult.errors.length - 20}건 더 있습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setUploadState('idle')}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
