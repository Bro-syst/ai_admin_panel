import type { ReactNode } from 'react'
import type { Ability } from './abilities'
import { useAuth } from '@/core/auth/useAuth'

export function Can({ ability, children }: { ability: Ability; children: ReactNode }) {
  const { adminUser } = useAuth()
  const permissions = adminUser?.permissions ?? []
  if (!permissions.includes(ability)) return null
  return <>{children}</>
}
