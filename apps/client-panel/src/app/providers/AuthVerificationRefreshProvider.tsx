import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'

const VERIFICATION_REFRESH_THROTTLE_MS = 15_000

export function AuthVerificationRefreshProvider({ children }: { children: ReactNode }) {
  const { status, authState, reload } = useAuth()
  const location = useLocation()
  const lastRefreshAtRef = useRef(Number.NEGATIVE_INFINITY)
  const isRefreshingRef = useRef(false)
  const routeKeyRef = useRef(`${location.pathname}?${location.search}`)
  const shouldRefresh = status === 'authenticated' && authState?.verificationRequired === true

  const refreshIfNeeded = useCallback(() => {
    if (!shouldRefresh || document.visibilityState === 'hidden') return

    const now = Date.now()
    if (isRefreshingRef.current || now - lastRefreshAtRef.current < VERIFICATION_REFRESH_THROTTLE_MS) return

    lastRefreshAtRef.current = now
    isRefreshingRef.current = true
    void reload()
      .catch(() => undefined)
      .finally(() => {
        isRefreshingRef.current = false
      })
  }, [reload, shouldRefresh])

  useEffect(() => {
    if (!shouldRefresh) return

    window.addEventListener('focus', refreshIfNeeded)
    document.addEventListener('visibilitychange', refreshIfNeeded)

    return () => {
      window.removeEventListener('focus', refreshIfNeeded)
      document.removeEventListener('visibilitychange', refreshIfNeeded)
    }
  }, [refreshIfNeeded, shouldRefresh])

  useEffect(() => {
    if (!shouldRefresh) return

    const routeKey = `${location.pathname}?${location.search}`
    if (routeKeyRef.current === routeKey) return

    routeKeyRef.current = routeKey
    refreshIfNeeded()
  }, [location.pathname, location.search, refreshIfNeeded, shouldRefresh])

  return <>{children}</>
}
