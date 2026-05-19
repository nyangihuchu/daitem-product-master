import type { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { StatCard } from '@/lib/types'
import {
  UsersIcon,
  TrendingUpIcon,
  DollarSignIcon,
  ActivityIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const STATS: StatCard[] = [
  {
    title: 'Total Users',
    value: '12,345',
    change: 12,
    changeLabel: 'vs last month',
    icon: 'Users',
  },
  {
    title: 'Revenue',
    value: '$45,231',
    change: 8.2,
    changeLabel: 'vs last month',
    icon: 'DollarSign',
  },
  {
    title: 'Active Sessions',
    value: '3,421',
    change: -2.1,
    changeLabel: 'vs last month',
    icon: 'Activity',
  },
  {
    title: 'Growth Rate',
    value: '18.6%',
    change: 4.5,
    changeLabel: 'vs last quarter',
    icon: 'TrendingUp',
  },
]

const ICON_MAP = {
  Users: UsersIcon,
  DollarSign: DollarSignIcon,
  Activity: ActivityIcon,
  TrendingUp: TrendingUpIcon,
}

const RECENT_ACTIVITY = [
  { user: 'Alice Kim', action: '새 프로젝트 생성', time: '2분 전', status: 'new' as const },
  { user: 'Bob Lee', action: '파일 업로드', time: '15분 전', status: 'upload' as const },
  { user: 'Carol Park', action: '설정 변경', time: '1시간 전', status: 'update' as const },
  { user: 'David Jung', action: '계정 생성', time: '2시간 전', status: 'new' as const },
  { user: 'Eva Choi', action: '보고서 다운로드', time: '3시간 전', status: 'download' as const },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground mt-1">
          서비스 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = ICON_MAP[stat.icon as keyof typeof ICON_MAP]
          const isPositive = (stat.change ?? 0) >= 0

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {Icon && (
                  <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                    <Icon className="size-4" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== undefined && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <span
                      className={
                        isPositive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {isPositive ? '+' : ''}
                      {stat.change}%
                    </span>
                    {stat.changeLabel}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>최근 사용자 활동 현황입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {RECENT_ACTIVITY.map((activity, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src="" alt={activity.user} />
                      <AvatarFallback className="text-xs">
                        {activity.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.action}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      {activity.time}
                    </span>
                    <Badge
                      variant={activity.status === 'new' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
                {index < RECENT_ACTIVITY.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>로딩 상태 예시</CardTitle>
          <CardDescription>Skeleton 컴포넌트 데모입니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  )
}
