import type { AxiosInstance } from 'axios'
import { AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setupRequestMetadataInterceptor } from '@/core/api/interceptors/requestMetadataInterceptor'
import { getStorageKey } from '@/shared/storage/storageKeys'

type RequestHandler = (config: { headers?: AxiosHeaders | Record<string, string> }) => {
  headers?: AxiosHeaders | Record<string, string>
}

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
    apply(config: { headers?: AxiosHeaders | Record<string, string> } = {}) {
      if (!requestHandler) throw new Error('Interceptor is not initialized')
      return requestHandler(config)
    },
  }
}

describe('setupRequestMetadataInterceptor', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds x-locale and x-request-id headers', () => {
    const randomUuidSpy = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-4000-8000-000000000001')
    window.localStorage.setItem(getStorageKey('locale_v1'), 'es')

    try {
      const { client, apply } = createApiClientMock()
      setupRequestMetadataInterceptor(client)

      const result = apply({ headers: {} })
      const headers = result.headers instanceof AxiosHeaders ? result.headers : new AxiosHeaders(result.headers)

      expect(headers.get('X-Locale')).toBe('es')
      expect(headers.get('X-Request-ID')).toBe('00000000-0000-4000-8000-000000000001')
    } finally {
      randomUuidSpy.mockRestore()
    }
  })

  it('preserves existing x-request-id header', () => {
    const { client, apply } = createApiClientMock()
    setupRequestMetadataInterceptor(client)

    const result = apply({
      headers: new AxiosHeaders({
        'X-Request-ID': 'existing-request-id',
      }),
    })
    const headers = result.headers instanceof AxiosHeaders ? result.headers : new AxiosHeaders(result.headers)

    expect(headers.get('X-Request-ID')).toBe('existing-request-id')
  })
})
