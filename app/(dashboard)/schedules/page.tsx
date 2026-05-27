import { getSchedules } from '@/lib/services/schedule-service'
import SchedulesClient from '@/components/schedules/schedules-client'

export default async function SchedulesPage() {
  const schedules = await getSchedules({ limit: 200 }).catch(() => [])
  return <SchedulesClient schedules={schedules} />
}
