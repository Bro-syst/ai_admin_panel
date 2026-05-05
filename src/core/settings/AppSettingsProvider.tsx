import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AppSettingsContext,
  type AppPreferences,
  type AppSettingsContextValue,
} from '@/core/settings/AppSettingsContext'
import { getStorageKey } from '@/shared/storage/storageKeys'

const STORAGE_KEY = getStorageKey('app_preferences_v1')

function detectTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

function normalizeTimezone(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : detectTimezone()
}

function parseStoredPreferences(raw: string | null): AppPreferences | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      timezone: normalizeTimezone(parsed.timezone),
    }
  } catch {
    return null
  }
}

function detectInitialPreferences(): AppPreferences {
  const stored = parseStoredPreferences(window.localStorage.getItem(STORAGE_KEY))
  if (stored) return stored
  return {
    timezone: detectTimezone(),
  }
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(() => detectInitialPreferences())

  const setTimezone = useCallback((timezone: string) => {
    setPreferences((current) => ({ ...current, timezone: normalizeTimezone(timezone) }))
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      preferences,
      setTimezone,
    }),
    [preferences, setTimezone],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}
