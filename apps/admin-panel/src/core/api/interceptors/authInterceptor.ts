import type { AxiosInstance } from 'axios'
import { emitAuthUnauthorized } from '@/core/auth/authEvents'
import { readBackendErrorCode } from '@/core/api/errors/readBackendErrorCode'

const AUTH_PREFIX = '/api/admin/v1/auth'
const ADMIN_API_PREFIX = '/api/admin/v1'
const REFRESH_PATH = `${AUTH_PREFIX}/refresh`
const LOGIN_PATH = `${AUTH_PREFIX}/login`
const LOGOUT_PATH = `${AUTH_PREFIX}/logout`
const CSRF_COOKIE_NAME = 'ai_core_admin_csrf'
const LOCKED_STATUS = 423
const ADMIN_SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000
const ADMIN_USER_LOCK_CODES = new Set(['account_locked'])

type RetryRequestConfig = {
  url?: string
  _retry?: boolean
}

function isAuthOperation(url = '') {
  return url.includes(LOGIN_PATH) || url.includes(LOGOUT_PATH) || url.includes(REFRESH_PATH)
}

function isAdminApiOperation(url = '') {
  return url.includes(ADMIN_API_PREFIX)
}

function isLoginOperation(url = '') {
  return url.includes(LOGIN_PATH)
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

function isInactiveAdminUserLockError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const payload = error as { response?: { data?: unknown } }
  const code = readBackendErrorCode(payload.response?.data)
  return typeof code === 'string' && ADMIN_USER_LOCK_CODES.has(code)
}

export function setupAuthInterceptor(apiClient: AxiosInstance) {
  let refreshPromise: Promise<void> | null = null
  let lastAuthCookieIssuedAt = 0

  const markAuthCookieFresh = () => {
    lastAuthCookieIssuedAt = Date.now()
  }

  const refreshSession = async () => {
    if (!refreshPromise) {
      refreshPromise = apiClient.post(REFRESH_PATH, {}).then(() => {
        markAuthCookieFresh()
      }).finally(() => {
        refreshPromise = null
      })
    }
    return refreshPromise
  }

  const shouldRefreshBeforeRequest = (url: string) => {
    if (!isAdminApiOperation(url) || isAuthOperation(url)) return false
    if (!readCookie(CSRF_COOKIE_NAME)) return false
    return Date.now() - lastAuthCookieIssuedAt >= ADMIN_SESSION_REFRESH_INTERVAL_MS
  }

  apiClient.interceptors.request.use(async (config) => {
    const requestUrl = String(config.url ?? '')
    if (shouldRefreshBeforeRequest(requestUrl)) {
      await refreshSession().catch(() => undefined)
    }
    return config
  })

  apiClient.interceptors.response.use(
    (response) => {
      const responseUrl = String(response.config?.url ?? '')
      if (responseUrl.includes(LOGIN_PATH) || responseUrl.includes(REFRESH_PATH)) {
        markAuthCookieFresh()
      }
      return response
    },
    async (error) => {
      const status = error?.response?.status
      const request = (error?.config ?? {}) as RetryRequestConfig
      const requestUrl = String(request.url ?? '')

      // The refresh session cookie is HttpOnly, so a readable CSRF cookie is not a reliable session signal.
      if (status === 401 && !request._retry && !isAuthOperation(requestUrl)) {
        request._retry = true
        const refreshSucceeded = await refreshSession()
          .then(() => true)
          .catch(() => false)

        if (refreshSucceeded) {
          return apiClient(request)
        }
      }

      if (status === 401 && !isLoginOperation(requestUrl)) {
        emitAuthUnauthorized()
      }

      if (status === LOCKED_STATUS && !isLoginOperation(requestUrl) && isInactiveAdminUserLockError(error)) {
        emitAuthUnauthorized()
      }

      return Promise.reject(error)
    },
  )
}
