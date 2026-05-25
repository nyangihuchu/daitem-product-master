import type { Metadata } from 'next'
import { getProducts, getCategories } from '@/lib/services/product-service'
import { getSuppliers } from '@/lib/services/supplier-service'
import { ProductsClient } from '@/components/products/products-client'
import type { PageProps } from '@/lib/types'

export const metadata: Metadata = { title: '상품 관리' }

const PAGE_SIZE = 20

type SearchParams = {
  page?: string
  search?: string
  category?: string
  status?: string
  supplier_id?: string
}

export default async function ProductsPage({ searchParams }: PageProps<Record<string, string>, SearchParams>) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)

  const [{ data, total }, suppliers, categories] = await Promise.all([
    getProducts({
      page,
      pageSize: PAGE_SIZE,
      search: sp.search,
      category: sp.category,
      status: sp.status,
      supplierId: sp.supplier_id,
    }),
    getSuppliers(),
    getCategories(),
  ])

  return (
    <ProductsClient
      products={data}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      suppliers={suppliers}
      categories={categories}
    />
  )
}
