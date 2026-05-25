import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '@/core/i18n/useI18n'
import {
  beginAdminTotpEnrollment,
  confirmAdminTotpEnrollment,
  disableAdminTotp,
  getAdminTotpState,
  isAdminAccountLockedError,
  readApiErrorMessage,
  type AdminTotpEnrollment,
  type AdminTotpState,
} from '@/modules/AdminSecurity/api/adminSecurityApi'

type TotpPanelStatus = 'loading' | 'ready' | 'error'
type TotpPendingAction = 'enrollment' | 'confirm' | 'disable' | null

function isValidationLikeError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const payload = error as { kind?: string }
  return payload.kind === 'validation'
}

export function useAdminTotpManager() {
  const { t } = useI18n()
  const [status, setStatus] = useState<TotpPanelStatus>('loading')
  const [totp, setTotp] = useState<AdminTotpState | null>(null)
  const [enrollment, setEnrollment] = useState<AdminTotpEnrollment | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadErrorCause, setLoadErrorCause] = useState<unknown>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionErrorCause, setActionErrorCause] = useState<unknown>(null)
  const [pendingAction, setPendingAction] = useState<TotpPendingAction>(null)

  const applyTotpState = useCallback((nextTotp: AdminTotpState, nextEnrollment?: AdminTotpEnrollment | null) => {
    setTotp(nextTotp)
    setEnrollment((currentEnrollment) => {
      if (nextTotp.enabled || !nextTotp.pendingEnrollment) return null
      return nextEnrollment === undefined ? currentEnrollment : nextEnrollment
    })
  }, [])

  const clearFeedback = useCallback(() => {
    setNotice(null)
    setActionError(null)
    setActionErrorCause(null)
  }, [])

  const syncFromServer = useCallback(async () => {
    const nextTotp = await getAdminTotpState()
    applyTotpState(nextTotp)
    setStatus('ready')
    return nextTotp
  }, [applyTotpState])

  const load = useCallback(async () => {
    setStatus('loading')
    setLoadError(null)
    setLoadErrorCause(null)

    try {
      await syncFromServer()
    } catch (nextError) {
      if (isAdminAccountLockedError(nextError)) return
      setLoadError(readApiErrorMessage(nextError, t('settings.totp.load_error'), t))
      setLoadErrorCause(nextError)
      setStatus('error')
    }
  }, [syncFromServer, t])

  useEffect(() => {
    void load()
  }, [load])

  const beginEnrollment = useCallback(async () => {
    setPendingAction('enrollment')
    clearFeedback()

    try {
      const result = await beginAdminTotpEnrollment()
      applyTotpState(result.totp, result.enrollment)
      setStatus('ready')
      setNotice(t('settings.totp.notice_enrollment_started'))
    } catch (nextError) {
      if (isAdminAccountLockedError(nextError)) return

      if (isValidationLikeError(nextError)) {
        setEnrollment(null)
        try {
          await syncFromServer()
        } catch {
          return
        }
      }

      setActionError(readApiErrorMessage(nextError, t('settings.totp.enrollment_error'), t))
      setActionErrorCause(nextError)
    } finally {
      setPendingAction(null)
    }
  }, [applyTotpState, clearFeedback, syncFromServer, t])

  const confirmEnrollment = useCallback(
    async (code: string) => {
      setPendingAction('confirm')
      clearFeedback()

      try {
        if (!enrollment?.enrollmentId) {
          throw new Error(t('settings.totp.confirm_error'))
        }

        const result = await confirmAdminTotpEnrollment(enrollment.enrollmentId, code)
        applyTotpState(result.totp, null)
        setStatus('ready')
        setNotice(t('settings.totp.notice_confirmed'))
      } catch (nextError) {
        if (isAdminAccountLockedError(nextError)) return

        setActionError(readApiErrorMessage(nextError, t('settings.totp.confirm_error'), t))
        setActionErrorCause(nextError)
      } finally {
        setPendingAction(null)
      }
    },
    [applyTotpState, clearFeedback, enrollment?.enrollmentId, t],
  )

  const disableTotp = useCallback(
    async (code: string) => {
      setPendingAction('disable')
      clearFeedback()

      try {
        const result = await disableAdminTotp(code)
        applyTotpState(result.totp, null)
        setStatus('ready')
        setNotice(t('settings.totp.notice_disabled'))
      } catch (nextError) {
        if (isAdminAccountLockedError(nextError)) return

        setActionError(readApiErrorMessage(nextError, t('settings.totp.disable_error'), t))
        setActionErrorCause(nextError)
      } finally {
        setPendingAction(null)
      }
    },
    [applyTotpState, clearFeedback, t],
  )

  return {
    status,
    totp,
    enrollment,
    loadError,
    loadErrorCause,
    notice,
    actionError,
    actionErrorCause,
    pendingAction,
    reload: load,
    beginEnrollment,
    confirmEnrollment,
    disableTotp,
  }
}
