import { AxiosHeaders } from 'axios'
import type { AxiosInstance } from 'axios'
import { createRequestId, getRequestIdHeaderName, readRequestIdHeader, rememberRequestCorrelation } from '@/core/api/requestId'

type RequestIdConfig = {
  _clientRequestId?: string
}

const REQUEST_ID_HEADER = getRequestIdHeaderName()

function readClientRequestId(config: unknown) {
  if (!config || typeof config !== 'object') return null
  const requestId = (config as RequestIdConfig)._clientRequestId
  return typeof requestId === 'string' && requestId.trim() ? requestId : null
}

export function setupRequestIdInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.request.use((config) => {
    const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers)
    const clientRequestId = readRequestIdHeader(headers) ?? createRequestId()

    headers.set(REQUEST_ID_HEADER, clientRequestId)
    config.headers = headers
    ;(config as RequestIdConfig)._clientRequestId = clientRequestId
    return config
  })

  apiClient.interceptors.response.use(
    (response) => {
      const clientRequestId = readClientRequestId(response.config)
      if (clientRequestId) {
        rememberRequestCorrelation(clientRequestId, readRequestIdHeader(response.headers))
      }
      return response
    },
    (error) => {
      const clientRequestId = readClientRequestId(error?.config)
      const responseRequestId = readRequestIdHeader(error?.response?.headers)
      if (clientRequestId) {
        rememberRequestCorrelation(clientRequestId, responseRequestId)
      }
      return Promise.reject(error)
    },
  )
}
