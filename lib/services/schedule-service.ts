import { createClient } from '@/lib/supabase/server'
import type { Schedule, ScheduleType } from '@/lib/types'

const VALID_TYPES: ScheduleType[] = ['supplier', 'market', 'internal', 'customer']

interface GetSchedulesParams {
  type?: string
  is_completed?: boolean
  limit?: number
}

interface CreateScheduleInput {
  type: ScheduleType
  title: string
  description?: string
  scheduled_at: string
  notify_days_before: number[]
  assigned_user_id?: string
}

type UpdateSchedulePatch = Partial<{
  type: ScheduleType
  title: string
  description: string | null
  scheduled_at: string
  notify_days_before: number[]
  is_completed: boolean
  assigned_user_id: string | null
}>

export async function getSchedules({
  type,
  is_completed,
  limit = 200,
}: GetSchedulesParams = {}): Promise<Schedule[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('schedules')
    .select('*, assigned_user:users(id, email)')
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (type) query = query.eq('type', type)
  if (is_completed !== undefined) query = query.eq('is_completed', is_completed)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as Schedule[]
}

export async function createSchedule(input: CreateScheduleInput): Promise<Schedule> {
  if (!(VALID_TYPES as string[]).includes(input.type)) {
    throw new Error('유효하지 않은 일정 유형입니다')
  }
  if (!input.title?.trim()) {
    throw new Error('제목은 필수입니다')
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('schedules')
    .insert({
      type: input.type,
      title: input.title.trim(),
      description: input.description ?? null,
      scheduled_at: input.scheduled_at,
      notify_days_before: input.notify_days_before ?? [],
      assigned_user_id: input.assigned_user_id ?? null,
    })
    .select('*, assigned_user:users(id, email)')
    .single()

  if (error) throw new Error(error.message)
  return data as Schedule
}

export async function updateSchedule(id: string, patch: UpdateSchedulePatch): Promise<Schedule> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('schedules')
    .update(patch)
    .eq('id', id)
    .select('*, assigned_user:users(id, email)')
    .single()

  if (error) throw new Error(error.message)
  return data as Schedule
}

export async function deleteSchedule(id: string): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('schedules')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
