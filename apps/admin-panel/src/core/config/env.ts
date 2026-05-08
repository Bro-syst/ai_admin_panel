function normalizeApiBaseUrl(raw: string) {
  const value = raw.trim()
  if (!value) return ''

  try {
    return new URL(value).toString().replace(/\/+$/, '')
  } catch {
    return value.replace(/\/+$/, '')
  }
}

function normalizePositiveInteger(raw: string, fallback: number) {
  const value = Number.parseInt(raw.trim(), 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const normalizedApiBaseUrl = normalizeApiBaseUrl(String(import.meta.env.VITE_API_BASE_URL ?? ''))
const appVersion = String(import.meta.env.VITE_APP_VERSION ?? 'web-1.0.0').trim() || 'web-1.0.0'
const apiTimeoutMs = normalizePositiveInteger(String(import.meta.env.VITE_API_TIMEOUT_MS ?? ''), 5000)

export const env = {
  apiBaseUrl: normalizedApiBaseUrl,
  apiTimeoutMs,
  appVersion,
} as const
