import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title, description, and forwards confirm/cancel actions', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <I18nProvider>
        <ConfirmDialog
          isOpen
          title="Archive account"
          description="Archive this account and revoke all active sessions?"
          confirmLabel="Archive"
          tone="danger"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </I18nProvider>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Archive account')).toBeInTheDocument()
    expect(screen.getByText('Archive this account and revoke all active sessions?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Archive' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('moves focus into the dialog, traps tab navigation, and restores focus on close', async () => {
    const user = userEvent.setup()

    function DialogHarness() {
      const [isOpen, setIsOpen] = useState(false)

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open dialog
          </button>
          <ConfirmDialog
            isOpen={isOpen}
            title="Archive account"
            description="Archive this account and revoke all active sessions?"
            confirmLabel="Archive"
            tone="danger"
            onConfirm={() => undefined}
            onCancel={() => setIsOpen(false)}
          />
        </>
      )
    }

    render(
      <I18nProvider>
        <DialogHarness />
      </I18nProvider>,
    )

    const trigger = screen.getByRole('button', { name: 'Open dialog' })
    trigger.focus()

    await user.click(trigger)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const confirmButton = screen.getByRole('button', { name: 'Archive' })

    await waitFor(() => {
      expect(cancelButton).toHaveFocus()
    })

    await user.tab()
    expect(confirmButton).toHaveFocus()

    await user.tab()
    expect(cancelButton).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
