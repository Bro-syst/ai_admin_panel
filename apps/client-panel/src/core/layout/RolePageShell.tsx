import type { ReactNode } from 'react'
import { AppShell } from '@/core/layout/AppShell'

export function RolePageShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return <AppShell title={title}>{children}</AppShell>
}
