import * as React from 'react'
import { cn } from '@/lib/utils'

export function Header({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <header className={cn('border-b border-border glass sticky top-0 z-40', className)}>
      {children}
    </header>
  )
}

export default Header
