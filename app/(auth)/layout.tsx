import type { Metadata } from 'next'
import type { WithChildren } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Authentication',
}

export default function AuthLayout({ children }: WithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
