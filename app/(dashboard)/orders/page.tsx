import type { Metadata } from 'next'
import { getOrders } from '@/lib/services/order-service'
import { OrdersClient } from '@/components/orders/orders-client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: '주문 관리' }

export default async function OrdersPage() {
  const orders = await getOrders({ limit: 50 })
  return <OrdersClient orders={orders} />
}
