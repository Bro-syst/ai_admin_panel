import type { ReactNode } from 'react'
import type { Ability } from './abilities'
import { useAuth } from '@/core/auth/useAuth'

export function Can({ ability, children }: { ability: Ability; children: ReactNode }) {
  const { amlOfficer } = useAuth()
  const permissions = amlOfficer?.permissions ?? []
  if (!permissions.includes(ability)) return null
  return <>{children}</>
}
