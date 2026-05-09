import { createContext } from 'react'
import type { AuthContextValue } from '@/core/auth/types'

export const AuthContext = createContext<AuthContextValue | null>(null)

