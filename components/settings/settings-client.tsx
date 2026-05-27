'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { CheckIcon, XIcon, PlusIcon, SaveIcon, HistoryIcon, UserIcon } from 'lucide-react'
import { MARKET_CHANNELS, USER_ROLE_LABELS } from '@/lib/constants'
import type { User, MarketFee, UserRole } from '@/lib/types'

interface Props {
  users: User[]
  fees: MarketFee[]
}

// ─── 권한 매트릭스 데이터 (하드코딩) ────────────────────────────────────────

type Permission = { feature: string; admin: boolean; operator: boolean; viewer: boolean }

const PERMISSION_MATRIX: Permission[] = [
  { feature: '상품 등록·수정',     admin: true,  operator: true,  viewer: false },
  { feature: '상품 삭제',          admin: true,  operator: false, viewer: false },
  { feature: '공급처 관리',        admin: true,  operator: true,  viewer: false },
  { feature: '주문 처리',          admin: true,  operator: true,  viewer: false },
  { feature: '발주 생성·수정',     admin: true,  operator: true,  viewer: false },
  { feature: '수익 분석 조회',     admin: true,  operator: true,  viewer: true  },
  { feature: '정산 관리',         admin: true,  operator: false, viewer: false },
  { feature: '수수료율 설정',      admin: true,  operator: false, viewer: false },
  { feature: '사용자 초대·권한 변경', admin: true, operator: false, viewer: false },
  { feature: '알림 설정',          admin: true,  operator: true,  viewer: true  },
]

function PermIcon({ allowed }: { allowed: boolean }) {
  return allowed
    ? <CheckIcon className='w-4 h-4 text-green-600 mx-auto' />
    : <XIcon className='w-4 h-4 text-muted-foreground/40 mx-auto' />
}

