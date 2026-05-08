import type { AxiosInstance } from 'axios'
import { emitAuthUnauthorized } from '@/core/auth/authEvents'
import { readBackendErrorCode } from '@/core/api/errors/readBackendErrorCode'

const AUTH_PREFIX = '/api/v1/aml/auth'
const REFRESH_PATH = `${AUTH_PREFIX}/refresh`
const LOGIN_PATH = `${AUTH_PREFIX}/login`
const LOGOUT_PATH = `${AUTH_PREFIX}/logout`
const LOCKED_STATUS = 423
const AML_OFFICER_LOCK_CODES = new Set(['locked', 'current_aml_officer_inactive'])

type RetryRequestConfig = {
  url?: string
  _retry?: boolean
}

function isAuthOperation(url = '') {
  return url.includes(LOGIN_PATH) || url.includes(LOGOUT_PATH) || url.includes(REFRESH_PATH)
}

function isLoginOperation(url = '') {
  return url.includes(LOGIN_PATH)
}

function isInactiveAmlOfficerLockError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const payload = error as { response?: { data?: unknown } }
  const code = readBackendErrorCode(payload.response?.data)
  return typeof code === 'string' && AML_OFFICER_LOCK_CODES.has(code)
}

export function setupAuthInterceptor(apiClient: AxiosInstance) {
  let refreshPromise: Promise<void> | null = null

  const refreshSession = async () => {
    if (!refreshPromise) {
      refreshPromise = apiClient.post(REFRESH_PATH, {}).then(() => undefined).finally(() => {
        refreshPromise = null
      })
    }
    return refreshPromise
  }

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status
      const request = (error?.config ?? {}) as RetryRequestConfig
      const requestUrl = String(request.url ?? '')

      if (status === 401 && !request._retry && !isAuthOperation(requestUrl)) {
        request._retry = true
        const refreshed = await refreshSession()
          .then(() => true)
          .catch(() => false)

        if (refreshed) {
          return apiClient(request)
        }
      }

      if (status === 401 && !isLoginOperation(requestUrl)) {
        emitAuthUnauthorized()
      }

      if (status === LOCKED_STATUS && !isLoginOperation(requestUrl) && isInactiveAmlOfficerLockError(error)) {
        emitAuthUnauthorized()
      }

      return Promise.reject(error)
    },
  )
}
