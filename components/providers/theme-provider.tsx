'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// next-themes 0.4.x가 deprecated된 MediaQueryList.addListener를 사용하므로 폴리필 적용
if (typeof window !== 'undefined' && typeof MediaQueryList !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proto = MediaQueryList.prototype as any
  if (!proto.addListener) {
    proto.addListener = function (cb: EventListener) {
      return this.addEventListener('change', cb)
    }
    proto.removeListener = function (cb: EventListener) {
      return this.removeEventListener('change', cb)
    }
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
