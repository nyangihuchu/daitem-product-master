import * as React from 'react'
import { APP_NAME } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer data-slot="footer" className="border-t py-6">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-foreground transition-colors">
              개인정보 처리방침
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
