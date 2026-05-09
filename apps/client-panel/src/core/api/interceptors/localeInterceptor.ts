import { AxiosHeaders } from 'axios'
import type { AxiosInstance } from 'axios'
import { getCurrentAppLocale } from '@/core/i18n/runtimeLocale'

const LOCALE_HEADER = 'X-Locale'

export function setupLocaleInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.request.use((config) => {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers)

    if (!headers.get(LOCALE_HEADER)) {
      headers.set(LOCALE_HEADER, getCurrentAppLocale())
    }

    config.headers = headers
    return config
  })
}
