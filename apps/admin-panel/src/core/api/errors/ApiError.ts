export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'locked'
  | 'validation'
  | 'server'
  | 'unknown'

export type ApiError = {
  kind: ApiErrorKind
  status?: number
  code?: string
  message?: string
  requestId?: string
  details?: unknown
}
