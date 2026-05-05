export type ApiErrorSupportDetails = {
  code: string | null
  requestId: string | null
}

function readText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

export function readApiErrorSupportDetails(error: unknown): ApiErrorSupportDetails | null {
  if (!error || typeof error !== 'object') return null

  const payload = error as Record<string, unknown>
  const code = readText(payload.code)
  const requestId = readText(payload.requestId)

  if (!code && !requestId) return null

  return {
    code,
    requestId,
  }
}
