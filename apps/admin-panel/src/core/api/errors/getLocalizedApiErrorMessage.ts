type Translate = (key: string) => string

function readText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function readRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function readBackendCodePayload(value: unknown) {
  const payload = readRecord(value)
  if (!payload) return null
  return readText(payload.error_code) ?? readText(payload.code)
}

function readErrorCode(error: unknown) {
  const payload = readRecord(error)
  if (!payload) return null

  return (
    readText(payload.code) ??
    readBackendCodePayload(payload) ??
    readBackendCodePayload(payload.details) ??
    readBackendCodePayload(readRecord(payload.response)?.data)
  )
}

function readErrorKind(error: unknown) {
  const payload = readRecord(error)
  if (!payload) return null
  return readText(payload.kind)
}

function readErrorMessage(error: unknown) {
  const payload = readRecord(error)
  if (!payload) return null

  return (
    readText(payload.message) ??
    readText(readRecord(payload.details)?.message) ??
    readText(readRecord(readRecord(payload.response)?.data)?.message)
  )
}

function translateIfExists(t: Translate, key: string) {
  const message = t(key)
  return message === key ? null : message
}

export function getLocalizedApiErrorMessage(error: unknown, t: Translate, fallback: string) {
  const code = readErrorCode(error)
  if (code) {
    const message = translateIfExists(t, `errors.backend.${code}`)
    if (message) return message
  }

  const kind = readErrorKind(error)
  if (kind) {
    const message = translateIfExists(t, `errors.kind.${kind}`)
    if (message) return message
  }

  const message = readErrorMessage(error)
  if (message) return message

  return fallback
}
