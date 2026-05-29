import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { CopyableValue, InfoGrid, ListBlock, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'

function renderWithI18n(ui: ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>)
}

describe('EntityInfo shared UI', () => {
  it('renders status tones, grids and list fallbacks', () => {
    renderWithI18n(
      <div>
        <StatusBadge status="active" />
        <StatusBadge status="blocked" label="Blocked label" />
        <StatusBadge status="pending" />
        <InfoGrid items={[{ label: 'Tenant ID', value: <CopyableValue value="tenant_1" /> }]} />
        <ListBlock title="Values" values={['one', 'two']} />
        <ListBlock title="Empty values" values={[]} emptyLabel="Nothing yet" />
      </div>,
    )

    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('Blocked label')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('Tenant ID')).toBeInTheDocument()
    expect(screen.getByText('tenant_1')).toBeInTheDocument()
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
    expect(screen.getByText('Nothing yet')).toBeInTheDocument()
  })

  it('copies values and hides optional mutation fields when requested', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    renderWithI18n(
      <MutationResultBlock
        title="Mutation"
        hideMissingOptionalFields
        result={{
          action: 'activate_config',
          resourceType: 'agent_config',
          resourceId: 'config_1',
          requestId: 'req_1',
          mutationTimestamp: '2026-05-20T10:00:00Z',
          status: null,
          version: null,
        }}
      />,
    )

    const evidence = screen.getByRole('heading', { name: 'Mutation' }).closest('section')
    expect(evidence).not.toBeNull()
    const evidenceScope = within(evidence as HTMLElement)

    expect(evidenceScope.getByText('config_1')).toBeInTheDocument()
    expect(evidenceScope.getByText('req_1')).toBeInTheDocument()
    expect(evidenceScope.queryByText('Status / result')).not.toBeInTheDocument()
    expect(evidenceScope.queryByText('Version')).not.toBeInTheDocument()

    await user.click(evidenceScope.getAllByRole('button', { name: 'Copy' })[1])

    expect(writeText).toHaveBeenCalledWith('req_1')
    expect(await evidenceScope.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('renders empty copyable values without invoking clipboard access', () => {
    renderWithI18n(
      <div>
        <CopyableValue value="" label="Not returned" />
        <MutationResultBlock
          title="Mutation"
          result={{
            action: 'update',
            resourceType: 'agent',
            resourceId: null,
            mutationTimestamp: '2026-05-20T10:00:00Z',
          }}
        />
      </div>,
    )

    expect(screen.getByText('Not returned')).toBeInTheDocument()
    expect(screen.getAllByText('Not provided by backend').length).toBeGreaterThanOrEqual(3)
  })
})
