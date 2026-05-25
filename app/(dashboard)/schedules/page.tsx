import { getDummySchedules } from '@/lib/dummy-data'
import SchedulesClient from '@/components/schedules/schedules-client'

export default function SchedulesPage() {
  const schedules = getDummySchedules()
  return <SchedulesClient schedules={schedules} />
}
