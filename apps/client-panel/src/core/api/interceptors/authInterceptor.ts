import type { AxiosInstance } from 'axios'
import { emitAuthUnauthorized } from '@/core/auth/authEvents'

const AUTH_PREFIX = '/api/v1/auth'
const REFRESH_PATH = `${AUTH_PREFIX}/refresh`
const LOGIN_PATH = `${AUTH_PREFIX}/login`
const REGISTER_PATH = `${AUTH_PREFIX}/register`
const LOGOUT_PATH = `${AUTH_PREFIX}/logout`

type RetryRequestConfig = {
  url?: string
  _retry?: boolean
}

function isAuthOperation(url = '') {
  return url.includes(LOGIN_PATH) || url.includes(REGISTER_PATH) || url.includes(LOGOUT_PATH) || url.includes(REFRESH_PATH)
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

      if (status === 401 && !requestUrl.includes(LOGIN_PATH) && !requestUrl.includes(REGISTER_PATH)) {
        emitAuthUnauthorized()
      }

      return Promise.reject(error)
    },
  )
}
