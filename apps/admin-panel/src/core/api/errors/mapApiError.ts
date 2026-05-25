import { isAxiosError } from 'axios'
import type { ApiError } from './ApiError'
import { readBackendErrorCode } from './readBackendErrorCode'

function readText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function readBackendMessage(data: unknown) {
  if (!data || typeof data !== 'object') return undefined
  const payload = data as Record<string, unknown>
  const topMessage = payload.message
  if (typeof topMessage === 'string' && topMessage.trim()) return topMessage

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

function readHeaderValue(headers: unknown, name: string) {
  if (!headers) return undefined

  if (headers && typeof headers === 'object' && 'get' in headers && typeof headers.get === 'function') {
    const value = headers.get(name)
    return typeof value === 'string' && value.trim() ? value : undefined
  }

  if (typeof headers !== 'object') return undefined

  const normalizedName = name.toLowerCase()
  for (const [headerName, headerValue] of Object.entries(headers as Record<string, unknown>)) {
    if (headerName.toLowerCase() !== normalizedName) continue
    return typeof headerValue === 'string' && headerValue.trim() ? headerValue : undefined
  }

  return undefined
}

export function mapApiError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return { kind: 'unknown', message: 'Unknown error', details: error }
  }

  const status = error.response?.status
  const message = readBackendMessage(error.response?.data) ?? error.message
  const code = readBackendErrorCode(error.response?.data)
  const requestId =
    readHeaderValue(error.response?.headers, 'x-request-id') ??
    (error.response?.data && typeof error.response.data === 'object'
      ? readText((error.response.data as Record<string, unknown>).correlation_id)
      : undefined)

  if (!error.response) {
    if (error.code === 'ECONNABORTED') return { kind: 'timeout', message, code, requestId, details: error }
    return { kind: 'network', message, code, requestId, details: error }
  }

  if (status === 401) return { kind: 'unauthorized', status, code, message, requestId, details: error.response.data }
  if (status === 403) return { kind: 'forbidden', status, code, message, requestId, details: error.response.data }
  if (status === 404) return { kind: 'not_found', status, code, message, requestId, details: error.response.data }
  if (status === 409) return { kind: 'conflict', status, code, message, requestId, details: error.response.data }
  if (status === 423) return { kind: 'locked', status, code, message, requestId, details: error.response.data }
  if (status && status >= 500) return { kind: 'server', status, code, message, requestId, details: error.response.data }
  if (status === 422 || status === 400) return { kind: 'validation', status, code, message, requestId, details: error.response.data }

  return { kind: 'unknown', status, code, message, requestId, details: error.response.data }
}
