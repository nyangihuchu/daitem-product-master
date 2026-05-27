'use client'

import { useState, useRef, useMemo } from 'react'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { DayButtonProps } from 'react-day-picker'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusIcon, BellIcon, CalendarDaysIcon, EditIcon } from 'lucide-react'
import { SCHEDULE_TYPE_LABELS } from '@/lib/constants'
import type { Schedule, ScheduleType } from '@/lib/types'

interface Props {
  schedules: Schedule[]
}

const TYPE_COLOR: Record<ScheduleType, string> = {
  supplier: 'bg-blue-500',
  market:   'bg-green-500',
  internal: 'bg-yellow-500',
  customer: 'bg-purple-500',
}

const TYPE_BADGE: Record<ScheduleType, string> = {
  supplier: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  market:   'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  internal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  customer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const NOTIFY_DAYS_OPTIONS = [1, 3, 7]

function getDday(scheduledAt: string): { label: string; variant: 'destructive' | 'default' | 'secondary' } {
  const diff = differenceInCalendarDays(parseISO(scheduledAt), new Date())
  if (diff === 0) return { label: 'D-0', variant: 'destructive' }
  if (diff < 0) return { label: `D+${Math.abs(diff)}`, variant: 'secondary' }
  return { label: `D-${diff}`, variant: diff <= 3 ? 'destructive' : 'default' }
}

interface ScheduleForm {
  title: string
  type: ScheduleType
  scheduled_at: string
  description: string
  notify_days_before: number[]
}

const EMPTY_FORM: ScheduleForm = {
  title: '',
  type: 'internal',
  scheduled_at: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  notify_days_before: [1],
}

export default function SchedulesClient({ schedules: initialSchedules }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Schedule | null>(null)
  const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM)

  const [notifSettings, setNotifSettings] = useState({
    email: true,
    browser_push: false,
    kakao: false,
  })
  const [defaultNotifyDays, setDefaultNotifyDays] = useState('1')

  // 날짜별 일정 맵
  const schedulesByDate = useMemo(() =>
    schedules.reduce<Record<string, Schedule[]>>((acc, s) => {
      const key = s.scheduled_at.slice(0, 10)
      acc[key] = [...(acc[key] ?? []), s]
      return acc
    }, {}),
    [schedules]
  )

  // ref: DayButton 커스텀 컴포넌트에서 최신 schedulesByDate 참조
  const schedulesByDateRef = useRef(schedulesByDate)
  schedulesByDateRef.current = schedulesByDate

  // 캘린더 dot 표시용 커스텀 DayButton (useMemo로 안정적인 참조 유지)
  const CustomDayButton = useMemo(() => {
    function DayBtn({ day, modifiers, children, ...props }: DayButtonProps) {
      const key = format(day.date, 'yyyy-MM-dd')
      const daySchedules = schedulesByDateRef.current[key] ?? []
      return (
        <CalendarDayButton day={day} modifiers={modifiers} {...props}>
          {children}
          {daySchedules.length > 0 && (
            <div className='flex gap-0.5 justify-center'>
              {daySchedules.slice(0, 3).map((s, i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${TYPE_COLOR[s.type as ScheduleType] ?? 'bg-gray-400'}`}
                />
              ))}
            </div>
          )}
        </CalendarDayButton>
      )
    }
    return DayBtn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ref를 통해 항상 최신값 접근, 컴포넌트 타입 안정성 유지

  // 선택된 날짜의 일정
  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const selectedSchedules = schedulesByDate[selectedKey] ?? []

  // D-day 사이드패널: 오늘 기준 7일 이내
  const today = new Date()
  const upcomingSchedules = schedules
    .filter((s) => {
      const diff = differenceInCalendarDays(parseISO(s.scheduled_at), today)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  function openCreateDialog() {
    setEditTarget(null)
    setForm({
      ...EMPTY_FORM,
      scheduled_at: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : EMPTY_FORM.scheduled_at,
    })
    setDialogOpen(true)
  }

  function openEditDialog(schedule: Schedule) {
    setEditTarget(schedule)
    setForm({
      title: schedule.title,
      type: schedule.type,
      scheduled_at: schedule.scheduled_at,
      description: schedule.description ?? '',
      notify_days_before: schedule.notify_days_before,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    if (editTarget) {
      const res = await fetch(`/api/schedules/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setSchedules((prev) => prev.map((s) => (s.id === editTarget.id ? data : s)))
    } else {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setSchedules((prev) => [...prev, data])
    }
    setDialogOpen(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    setDialogOpen(false)
  }

  function toggleNotifyDay(day: number) {
    setForm((prev) => ({
      ...prev,
      notify_days_before: prev.notify_days_before.includes(day)
        ? prev.notify_days_before.filter((d) => d !== day)
        : [...prev.notify_days_before, day],
    }))
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>일정·알림</h1>
          <p className='text-sm text-muted-foreground mt-1'>납품·마켓·내부 일정 관리 및 알림 설정</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className='w-4 h-4 mr-2' />
          일정 등록
        </Button>
      </div>

      {/* 유형 범례 */}
      <div className='flex flex-wrap gap-3'>
        {(Object.keys(SCHEDULE_TYPE_LABELS) as ScheduleType[]).map((type) => (
          <div key={type} className='flex items-center gap-1.5 text-sm'>
            <span className={`w-2.5 h-2.5 rounded-full ${TYPE_COLOR[type]}`} />
            <span className='text-muted-foreground'>{SCHEDULE_TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 캘린더 + 선택 날짜 일정 목록 (2/3) */}
        <div className='lg:col-span-2 space-y-4'>
          <Card>
            <CardContent className='pt-4 flex justify-center'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ko}
                components={{ DayButton: CustomDayButton }}
                className='rounded-md'
              />
            </CardContent>
          </Card>

          {/* 선택한 날짜 일정 목록 */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base flex items-center gap-2'>
                <CalendarDaysIcon className='w-4 h-4' />
                {selectedDate
                  ? format(selectedDate, 'M월 d일 (EEE)', { locale: ko })
                  : '날짜 선택'}
                {selectedSchedules.length > 0 && (
                  <Badge variant='secondary'>{selectedSchedules.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSchedules.length === 0 ? (
                <p className='text-sm text-muted-foreground py-4 text-center'>
                  이 날짜에 등록된 일정이 없습니다.
                </p>
              ) : (
                <ul className='space-y-2'>
                  {selectedSchedules.map((s) => (
                    <li
                      key={s.id}
                      className='flex items-start justify-between gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors'
                    >
                      <div className='flex items-start gap-2 min-w-0'>
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLOR[s.type as ScheduleType]}`} />
                        <div className='min-w-0'>
                          <p className='text-sm font-medium truncate'>{s.title}</p>
                          {s.description && (
                            <p className='text-xs text-muted-foreground mt-0.5 truncate'>{s.description}</p>
                          )}
                          <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-1 ${TYPE_BADGE[s.type as ScheduleType]}`}>
                            {SCHEDULE_TYPE_LABELS[s.type]}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='flex-shrink-0 h-7 w-7'
                        onClick={() => openEditDialog(s)}
                      >
                        <EditIcon className='w-3.5 h-3.5' />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 우측 사이드패널 (1/3) */}
        <div className='space-y-4'>
          {/* D-day 임박 일정 */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>임박 일정</CardTitle>
              <p className='text-xs text-muted-foreground'>오늘 기준 7일 이내</p>
            </CardHeader>
            <CardContent>
              {upcomingSchedules.length === 0 ? (
                <p className='text-sm text-muted-foreground py-2 text-center'>임박 일정 없음</p>
              ) : (
                <ul className='space-y-2'>
                  {upcomingSchedules.map((s) => {
                    const dday = getDday(s.scheduled_at)
                    return (
                      <li
                        key={s.id}
                        className='flex items-start gap-2 p-2 rounded-md border cursor-pointer hover:bg-accent/50 transition-colors'
                        onClick={() => {
                          setSelectedDate(parseISO(s.scheduled_at))
                          openEditDialog(s)
                        }}
                      >
                        <Badge variant={dday.variant} className='flex-shrink-0 text-xs'>
                          {dday.label}
                        </Badge>
                        <div className='min-w-0'>
                          <p className='text-xs font-medium truncate'>{s.title}</p>
                          <p className='text-xs text-muted-foreground'>
                            {format(parseISO(s.scheduled_at), 'M/d (EEE)', { locale: ko })}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base flex items-center gap-2'>
                <BellIcon className='w-4 h-4' />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='notif-email' className='text-sm cursor-pointer'>이메일 알림</Label>
                  <Switch
                    id='notif-email'
                    checked={notifSettings.email}
                    onCheckedChange={(v) => setNotifSettings((p) => ({ ...p, email: v }))}
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='notif-browser' className='text-sm cursor-pointer'>브라우저 푸시</Label>
                  <Switch
                    id='notif-browser'
                    checked={notifSettings.browser_push}
                    onCheckedChange={(v) => setNotifSettings((p) => ({ ...p, browser_push: v }))}
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='notif-kakao' className='text-sm cursor-pointer'>카카오 알림톡</Label>
                  <Switch
                    id='notif-kakao'
                    checked={notifSettings.kakao}
                    onCheckedChange={(v) => setNotifSettings((p) => ({ ...p, kakao: v }))}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>기본 사전 알림</Label>
                <Select value={defaultNotifyDays} onValueChange={setDefaultNotifyDays}>
                  <SelectTrigger className='h-8 text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>1일 전</SelectItem>
                    <SelectItem value='3'>3일 전</SelectItem>
                    <SelectItem value='7'>7일 전</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 일정 등록/수정 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{editTarget ? '일정 수정' : '일정 등록'}</DialogTitle>
            <DialogDescription className='sr-only'>
              {editTarget ? '기존 일정을 수정합니다.' : '새 일정을 등록합니다.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='title'>제목 <span className='text-destructive'>*</span></Label>
              <Input
                id='title'
                placeholder='일정 제목을 입력하세요'
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label>유형</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v as ScheduleType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(SCHEDULE_TYPE_LABELS) as [ScheduleType, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='scheduled_at'>일정일</Label>
                <Input
                  id='scheduled_at'
                  type='date'
                  value={form.scheduled_at}
                  onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='description'>메모</Label>
              <Textarea
                id='description'
                placeholder='추가 설명 (선택)'
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className='space-y-1.5'>
              <Label>사전 알림</Label>
              <div className='flex gap-4'>
                {NOTIFY_DAYS_OPTIONS.map((day) => (
                  <div key={day} className='flex items-center gap-1.5'>
                    <Checkbox
                      id={`notify-${day}`}
                      checked={form.notify_days_before.includes(day)}
                      onCheckedChange={() => toggleNotifyDay(day)}
                    />
                    <Label htmlFor={`notify-${day}`} className='text-sm cursor-pointer'>
                      {day}일 전
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            {editTarget && (
              <Button variant='destructive' onClick={() => handleDelete(editTarget.id)}>
                삭제
              </Button>
            )}
            <Button variant='outline' onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {editTarget ? '수정' : '등록'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
