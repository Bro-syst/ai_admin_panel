type Translate = (key: string) => string

export type MessageMatcher = {
  key: string
  exact?: string
  startsWith?: string
}

const BACKEND_MESSAGE_MATCHERS: MessageMatcher[] = [
  { exact: 'E-mail is required.', key: 'auth.validation.email' },
  { exact: 'Invalid e-mail address.', key: 'auth.validation.email' },
  { exact: 'Password must be at least 8 characters long.', key: 'auth.validation.password_min_length' },
  { exact: 'Password must contain at least one uppercase letter.', key: 'auth.validation.password_uppercase' },
  { exact: 'Password must contain at least one lowercase letter.', key: 'auth.validation.password_lowercase' },
  { exact: 'Password must contain at least one digit.', key: 'auth.validation.password_digit' },
  { exact: 'Invalid e-mail or password.', key: 'auth.error.invalid_credentials' },
  { exact: 'Invalid credentials.', key: 'auth.error.invalid_credentials' },
  { exact: 'Too many failed login attempts. Try again later.', key: 'auth.error.too_many_attempts' },
  { exact: 'The account is not active.', key: 'auth.error.account_inactive' },
  { exact: 'A user with this e-mail already exists.', key: 'auth.error.email_taken' },
  { exact: 'Unable to register user with provided e-mail.', key: 'auth.error.email_taken' },
  { exact: 'Unable to update e-mail.', key: 'auth.error.email_taken' },
  { exact: 'Verified e-mail cannot be changed with this flow.', key: 'account.change_email.already_verified' },
  { exact: 'New e-mail must differ from current e-mail.', key: 'account.change_email.same_email' },
  { exact: 'E-mail is already verified.', key: 'account.verification.already_verified' },
]

function readErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('message' in error)) return ''
  const message = (error as { message?: unknown }).message
  return typeof message === 'string' ? message.trim() : ''
}

function readErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object' || !('status' in error)) return undefined
  const status = (error as { status?: unknown }).status
  return typeof status === 'number' ? status : undefined
}

function readErrorKind(error: unknown) {
  if (!error || typeof error !== 'object' || !('kind' in error)) return undefined
  const kind = (error as { kind?: unknown }).kind
  return typeof kind === 'string' ? kind : undefined
}

function resolveMessageKey(message: string, matchers: MessageMatcher[]) {
  for (const matcher of matchers) {
    if (matcher.exact && matcher.exact === message) return matcher.key
    if (matcher.startsWith && message.startsWith(matcher.startsWith)) return matcher.key
  }
  return null
}

export function localizeApiErrorMessage(
  error: unknown,
  t: Translate,
  fallbackKey?: string,
  customMatchers: MessageMatcher[] = [],
) {
  const rawMessage = readErrorMessage(error)
  const status = readErrorStatus(error)
  const kind = readErrorKind(error)
  const messageKey = rawMessage ? resolveMessageKey(rawMessage, [...customMatchers, ...BACKEND_MESSAGE_MATCHERS]) : null

  if (messageKey) {
    const translated = t(messageKey)
    if (translated !== messageKey) return translated
  }

  if (kind === 'network') {
    const networkTranslation = t('common.error.network_unavailable')
    if (networkTranslation !== 'common.error.network_unavailable') return networkTranslation
  }

  if (kind === 'timeout') {
    const timeoutTranslation = t('common.error.timeout')
    if (timeoutTranslation !== 'common.error.timeout') return timeoutTranslation
  }

  if (kind === 'server') {
    const serverTranslation = t('common.error.server_unavailable')
    if (serverTranslation !== 'common.error.server_unavailable') return serverTranslation
  }

  if (status === 423) {
    const lockedTranslation = t('auth.error.account_locked')
    if (lockedTranslation !== 'auth.error.account_locked') return lockedTranslation
  }

  if (fallbackKey) return t(fallbackKey)
  if (rawMessage) return rawMessage
  return ''
}
