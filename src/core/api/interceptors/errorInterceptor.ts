import type { AxiosInstance } from 'axios'
import { mapApiError } from '@/core/api/errors/mapApiError'

export function setupErrorInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(mapApiError(error)),
  )
}

