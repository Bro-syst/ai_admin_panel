import type { AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { setupAuthInterceptor } from '@/core/api/interceptors/authInterceptor'

type InterceptorHandler = (error: {
  response?: { status?: number; data?: unknown }
  config?: Record<string, unknown>
}) => Promise<unknown>

function createApiClientMock() {
  let rejectedHandler: InterceptorHandler | null = null
  const requestMock = vi.fn(async (config: unknown) => ({ data: { retried: true }, config }))
  const postMock = vi.fn()

  const client = requestMock as unknown as AxiosInstance
  ;(client as unknown as { post: typeof postMock }).post = postMock
  ;(client as unknown as { interceptors: { response: { use: (onFulfilled: unknown, onRejected: InterceptorHandler) => number } } }).interceptors = {
    response: {
      use: (_onFulfilled, onRejected) => {
        rejectedHandler = onRejected
        return 0
      },
    },
  }

  return {
    client,
    requestMock,
    postMock,
    reject: (error: { response?: { status?: number; data?: unknown }; config?: Record<string, unknown> }) => {
      if (!rejectedHandler) throw new Error('Interceptor is not initialized')
      return rejectedHandler(error)
    },
  }
}

describe('setupAuthInterceptor', () => {
  it('retries protected request after successful refresh', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, requestMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)
      postMock.mockResolvedValue({ data: { success: true } })

      const request = { url: '/api/v1/aml/users/me' }
      const result = await reject({ response: { status: 401 }, config: request })

      expect(postMock).toHaveBeenCalledTimes(1)
      expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/refresh', {})
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

      await expect(reject({ response: { status: 401 }, config: { url: '/api/v1/aml/auth/login' } })).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('emits unauthorized event when refresh fails for protected request', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)
      postMock.mockRejectedValue(new Error('refresh failed'))

      await expect(reject({ response: { status: 401 }, config: { url: '/api/v1/aml/users/me' } })).rejects.toBeDefined()

      expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/refresh', {})
      expect(unauthorizedHandler).toHaveBeenCalledTimes(1)
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('emits unauthorized event for locked protected request when AML officer is locked', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)

      await expect(
        reject({
          response: { status: 423, data: { code: 'locked' } },
          config: { url: '/api/v1/aml/users/me' },
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

      await expect(reject({ response: { status: 423 }, config: { url: '/api/v1/aml/auth/login' } })).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('does not emit unauthorized event for locked TOTP cooldown flow', async () => {
    const unauthorizedHandler = vi.fn()
    window.addEventListener('auth:unauthorized', unauthorizedHandler)

    try {
      const { client, postMock, reject } = createApiClientMock()
      setupAuthInterceptor(client)

      await expect(
        reject({
          response: { status: 423, data: { code: 'totp_cooldown_active' } },
          config: { url: '/api/v1/aml/auth/totp/confirm' },
        }),
      ).rejects.toBeDefined()

      expect(postMock).not.toHaveBeenCalled()
      expect(unauthorizedHandler).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('auth:unauthorized', unauthorizedHandler)
    }
  })

  it('shares single refresh call for parallel 401 errors', async () => {
    const { client, postMock, requestMock, reject } = createApiClientMock()
    setupAuthInterceptor(client)

    let resolveRefresh: ((value: { data: { success: boolean } }) => void) | undefined
    postMock.mockImplementation(
      () =>
        new Promise<{ data: { success: boolean } }>((resolve) => {
          resolveRefresh = resolve
        }),
    )

    const firstRequest = { url: '/api/v1/aml/users/me' }
    const secondRequest = { url: '/api/v1/aml/auth/sessions' }

    const firstPromise = reject({ response: { status: 401 }, config: firstRequest })
    const secondPromise = reject({ response: { status: 401 }, config: secondRequest })

    expect(postMock).toHaveBeenCalledTimes(1)

    if (!resolveRefresh) throw new Error('Refresh resolver is not set')
    resolveRefresh({ data: { success: true } })
    await Promise.all([firstPromise, secondPromise])

    expect(requestMock).toHaveBeenCalledTimes(2)
  })
})
