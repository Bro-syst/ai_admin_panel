import { describe, expect, it } from 'vitest'
import { getLocalizedApiErrorMessage } from './getLocalizedApiErrorMessage'

const messages: Record<string, string> = {
  'errors.backend.authentication_failed': 'Не удалось войти. Проверьте email и пароль.',
  'errors.backend.credential_configuration_failure': 'Учётные данные среды выполнения не настроены. Сообщение не дошло до модели, подтверждения использования не созданы.',
  'errors.kind.unauthorized': 'Сессия истекла. Войдите снова.',
}

function t(key: string) {
  return messages[key] ?? key
}

describe('getLocalizedApiErrorMessage', () => {
  it('localizes normalized api errors by backend code', () => {
    expect(
      getLocalizedApiErrorMessage(
        {
          kind: 'unauthorized',
          code: 'authentication_failed',
          message: 'Authentication failed',
        },
        t,
        'fallback',
      ),
    ).toBe('Не удалось войти. Проверьте email и пароль.')
  })

  it('localizes raw backend error envelopes from axios responses', () => {
    expect(
      getLocalizedApiErrorMessage(
        {
          response: {
            status: 401,
            data: {
              error_code: 'authentication_failed',
              message: 'Authentication failed',
              correlation_id: 'login-001',
            },
          },
        },
        t,
        'fallback',
      ),
    ).toBe('Не удалось войти. Проверьте email и пароль.')
  })

  it('uses normalized backend messages when no localized code is available', () => {
    expect(
      getLocalizedApiErrorMessage(
        {
          kind: 'conflict',
          message: 'retrieval_mode is not allowed for sources: source.faq.public_support_faq',
        },
        t,
        'fallback',
      ),
    ).toBe('retrieval_mode is not allowed for sources: source.faq.public_support_faq')
  })

  it('localizes runtime credential configuration failures', () => {
    expect(
      getLocalizedApiErrorMessage(
        {
          kind: 'server',
          code: 'credential_configuration_failure',
          message: 'Check the entered data',
        },
        t,
        'fallback',
      ),
    ).toBe('Учётные данные среды выполнения не настроены. Сообщение не дошло до модели, подтверждения использования не созданы.')
  })
})
