import type { Metadata } from 'next'
import { getSuppliers } from '@/lib/services/supplier-service'
import { SuppliersClient } from '@/components/suppliers/suppliers-client'

export const metadata: Metadata = { title: '공급처 관리' }

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()
  return <SuppliersClient suppliers={suppliers} />
}
