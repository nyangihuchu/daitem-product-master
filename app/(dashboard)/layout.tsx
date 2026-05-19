import type { WithChildren } from '@/lib/types'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: WithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="container mx-auto max-w-screen-xl flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
