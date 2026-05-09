export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'locked'
  | 'validation'
  | 'server'
  | 'unknown'

export type ApiError = {
  kind: ApiErrorKind
  status?: number
  message?: string
  requestId?: string
  details?: unknown
}
