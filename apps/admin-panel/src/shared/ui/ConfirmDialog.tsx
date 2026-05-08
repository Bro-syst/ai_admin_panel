import type { ReactNode, RefObject } from 'react'
import { useEffect, useId, useRef } from 'react'
import { useI18n } from '@/core/i18n/useI18n'

type ConfirmDialogTone = 'default' | 'danger'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  tone?: ConfirmDialogTone
  isSubmitting?: boolean
  children?: ReactNode
  initialFocusRef?: RefObject<HTMLElement | null>
  disableInitialFocus?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'default',
  isSubmitting = false,
  children,
  initialFocusRef,
  disableInitialFocus = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (disableInitialFocus) {
      return () => {
        document.body.style.overflow = previousOverflow

        if (previousFocusRef.current?.isConnected) {
          previousFocusRef.current.focus()
        }
      }
    }

    const frameId = window.requestAnimationFrame(() => {
      initialFocusRef?.current?.focus() ?? cancelButtonRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      document.body.style.overflow = previousOverflow

      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus()
      }
    }
  }, [disableInitialFocus, initialFocusRef, isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (!isSubmitting) onCancel()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)
        : []

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey) {
        if (activeElement === firstElement || !dialogRef.current?.contains(activeElement)) {
          event.preventDefault()
          lastElement.focus()
        }
        return
      }

      if (activeElement === lastElement || !dialogRef.current?.contains(activeElement)) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onCancel])

  if (!isOpen) return null

  const confirmToneClassName =
    tone === 'danger'
      ? 'border-rose-300 bg-rose-600 text-white hover:bg-rose-700 disabled:border-rose-300 disabled:bg-rose-300'
      : 'border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[1px]"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-bold text-[var(--text)]">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-[var(--text-muted)]">
          {description}
        </p>

        {children}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel ?? t('common.cancel')}
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
            className={[
              'inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
              confirmToneClassName,
            ].join(' ')}
          >
            {isSubmitting ? t('common.loading') : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
