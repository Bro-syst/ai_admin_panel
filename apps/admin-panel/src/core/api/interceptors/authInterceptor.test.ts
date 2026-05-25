import type { AxiosInstance } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setupAuthInterceptor } from '@/core/api/interceptors/authInterceptor'

type InterceptorHandler = (error: {
  response?: { status?: number; data?: unknown }
  config?: Record<string, unknown>
}) => Promise<unknown>
type RequestInterceptorHandler = (config: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>
type ResponseInterceptorHandler = (response: { config?: Record<string, unknown> }) => unknown

function createApiClientMock() {
  let rejectedHandler: InterceptorHandler | null = null
  let requestHandler: RequestInterceptorHandler | null = null
  let responseHandler: ResponseInterceptorHandler | null = null
  const requestMock = vi.fn(async (config: unknown) => ({ data: { retried: true }, config }))
  const postMock = vi.fn()

  const client = requestMock as unknown as AxiosInstance
  ;(client as unknown as { post: typeof postMock }).post = postMock
  ;(client as unknown as {
    interceptors: {
      request: { use: (onFulfilled: RequestInterceptorHandler) => number }
      response: { use: (onFulfilled: ResponseInterceptorHandler, onRejected: InterceptorHandler) => number }
    }
  }).interceptors = {
    request: {
      use: (onFulfilled) => {
        requestHandler = onFulfilled
        return 0
      },
    },
    response: {
      use: (onFulfilled, onRejected) => {
        responseHandler = onFulfilled
        rejectedHandler = onRejected
        return 0
      },
    },
  }

  return {
    client,
    requestMock,
    postMock,
    request: (config: Record<string, unknown>) => {
      if (!requestHandler) throw new Error('Request interceptor is not initialized')
      return requestHandler(config)
    },
    respond: (response: { config?: Record<string, unknown> }) => {
      if (!responseHandler) throw new Error('Response interceptor is not initialized')
      return responseHandler(response)
    },
    reject: (error: { response?: { status?: number; data?: unknown }; config?: Record<string, unknown> }) => {
      if (!rejectedHandler) throw new Error('Interceptor is not initialized')
      return rejectedHandler(error)
    },
  }
}

function setAuthSessionHint() {
  document.cookie = 'ai_core_admin_csrf=test; path=/'
}

function clearAuthSessionHint() {
  document.cookie = 'ai_core_admin_csrf=; Max-Age=0; path=/'
}

describe('setupAuthInterceptor', () => {
  beforeEach(() => {
    clearAuthSessionHint()
  })

  it('retries protected request after successful refresh', async () => {
    setAuthSessionHint()
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, requestMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)
      postMock.mockResolvedValue({ data: { success: true } })

      const request = { url: '/api/admin/v1/users/me' }
      const result = await reject({ response: { status: 401 }, config: request })

      expect(postMock).toHaveBeenCalledTimes(1)
      expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/refresh', {})
      expect(request).toMatchObject({ _retry: true })
      expect(requestMock).toHaveBeenCalledTimes(1)
      expect(requestMock).toHaveBeenCalledWith(request)
      expect(result).toMatchObject({ data: { retried: true } })
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('does not refresh login endpoint and does not emit unauthorized event', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)

      await expect(reject({ response: { status: 401 }, config: { url: '/api/admin/v1/auth/login' } })).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('emits unauthorized event when refresh fails for protected request', async () => {
    setAuthSessionHint()
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)
      postMock.mockRejectedValue(new Error('refresh failed'))

      await expect(reject({ response: { status: 401 }, config: { url: '/api/admin/v1/users/me' } })).rejects.toBeDefined()

      expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/refresh', {})
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1)
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('retries protected request after refresh when CSRF session hint is absent', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, requestMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)
      postMock.mockResolvedValue({ data: { success: true } })

      const request = { url: '/api/admin/v1/users/me' }
      await reject({ response: { status: 401 }, config: request })

      expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/refresh', {})
      expect(requestMock).toHaveBeenCalledWith(request)
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('emits unauthorized event for locked protected request when admin user is locked', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)

      await expect(
        reject({
          response: { status: 423, data: { error_code: 'account_locked' } },
          config: { url: '/api/admin/v1/users/me' },
        }),
      ).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1)
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('does not emit unauthorized event for locked login attempt', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)

      await expect(reject({ response: { status: 423 }, config: { url: '/api/admin/v1/auth/login' } })).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('does not emit unauthorized event for validation errors on TOTP confirm', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)

      await expect(
        reject({
          response: { status: 400, data: { error_code: 'validation_failed' } },
          config: { url: '/api/admin/v1/auth/totp/confirm' },
        }),
      ).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('shares single refresh call for parallel 401 errors', async () => {
    setAuthSessionHint()
    const { client, postMock, requestMock, reject } = createApiClientMock()
    setupAuthInterceptor(client)

    let resolveRefresh: ((value: { data: { success: boolean } }) => void) | undefined
    postMock.mockImplementation(
      () =>
        new Promise<{ data: { success: boolean } }>((resolve) => {
          resolveRefresh = resolve
        }),
    )

    const firstRequest = { url: '/api/admin/v1/users/me' }
    const secondRequest = { url: '/api/admin/v1/auth/sessions' }

    const firstPromise = reject({ response: { status: 401 }, config: firstRequest })
    const secondPromise = reject({ response: { status: 401 }, config: secondRequest })

    expect(postMock).toHaveBeenCalledTimes(1)

    if (!resolveRefresh) throw new Error('Refresh resolver is not set')
    resolveRefresh({ data: { success: true } })
    await Promise.all([firstPromise, secondPromise])

    expect(requestMock).toHaveBeenCalledTimes(2)
  })

  it('refreshes before a protected admin request when the tracked access cookie is stale', async () => {
    vi.useFakeTimers()
    setAuthSessionHint()
    const { client, postMock, request, respond } = createApiClientMock()
    setupAuthInterceptor(client)
    postMock.mockResolvedValue({ data: { success: true } })

    vi.setSystemTime(0)
    respond({ config: { url: '/api/admin/v1/auth/login' } })
    vi.setSystemTime(10 * 60 * 1000)

    const config = { url: '/api/admin/v1/portal/tenants' }
    await expect(request(config)).resolves.toBe(config)

    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/refresh', {})

    vi.useRealTimers()
  })

  it('does not pre-refresh anonymous bootstrap requests when the csrf cookie is absent', async () => {
    vi.useFakeTimers()
    const { client, postMock, request } = createApiClientMock()
    setupAuthInterceptor(client)
    vi.setSystemTime(10 * 60 * 1000)

    const config = { url: '/api/admin/v1/users/me' }
    await expect(request(config)).resolves.toBe(config)

    expect(postMock).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
