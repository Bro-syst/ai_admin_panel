function normalizeApiBaseUrl(raw: string) {
  const value = raw.trim()
  if (!value) return ''

  try {
    return new URL(value).toString().replace(/\/+$/, '')
  } catch {
    return value.replace(/\/+$/, '')
  }
}

const normalizedApiBaseUrl = normalizeApiBaseUrl(String(import.meta.env.VITE_API_BASE_URL ?? ''))
const appVersion = String(import.meta.env.VITE_APP_VERSION ?? 'web-1.0.0').trim() || 'web-1.0.0'

export const env = {
  apiBaseUrl: normalizedApiBaseUrl,
  appVersion,
} as const
