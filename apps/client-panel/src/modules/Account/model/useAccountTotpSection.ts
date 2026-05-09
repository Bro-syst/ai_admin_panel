import { useCallback, useEffect, useMemo, useState } from 'react'
import { localizeApiErrorMessage } from '@/core/api/errors/localizeApiErrorMessage'
import type { AuthUser } from '@/core/auth/authService'
import { securityService, type TotpEnrollment, type TotpState } from '@/core/auth/securityService'
import { useI18n } from '@/core/i18n/useI18n'
import type { AppNotice } from '@/core/notices/types'

type TotpFeedback = Pick<AppNotice, 'tone' | 'title' | 'description'> | null

function sanitizeOtpCode(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, 6)
}

export function useAccountTotpSection(user: Pick<AuthUser, 'emailVerified'> | null | undefined) {
  const { t } = useI18n()
  const [totp, setTotp] = useState<TotpState | null>(null)
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null)
  const [isStatusLoading, setIsStatusLoading] = useState(true)
  const [isStartingEnrollment, setIsStartingEnrollment] = useState(false)
  const [isConfirmingEnrollment, setIsConfirmingEnrollment] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [isStartingRecovery, setIsStartingRecovery] = useState(false)
  const [isConfirmingRecovery, setIsConfirmingRecovery] = useState(false)
  const [enrollmentCode, setEnrollmentCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [recoveryStarted, setRecoveryStarted] = useState(false)
  const [feedback, setFeedback] = useState<TotpFeedback>(null)

  const feedbackNotice = useMemo<AppNotice | null>(() => {
    if (!feedback) return null
    return {
      id: 'account-totp-feedback',
      priority: 0,
      tone: feedback.tone,
      title: feedback.title,
      description: feedback.description,
    }
  }, [feedback])

  const loadStatus = useCallback(async () => {
    setIsStatusLoading(true)

    try {
      const nextStatus = await securityService.getTotpStatus()
      setTotp(nextStatus)
    } catch (error: unknown) {
      setFeedback({
        tone: 'warning',
        title: t('account.totp.error.status'),
        description: localizeApiErrorMessage(error, t, 'account.totp.error.status'),
      })
    } finally {
      setIsStatusLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const hasPendingEnrollment = totp?.pendingEnrollment === true
  const hasEnabledTotp = totp?.enabled === true
  const isStatusKnown = totp != null
  const pendingEnrollmentWithoutPayload = hasPendingEnrollment && enrollment == null
  const canStartEnrollment = !hasEnabledTotp && !isStartingEnrollment
  const canConfirmEnrollment = enrollmentCode.length === 6 && !isConfirmingEnrollment
  const canDisableTotp = hasEnabledTotp && disableCode.length === 6 && !isDisabling
  const canStartRecovery =
    hasEnabledTotp && user?.emailVerified === true && !isStartingRecovery && !isConfirmingRecovery
  const canConfirmRecovery = recoveryStarted && recoveryCode.length === 6 && !isConfirmingRecovery
  const startEnrollmentLabel = hasPendingEnrollment
    ? t('account.totp.enrollment.restart')
    : t('account.totp.enrollment.open')

  async function handleStartEnrollment() {
    if (!canStartEnrollment) return

    setFeedback(null)
    setIsStartingEnrollment(true)

    try {
      const result = await securityService.beginTotpEnrollment()
      setTotp(result.totp)
      setEnrollment(result.enrollment)
      setEnrollmentCode('')
    } catch (error: unknown) {
      setFeedback({
        tone: 'warning',
        title: t('account.totp.error.enrollment'),
        description: localizeApiErrorMessage(error, t, 'account.totp.error.enrollment'),
      })
    } finally {
      setIsStartingEnrollment(false)
    }
  }

  async function handleConfirmEnrollment() {
    if (!canConfirmEnrollment) return

    setFeedback(null)
    setIsConfirmingEnrollment(true)

    try {
      const result = await securityService.confirmTotpEnrollment(enrollmentCode)
      setTotp(result.totp)
      setEnrollment(null)
      setEnrollmentCode('')
      setRecoveryStarted(false)
      setRecoveryCode('')
      setFeedback({
        tone: 'success',
        title: t('account.totp.confirm.success_title'),
        description: t('account.totp.confirm.success_description'),
      })
    } catch (error: unknown) {
      setFeedback({
        tone: 'warning',
        title: t('account.totp.error.confirm'),
        description: localizeApiErrorMessage(error, t, 'account.totp.error.confirm'),
      })
    } finally {
      setIsConfirmingEnrollment(false)
    }
  }

  async function handleDisableTotp() {
    if (!canDisableTotp) return

    setFeedback(null)
    setIsDisabling(true)

    try {
      const result = await securityService.disableTotp(disableCode)
      setTotp(result.totp)
      setEnrollment(null)
      setDisableCode('')
      setEnrollmentCode('')
      setRecoveryStarted(false)
      setRecoveryCode('')
      setFeedback({
        tone: 'success',
        title: t('account.totp.disable.success_title'),
        description: t('account.totp.disable.success_description'),
      })
    } catch (error: unknown) {
      setFeedback({
        tone: 'warning',
        title: t('account.totp.error.disable'),
        description: localizeApiErrorMessage(error, t, 'account.totp.error.disable'),
      })
    } finally {
      setIsDisabling(false)
    }
  }

  async function handleStartRecovery() {
    if (!canStartRecovery) return

    setFeedback(null)
    setIsStartingRecovery(true)

    try {
      await securityService.startTotpRecovery()
      setRecoveryStarted(true)
      setRecoveryCode('')
      setFeedback({
        tone: 'success',
        title: t('account.totp.recovery.sent_title'),
        description: t('account.totp.recovery.sent_description'),
      })
    } catch (error: unknown) {
      setFeedback({
        tone: 'warning',
        title: t('account.totp.error.recovery_start'),
        description: localizeApiErrorMessage(error, t, 'account.totp.error.recovery_start'),
      })
    } finally {
      setIsStartingRecovery(false)
    }
  }

  async function handleConfirmRecovery() {
    if (!canConfirmRecovery) return

    setFeedback(null)
    setIsConfirmingRecovery(true)

    try {
      const result = await securityService.confirmTotpRecovery(recoveryCode)
      setTotp(result.totp)
      setEnrollment(null)
      setRecoveryStarted(false)
      setRecoveryCode('')
      setDisableCode('')
      setFeedback({
        tone: 'success',
        title: t('account.totp.recovery.success_title'),
        description: t('account.totp.recovery.success_description'),
      })
    } catch (error: unknown) {
      setFeedback({
        tone: 'warning',
        title: t('account.totp.error.recovery_confirm'),
        description: localizeApiErrorMessage(error, t, 'account.totp.error.recovery_confirm'),
      })
    } finally {
      setIsConfirmingRecovery(false)
    }
  }

  return {
    t,
    totp,
    enrollment,
    isStatusLoading,
    isStartingEnrollment,
    isConfirmingEnrollment,
    isDisabling,
    isStartingRecovery,
    isConfirmingRecovery,
    isStatusKnown,
    enrollmentCode,
    disableCode,
    recoveryCode,
    recoveryStarted,
    hasEnabledTotp,
    hasPendingEnrollment,
    pendingEnrollmentWithoutPayload,
    canStartEnrollment,
    canConfirmEnrollment,
    canDisableTotp,
    canStartRecovery,
    canConfirmRecovery,
    startEnrollmentLabel,
    feedbackNotice,
    handleReloadStatus: loadStatus,
    setEnrollmentCode: (value: string) => setEnrollmentCode(sanitizeOtpCode(value)),
    setDisableCode: (value: string) => setDisableCode(sanitizeOtpCode(value)),
    setRecoveryCode: (value: string) => setRecoveryCode(sanitizeOtpCode(value)),
    handleStartEnrollment,
    handleConfirmEnrollment,
    handleDisableTotp,
    handleStartRecovery,
    handleConfirmRecovery,
  }
}

export type AccountTotpSectionController = ReturnType<typeof useAccountTotpSection>
