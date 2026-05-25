import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it } from 'vitest'
import { setupCsrfInterceptor } from '@/core/api/interceptors/csrfInterceptor'

type RequestHandler = (config: AxiosRequestConfig) => AxiosRequestConfig

function createApiClientMock() {
  let requestHandler: RequestHandler | null = null

  const client = {
    interceptors: {
      request: {
        use: (onFulfilled: RequestHandler) => {
          requestHandler = onFulfilled
          return 0
        },
      },
    },
  } as unknown as AxiosInstance

  return {
    client,
    apply(config: AxiosRequestConfig = {}) {
      if (!requestHandler) throw new Error('Interceptor is not initialized')
      return requestHandler(config)
    },
  }
}

function readHeader(config: AxiosRequestConfig, name: string) {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers as unknown as Record<string, string>)
  return headers.get(name)
}

describe('setupCsrfInterceptor', () => {
  beforeEach(() => {
    document.cookie = 'ai_core_admin_csrf=; Max-Age=0; path=/'
  })

  it('does not add csrf to ordinary metadata GET requests', () => {
    document.cookie = 'ai_core_admin_csrf=csrf-token; path=/'

    const { client, apply } = createApiClientMock()
    setupCsrfInterceptor(client)

    const result = apply({ method: 'get', headers: {} })

    expect(readHeader(result, 'X-CSRF-Token')).toBeUndefined()
  })

  it('adds csrf to sensitive GET requests with explicit opt-in', () => {
    document.cookie = 'ai_core_admin_csrf=csrf-token; path=/'

    const { client, apply } = createApiClientMock()
    setupCsrfInterceptor(client)

    const result = apply({ method: 'get', requireCsrf: true, headers: {} })

    expect(readHeader(result, 'X-CSRF-Token')).toBe('csrf-token')
  })
})
