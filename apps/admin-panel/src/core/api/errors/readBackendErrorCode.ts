export function readBackendErrorCode(data: unknown) {
  if (!data || typeof data !== 'object') return undefined
  const payload = data as Record<string, unknown>
  const code = payload.error_code ?? payload.code
  return typeof code === 'string' && code.trim() ? code : undefined
}
