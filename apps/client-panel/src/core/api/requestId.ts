const REQUEST_ID_HEADER = 'X-Request-ID'
const MAX_REQUEST_ID_LENGTH = 128

export type ApiRequestCorrelation = {
  clientRequestId: string
  requestId: string
  updatedAt: number
}

let latestRequestCorrelation: ApiRequestCorrelation | null = null

function normalizeRequestId(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_REQUEST_ID_LENGTH) return null
  return trimmed
}

export function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function getRequestIdHeaderName() {
  return REQUEST_ID_HEADER
}

export function readRequestIdHeader(headers: unknown) {
  if (!headers || typeof headers !== 'object') return null

  if ('get' in headers && typeof headers.get === 'function') {
    return normalizeRequestId(headers.get(REQUEST_ID_HEADER) ?? headers.get(REQUEST_ID_HEADER.toLowerCase()))
  }

  const headerMap = headers as Record<string, unknown>
  return normalizeRequestId(headerMap[REQUEST_ID_HEADER] ?? headerMap[REQUEST_ID_HEADER.toLowerCase()])
}

export function rememberRequestCorrelation(clientRequestId: string, responseRequestId?: string | null) {
  const normalizedClientRequestId = normalizeRequestId(clientRequestId)
  if (!normalizedClientRequestId) return null

  const normalizedResponseRequestId = normalizeRequestId(responseRequestId) ?? normalizedClientRequestId

  latestRequestCorrelation = {
    clientRequestId: normalizedClientRequestId,
    requestId: normalizedResponseRequestId,
    updatedAt: Date.now(),
  }

  return latestRequestCorrelation
}

export function getLatestRequestCorrelation() {
  return latestRequestCorrelation
}
