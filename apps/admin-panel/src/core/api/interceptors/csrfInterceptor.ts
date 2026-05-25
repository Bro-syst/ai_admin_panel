import { AxiosHeaders } from 'axios'
import type { AxiosInstance } from 'axios'

const CSRF_COOKIE_NAME = 'ai_core_admin_csrf'
const SAFE_METHODS = new Set(['get', 'head', 'options'])

declare module 'axios' {
  interface AxiosRequestConfig {
    requireCsrf?: boolean
  }
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return ''

  const prefix = `${name}=`
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : ''
}

export function setupCsrfInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.request.use((config) => {
    const method = String(config.method ?? 'get').toLowerCase()
    if (SAFE_METHODS.has(method) && !config.requireCsrf) return config

    const csrfToken = readCookie(CSRF_COOKIE_NAME)
    if (!csrfToken) return config

    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers)
    headers.set('X-CSRF-Token', csrfToken)
    config.headers = headers
    return config
  })
}
