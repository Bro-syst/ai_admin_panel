import { AxiosHeaders } from 'axios'
import type { AxiosInstance } from 'axios'
import { readPreferredLocale } from '@/core/i18n/preferredLocale'

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function setupRequestMetadataInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.request.use((config) => {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers)

    if (!headers.has('X-Request-ID')) {
      headers.set('X-Request-ID', createRequestId())
    }

    headers.set('X-Locale', readPreferredLocale())
    config.headers = headers

    return config
  })
}
