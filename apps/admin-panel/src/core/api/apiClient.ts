import axios from 'axios'
import { env } from '@/core/config/env'
import { setupRequestMetadataInterceptor } from '@/core/api/interceptors/requestMetadataInterceptor'
import { setupCsrfInterceptor } from '@/core/api/interceptors/csrfInterceptor'
import { setupAuthInterceptor } from '@/core/api/interceptors/authInterceptor'
import { setupErrorInterceptor } from '@/core/api/interceptors/errorInterceptor'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  withCredentials: true,
  headers: {
    'x-app-version': env.appVersion,
  },
})

setupRequestMetadataInterceptor(apiClient)
setupCsrfInterceptor(apiClient)
setupAuthInterceptor(apiClient)
setupErrorInterceptor(apiClient)
