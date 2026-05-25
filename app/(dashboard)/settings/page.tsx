import { getCurrentFees } from '@/lib/services/market-fee-service'
import { getDummyUsers } from '@/lib/dummy-data'
import SettingsClient from '@/components/settings/settings-client'

export default async function SettingsPage() {
  const [fees, users] = await Promise.all([
    getCurrentFees(),
    Promise.resolve(getDummyUsers()),
  ])
  return <SettingsClient users={users} fees={fees} />
}
