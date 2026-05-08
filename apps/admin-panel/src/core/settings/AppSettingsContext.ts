import { createContext } from 'react'

export type AppPreferences = {
  timezone: string
}

export type AppSettingsContextValue = {
  preferences: AppPreferences
  setTimezone: (timezone: string) => void
}

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)
