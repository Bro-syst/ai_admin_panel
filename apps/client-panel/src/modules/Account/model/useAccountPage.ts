import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { localizeApiErrorMessage, type MessageMatcher } from '@/core/api/errors/localizeApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import type { AppNotice } from '@/core/notices/types'
import { useAccountTotpSection } from '@/modules/Account/model/useAccountTotpSection'
import { sanitizeEmailInput } from '@/shared/lib/email'

const emailSchema = z.string().email()
const RESEND_COOLDOWN_SECONDS = 30
const SESSION_ERROR_MATCHERS: MessageMatcher[] = [{ exact: 'Session not found.', key: 'account.sessions.not_found' }]

type AccountFeedback = Pick<AppNotice, 'tone' | 'title' | 'description'> | null

export function useAccountPage() {
  const { user, authState, changeEmail, resendEmailVerification, reload, listSessions, revokeSession, logoutAll } = useAuth()
  const { locale, t } = useI18n()
  const totpSection = useAccountTotpSection(user)
  const isMountedRef = useRef(true)
  const [emailDraft, setEmailDraft] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isRefreshingVerification, setIsRefreshingVerification] = useState(false)
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0)
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listSessions>>>([])
  const [isSessionsLoading, setIsSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const [pendingRevokedSessionId, setPendingRevokedSessionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<AccountFeedback>(null)

  useEffect(() => {
    setEmailDraft(user?.email ?? '')
  }, [user?.email])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return
    const timer = window.setInterval(() => {
      setResendCooldownSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldownSeconds])

  const normalizedDraft = emailDraft.trim()
  const isEmailValid = emailSchema.safeParse(normalizedDraft).success
  const canEditEmail = authState?.verificationRequired === true
  const isSameEmail = normalizedDraft === (user?.email ?? '')
  const canSubmitEmailChange = canEditEmail && isEmailValid && !isSameEmail && !isChangingEmail
  const resendCooldownLabel = t('account.verification.cooldown').replace('{seconds}', String(resendCooldownSeconds))
  const canLogoutAllSessions = sessions.length > 0 && !isSessionsLoading && !isLoggingOutAll && pendingRevokedSessionId == null
  const feedbackNotice = useMemo<AppNotice | null>(() => {
    if (!feedback) return null
    return {
      id: 'account-feedback',
      priority: 0,
      tone: feedback.tone,
      title: feedback.title,
      description: feedback.description,
    }
  }, [feedback])

  const loadSessions = useCallback(async () => {
    setIsSessionsLoading(true)
    setSessionsError(null)

    try {
      const nextSessions = await listSessions()
      if (!isMountedRef.current) return
      setSessions(nextSessions)
    } catch (error: unknown) {
      if (!isMountedRef.current) return
      setSessions([])
      setSessionsError(localizeApiErrorMessage(error, t, 'account.sessions.load_error', SESSION_ERROR_MATCHERS))
    } finally {
      if (isMountedRef.current) {
        setIsSessionsLoading(false)
      }
    }
  }, [listSessions, t])

  useEffect(() => {
    if (!user) {
      setSessions([])
      setIsSessionsLoading(false)
      setSessionsError(null)
      return
    }

    void loadSessions()
  }, [loadSessions, user])

  async function handleResendEmail() {
    if (!canEditEmail || isResending || resendCooldownSeconds > 0) return

    setIsResending(true)
    setFeedback(null)
    try {
      const result = await resendEmailVerification()
      if (result.status === 'already_verified') {
        setFeedback({
          tone: 'success',
          title: t('account.verification.already_verified'),
          description: t('account.verified.description'),
        })
        return
      }

      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS)
      setFeedback({
        tone: 'success',
        title: t('account.verification.sent_title'),
        description: t('account.verification.sent_description').replace('{email}', user?.email ?? ''),
      })
    } catch (error: unknown) {
      const message = localizeApiErrorMessage(error, t, 'account.verification.submit_error')
      setFeedback({
        tone: 'warning',
        title: t('account.verification.submit_error'),
        description: message === t('account.verification.submit_error') ? undefined : message,
      })
    } finally {
      setIsResending(false)
    }
  }

  async function handleRefreshVerificationStatus() {
    if (!canEditEmail || isRefreshingVerification) return

    setIsRefreshingVerification(true)
    setFeedback(null)

    try {
      await reload()
      if (!isMountedRef.current) return

      setFeedback({
        tone: 'success',
        title: t('account.verification.refresh_success_title'),
        description: t('account.verification.refresh_success_description'),
      })
    } catch (error: unknown) {
      if (!isMountedRef.current) return
      const message = localizeApiErrorMessage(error, t, 'account.verification.refresh_error')
      setFeedback({
        tone: 'warning',
        title: t('account.verification.refresh_error'),
        description: message === t('account.verification.refresh_error') ? undefined : message,
      })
    } finally {
      if (isMountedRef.current) {
        setIsRefreshingVerification(false)
      }
    }
  }

  async function handleChangeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEmailTouched(true)
    setFeedback(null)

    if (!canSubmitEmailChange) return

    setIsChangingEmail(true)
    try {
      await changeEmail(normalizedDraft)
      setResendCooldownSeconds(RESEND_COOLDOWN_SECONDS)
      setFeedback({
        tone: 'success',
        title: t('account.change_email.success_title'),
        description: t('account.change_email.success_description').replace('{email}', normalizedDraft),
      })
    } catch (error: unknown) {
      const message = localizeApiErrorMessage(error, t, 'account.change_email.submit_error')
      setFeedback({
        tone: 'warning',
        title: t('account.change_email.submit_error'),
        description: message === t('account.change_email.submit_error') ? undefined : message,
      })
    } finally {
      setIsChangingEmail(false)
    }
  }

  async function handleLogoutAllSessions() {
    if (!canLogoutAllSessions) return

    setIsLoggingOutAll(true)
    setFeedback(null)

    try {
      await logoutAll()
    } catch (error: unknown) {
      if (!isMountedRef.current) return
      const message = localizeApiErrorMessage(error, t, 'account.sessions.revoke_error', SESSION_ERROR_MATCHERS)
      setFeedback({
        tone: 'warning',
        title: t('account.sessions.revoke_error'),
        description: message === t('account.sessions.revoke_error') ? undefined : message,
      })
    } finally {
      if (isMountedRef.current) {
        setIsLoggingOutAll(false)
      }
    }
  }

  async function handleRevokeSession(sessionId: string) {
    if (pendingRevokedSessionId || isLoggingOutAll) return

    setPendingRevokedSessionId(sessionId)
    setFeedback(null)

    try {
      const result = await revokeSession(sessionId)
      if (!isMountedRef.current || result.current) return

      setSessions((current) => current.filter((session) => session.id !== result.sessionId))
      setFeedback({
        tone: 'success',
        title: t('account.sessions.revoke_success_title'),
        description: result.sessionId,
      })
    } catch (error: unknown) {
      if (!isMountedRef.current) return
      const message = localizeApiErrorMessage(error, t, 'account.sessions.revoke_error', SESSION_ERROR_MATCHERS)
      setFeedback({
        tone: 'warning',
        title: t('account.sessions.revoke_error'),
        description: message === t('account.sessions.revoke_error') ? undefined : message,
      })
    } finally {
      if (isMountedRef.current) {
        setPendingRevokedSessionId(null)
      }
    }
  }

  return {
    user,
    authState,
    locale,
    t,
    emailDraft,
    setEmailDraft,
    emailTouched,
    setEmailTouched,
    isChangingEmail,
    isResending,
    isRefreshingVerification,
    resendCooldownSeconds,
    sessions,
    isSessionsLoading,
    sessionsError,
    isLoggingOutAll,
    pendingRevokedSessionId,
    feedbackNotice,
    isEmailValid,
    canEditEmail,
    isSameEmail,
    canSubmitEmailChange,
    resendCooldownLabel,
    canLogoutAllSessions,
    handleResendEmail,
    handleRefreshVerificationStatus,
    handleChangeEmail,
    handleLogoutAllSessions,
    handleRevokeSession,
    sanitizeEmailInput,
    totpSection,
  }
}

export type AccountPageController = ReturnType<typeof useAccountPage>
