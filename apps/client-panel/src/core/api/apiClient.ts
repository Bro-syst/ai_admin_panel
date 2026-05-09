import axios from 'axios'
import { env } from '@/core/config/env'
import { setupLocaleInterceptor } from '@/core/api/interceptors/localeInterceptor'
import { setupRequestIdInterceptor } from '@/core/api/interceptors/requestIdInterceptor'
import { setupCsrfInterceptor } from '@/core/api/interceptors/csrfInterceptor'
import { setupAuthInterceptor } from '@/core/api/interceptors/authInterceptor'
import { setupErrorInterceptor } from '@/core/api/interceptors/errorInterceptor'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  timeout: env.apiTimeoutMs,
  headers: {
    'x-app-version': env.appVersion,
  },
})

setupLocaleInterceptor(apiClient)
setupRequestIdInterceptor(apiClient)
setupCsrfInterceptor(apiClient)
setupAuthInterceptor(apiClient)
setupErrorInterceptor(apiClient)
