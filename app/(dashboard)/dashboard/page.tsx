import type { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCartIcon,
  ClipboardListIcon,
  TrendingUpIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  CalendarClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react'
import { ChannelSalesChart } from '@/components/charts/channel-sales-chart'
import {
  getDummyDashboardStats,
  getDummyProducts,
  getDummySchedules,
} from '@/lib/dummy-data'
import { SCHEDULE_TYPE_LABELS } from '@/lib/constants'

export const metadata: Metadata = { title: '대시보드' }

function formatKRW(value: number) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억원`
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만원`
  return `${value.toLocaleString()}원`
}

function diffDays(dateStr: string) {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const stats = getDummyDashboardStats()
  const products = getDummyProducts()
  const schedules = getDummySchedules()

  const lowStockProducts = products.filter(
    (p) => p.stock_quantity < p.min_stock_quantity && p.status !== 'discontinued'
  )

  const upcomingSchedules = schedules
    .filter((s) => !s.is_completed)
    .map((s) => ({ ...s, dday: diffDays(s.scheduled_at) }))
    .filter((s) => s.dday <= 7)
    .sort((a, b) => a.dday - b.dday)
    .slice(0, 5)

  const KPI_ITEMS = [
    {
      title: '이달 매출',
      value: formatKRW(stats.totalRevenue),
      change: stats.revenueChange,
      icon: TrendingUpIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: '이달 주문',
      value: `${stats.totalOrders}건`,
      change: stats.ordersChange,
      icon: ShoppingCartIcon,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: '미정산 잔액',
      value: formatKRW(stats.pendingSettlement),
      change: null,
      icon: DollarSignIcon,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: '미처리 발주',
      value: `${lowStockProducts.length}건`,
      change: null,
      icon: ClipboardListIcon,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50 dark:bg-purple-950',
    },
  ]

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>대시보드</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          DAITEM 운영 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* KPI 카드 4종 */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {KPI_ITEMS.map((item) => (
          <Card key={item.title}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-muted-foreground text-sm font-medium'>
                {item.title}
              </CardTitle>
              <div className={`flex size-9 items-center justify-center rounded-lg ${item.iconBg}`}>
                <item.icon className={`size-4 ${item.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{item.value}</div>
              {item.change !== null && (
                <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                  {(item.change ?? 0) >= 0 ? (
                    <ArrowUpIcon className='size-3 text-green-500' />
                  ) : (
                    <ArrowDownIcon className='size-3 text-red-500' />
                  )}
                  <span className={(item.change ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {Math.abs(item.change ?? 0)}%
                  </span>
                  전월 대비
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 메인 영역: 좌(2/3) + 우(1/3) */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* 좌: 채널별 매출 차트 */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>채널별 매출</CardTitle>
            <CardDescription>이달 마켓 채널별 매출 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelSalesChart />
          </CardContent>
        </Card>

        {/* 우: 임박 일정 */}
        <Card>
          <CardHeader className='flex flex-row items-center gap-2 pb-3'>
            <CalendarClockIcon className='text-muted-foreground size-4' />
            <CardTitle className='text-base'>임박 일정</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className='text-muted-foreground py-6 text-center text-sm'>
                7일 이내 일정 없음
              </p>
            ) : (
              <ul className='flex flex-col gap-3'>
                {upcomingSchedules.map((s) => (
                  <li key={s.id} className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium'>{s.title}</p>
                      <p className='text-muted-foreground text-xs'>
                        {SCHEDULE_TYPE_LABELS[s.type]}
                      </p>
                    </div>
                    <Badge
                      variant={s.dday <= 1 ? 'destructive' : s.dday <= 3 ? 'default' : 'secondary'}
                      className='shrink-0 text-xs'
                    >
                      {s.dday === 0 ? 'D-day' : s.dday < 0 ? `D+${Math.abs(s.dday)}` : `D-${s.dday}`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 재고 부족 경고 */}
      <Card>
        <CardHeader className='flex flex-row items-center gap-2 pb-3'>
          <AlertTriangleIcon className='size-4 text-orange-500' />
          <CardTitle className='text-base'>재고 부족 상품</CardTitle>
          <Badge variant='destructive' className='ml-auto text-xs'>
            {lowStockProducts.length}건
          </Badge>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className='text-muted-foreground py-4 text-center text-sm'>
              재고 부족 상품 없음
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-muted-foreground border-b text-xs'>
                    <th className='pb-2 text-left font-medium'>상품명</th>
                    <th className='pb-2 text-left font-medium'>SKU</th>
                    <th className='pb-2 text-right font-medium'>현재고</th>
                    <th className='pb-2 text-right font-medium'>최소재고</th>
                    <th className='pb-2 text-right font-medium'>공급처</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className='border-b last:border-0'>
                      <td className='py-2 font-medium'>{p.name}</td>
                      <td className='text-muted-foreground py-2'>{p.sku}</td>
                      <td className='py-2 text-right text-red-600 dark:text-red-400'>
                        {p.stock_quantity}
                      </td>
                      <td className='text-muted-foreground py-2 text-right'>
                        {p.min_stock_quantity}
                      </td>
                      <td className='text-muted-foreground py-2 text-right'>
                        {p.supplier?.name ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
