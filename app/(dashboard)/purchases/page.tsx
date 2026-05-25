import type { Metadata } from 'next'
import { getPurchases } from '@/lib/services/purchase-service'
import { getSuppliers } from '@/lib/services/supplier-service'
import { PurchasesClient } from '@/components/purchases/purchases-client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: '발주 관리' }

export default async function PurchasesPage() {
  const [purchases, suppliers] = await Promise.all([
    getPurchases({ limit: 50 }),
    getSuppliers(),
  ])
  return <PurchasesClient purchases={purchases} suppliers={suppliers} />
}
