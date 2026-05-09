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
const appVersion = String(import.meta.env.VITE_APP_VERSION ?? 'client-panel-1.0.0').trim() || 'client-panel-1.0.0'
const apiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 8000)

export const env = {
  apiBaseUrl: normalizedApiBaseUrl,
  appVersion,
  apiTimeoutMs: Number.isFinite(apiTimeoutMs) && apiTimeoutMs > 0 ? apiTimeoutMs : 8000,
} as const
