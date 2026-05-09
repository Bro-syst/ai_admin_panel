import { isAxiosError } from 'axios'
import { readRequestIdHeader } from '@/core/api/requestId'
import type { ApiError } from './ApiError'

function readBackendMessage(data: unknown) {
  if (!data || typeof data !== 'object') return undefined
  const payload = data as Record<string, unknown>
  const topDescription = payload.description
  if (typeof topDescription === 'string' && topDescription.trim()) return topDescription

  const detail = payload.detail
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const firstText = detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') return item.msg
        return ''
      })
      .find((item) => item.trim())
    if (firstText) return firstText
  }

  const status = payload.status
  if (status && typeof status === 'object') {
    const description = (status as Record<string, unknown>).description
    if (typeof description === 'string' && description.trim()) return description
  }

  const error = payload.error
  if (error && typeof error === 'object') {
    const description = (error as Record<string, unknown>).description
    if (typeof description === 'string' && description.trim()) return description
  }

  return undefined
}

export function mapApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { kind: 'unknown', message: 'Unknown error', details: error }
  }

  const status = error.response?.status
  const message = readBackendMessage(error.response?.data) ?? error.message
  const requestId = readRequestIdHeader(error.response?.headers) ?? undefined

  if (!error.response) {
    if (error.code === 'ECONNABORTED') return { kind: 'timeout', message, details: error }
    return { kind: 'network', message, details: error }
  }

  if (status === 401) return { kind: 'unauthorized', status, message, requestId, details: error.response.data }
  if (status === 403) return { kind: 'forbidden', status, message, requestId, details: error.response.data }
  if (status === 423) return { kind: 'locked', status, message, requestId, details: error.response.data }
  if (status && status >= 500) return { kind: 'server', status, message, requestId, details: error.response.data }
  if (status === 422) return { kind: 'validation', status, message, requestId, details: error.response.data }
  if (status === 400 || status === 409) return { kind: 'validation', status, message, requestId, details: error.response.data }

  return { kind: 'unknown', status, message, requestId, details: error.response.data }
}