export default function SettingsClient({ users: initialUsers, fees: initialFees }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ─── 사용자 관리 상태 ────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('operator')

  // ─── 수수료율 상태 ──────────────────────────────────────────────────────
  const [feeRates, setFeeRates] = useState<Record<string, string>>(
    Object.fromEntries(initialFees.map((f) => [f.market_name, String(f.fee_rate)]))
  )
  const [historySheetMarket, setHistorySheetMarket] = useState<string | null>(null)
  const [historyFees, setHistoryFees] = useState<MarketFee[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [savingMarket, setSavingMarket] = useState<string | null>(null)

  // ─── 프로필 알림 상태 ────────────────────────────────────────────────────
  const [notif, setNotif] = useState({ email: false, browser_push: false, kakao: false })
  const [notifLoading, setNotifLoading] = useState(false)

  const currentUser = users[0]

  useEffect(() => {
    fetch('/api/me/notification-settings')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setNotif(data) })
      .catch(() => {})
  }, [])

  async function handleNotifChange(key: 'email' | 'browser_push' | 'kakao', value: boolean) {
    if (key === 'browser_push' && value) {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('이 브라우저는 푸시 알림을 지원하지 않습니다')
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.')
        return
      }
      const swReg = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!swReg) {
        toast.warning('서비스 워커 미설치 — 브라우저 푸시를 사용하려면 SW 등록이 필요합니다')
        return
      }
      try {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) throw new Error('VAPID 키 미설정')
        const sub = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        })
        const json = sub.toJSON()
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
        })
      } catch {
        toast.error('푸시 구독 등록에 실패했습니다')
        return
      }
    }

    if (key === 'browser_push' && !value) {
      const swReg = await navigator.serviceWorker?.getRegistration('/sw.js')
      const sub = await swReg?.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        }).catch(() => {})
      }
    }

    const prev = notif
    setNotif((p) => ({ ...p, [key]: value }))
    setNotifLoading(true)
    try {
      const res = await fetch('/api/me/notification-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setNotif(prev)
      toast.error('알림 설정 저장에 실패했습니다')
    } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    if (!historySheetMarket) return
    setHistoryLoading(true)
    setHistoryFees([])
    fetch(`/api/market-fees/history?market_name=${historySheetMarket}`)
      .then((r) => r.json())
      .then((data: MarketFee[]) => setHistoryFees(Array.isArray(data) ? data : []))
      .catch(() => setHistoryFees([]))
      .finally(() => setHistoryLoading(false))
  }, [historySheetMarket])

  function handleInvite() {
    if (!inviteEmail.trim()) return
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: inviteEmail.trim(),
      role: inviteRole,
      notification_settings: null,
      created_at: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, newUser])
    setInviteEmail('')
    setInviteRole('operator')
    setInviteOpen(false)
  }

  function handleRoleChange(userId: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u))
  }

  async function handleFeeSave(marketName: string) {
    const rate = parseFloat(feeRates[marketName] ?? '0')
    if (isNaN(rate) || rate <= 0) return
    setSavingMarket(marketName)
    try {
      const res = await fetch('/api/market-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_name: marketName, fee_rate: rate }),
      })
      if (res.ok) {
        startTransition(() => router.refresh())
      }
    } finally {
      setSavingMarket(null)
    }
  }

  const historyData = historyFees.map((f) => ({ rate: f.fee_rate, applied_at: f.applied_at }))
  const historyMarketLabel = MARKET_CHANNELS.find((c) => c.value === historySheetMarket)?.label ?? ''

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>설정</h1>
        <p className='text-sm text-muted-foreground mt-1'>사용자 권한, 수수료율, 프로필 설정</p>
      </div>

      <Tabs defaultValue='users'>
        <TabsList className='grid w-full grid-cols-3 max-w-md'>
          <TabsTrigger value='users'>사용자 관리</TabsTrigger>
          <TabsTrigger value='fees'>수수료율</TabsTrigger>
          <TabsTrigger value='profile'>프로필</TabsTrigger>
        </TabsList>

        {/* ─── 사용자 관리 탭 ────────────────────────────────────────── */}
        <TabsContent value='users' className='space-y-6 mt-6'>
          {/* 권한 매트릭스 */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>역할별 권한 매트릭스</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-48'>기능</TableHead>
                    <TableHead className='text-center w-24'>관리자</TableHead>
                    <TableHead className='text-center w-24'>운영자</TableHead>
                    <TableHead className='text-center w-24'>조회 전용</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSION_MATRIX.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className='text-sm'>{row.feature}</TableCell>
                      <TableCell><PermIcon allowed={row.admin} /></TableCell>
                      <TableCell><PermIcon allowed={row.operator} /></TableCell>
                      <TableCell><PermIcon allowed={row.viewer} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 사용자 목록 */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base'>사용자 목록</CardTitle>
                <Button size='sm' onClick={() => setInviteOpen(true)}>
                  <PlusIcon className='w-4 h-4 mr-1.5' />
                  초대
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead className='w-40'>역할</TableHead>
                    <TableHead className='w-32'>가입일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className='text-sm'>
                        <div className='flex items-center gap-2'>
                          <UserIcon className='w-3.5 h-3.5 text-muted-foreground' />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                        >
                          <SelectTrigger className='h-7 text-xs w-32'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value} className='text-xs'>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='text-xs text-muted-foreground'>
                        {format(parseISO(user.created_at), 'yyyy.MM.dd', { locale: ko })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── 수수료율 탭 ──────────────────────────────────────────── */}
        <TabsContent value='fees' className='mt-6'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>마켓별 수수료율 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>마켓</TableHead>
                    <TableHead className='w-40'>수수료율 (%)</TableHead>
                    <TableHead className='w-32'>최종 수정일</TableHead>
                    <TableHead className='w-48 text-right'>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MARKET_CHANNELS.map((ch) => {
                    const fee = initialFees.find((f) => f.market_name === ch.value)
                    return (
                      <TableRow key={ch.value}>
                        <TableCell className='font-medium'>{ch.label}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <Input
                              type='number'
                              min='0'
                              max='100'
                              step='0.1'
                              className='h-7 w-24 text-sm'
                              value={feeRates[ch.value] ?? ''}
                              onChange={(e) => setFeeRates((p) => ({ ...p, [ch.value]: e.target.value }))}
                            />
                            <span className='text-sm text-muted-foreground'>%</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground'>
                          {fee ? format(parseISO(fee.applied_at), 'yyyy.MM.dd') : '-'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='h-7 text-xs'
                              onClick={() => setHistorySheetMarket(ch.value)}
                            >
                              <HistoryIcon className='w-3 h-3 mr-1' />
                              이력
                            </Button>
                            <Button
                              size='sm'
                              className='h-7 text-xs'
                              disabled={savingMarket === ch.value || isPending}
                              onClick={() => handleFeeSave(ch.value)}
                            >
                              <SaveIcon className='w-3 h-3 mr-1' />
                              {savingMarket === ch.value ? '저장 중...' : '저장'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── 프로필 탭 ────────────────────────────────────────────── */}
        <TabsContent value='profile' className='mt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>계정 정보</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>이메일</Label>
                  <p className='text-sm font-medium'>{currentUser.email}</p>
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>역할</Label>
                  <div>
                    <Badge variant='secondary'>{USER_ROLE_LABELS[currentUser.role]}</Badge>
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs text-muted-foreground'>가입일</Label>
                  <p className='text-sm'>{format(parseISO(currentUser.created_at), 'yyyy년 M월 d일', { locale: ko })}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>알림 수신 설정</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='prof-email' className='text-sm cursor-pointer'>이메일 알림</Label>
                  <Switch
                    id='prof-email'
                    checked={notif.email}
                    disabled={notifLoading}
                    onCheckedChange={(v) => handleNotifChange('email', v)}
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='prof-browser' className='text-sm cursor-pointer'>브라우저 푸시</Label>
                  <Switch
                    id='prof-browser'
                    checked={notif.browser_push}
                    disabled={notifLoading}
                    onCheckedChange={(v) => handleNotifChange('browser_push', v)}
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='prof-kakao' className='text-sm cursor-pointer'>카카오 알림톡</Label>
                  <Switch
                    id='prof-kakao'
                    checked={notif.kakao}
                    disabled={notifLoading}
                    onCheckedChange={(v) => handleNotifChange('kakao', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── 사용자 초대 Dialog ─────────────────────────────────────── */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>사용자 초대</DialogTitle>
            <DialogDescription>이메일로 새 사용자를 초대합니다.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='invite-email'>이메일 <span className='text-destructive'>*</span></Label>
              <Input
                id='invite-email'
                type='email'
                placeholder='user@example.com'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>역할</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setInviteOpen(false)}>취소</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>초대 전송</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 수수료 이력 Sheet ──────────────────────────────────────── */}
      <Sheet open={!!historySheetMarket} onOpenChange={(v) => !v && setHistorySheetMarket(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{historyMarketLabel} 수수료율 이력</SheetTitle>
            <SheetDescription>수수료율 변경 이력을 확인합니다.</SheetDescription>
          </SheetHeader>
          <div className='mt-6'>
            {historyLoading ? (
              <p className='text-muted-foreground text-sm'>로딩 중...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>적용일</TableHead>
                    <TableHead className='text-right'>수수료율</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-muted-foreground text-center text-sm py-6'>이력이 없습니다</TableCell>
                    </TableRow>
                  ) : (
                    historyData.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell className='text-sm'>{format(parseISO(h.applied_at), 'yyyy.MM.dd')}</TableCell>
                        <TableCell className='text-right text-sm font-medium'>{h.rate}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
