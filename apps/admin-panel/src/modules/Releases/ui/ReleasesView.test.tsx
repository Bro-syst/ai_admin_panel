import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { ReleasesManager } from '@/modules/Releases/model/useReleasesManager'
import { ReleasesView } from '@/modules/Releases/ui/ReleasesView'

function renderView(manager: Partial<ReleasesManager> = {}) {
  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: { agentId: 'agent_1', tenantId: 'tenant_1', name: 'Sales agent', supportedMutationActions: ['releases.manage'] },
    readiness: {
      agentId: 'agent_1',
      readinessStatus: 'ready',
      releaseReady: true,
      gateMode: null,
      blockingItemCount: 0,
      items: [{ itemId: 'config', ownerArea: 'config', state: 'ready', blocking: true, detail: 'Config ready', requiredAction: null }],
      currentReleaseId: null,
      currentReleaseVersion: null,
      currentReleaseStatus: null,
      currentReleaseGateMode: null,
      currentReleaseManualOverride: null,
      activeReleasePresent: true,
      activeReleaseId: 'release_1',
      activeReleaseVersion: 3,
      activeReleaseStatus: 'published',
      activeReleaseGateMode: 'standard',
      activeReleaseManualOverride: null,
      latestReleaseId: 'release_1',
      latestReleaseVersion: 3,
      latestReleaseStatus: 'published',
      latestReleaseGateMode: 'standard',
      latestReleaseManualOverride: null,
      evaluationEvidenceOwnerMarker: 'backend',
      publishOwnerMarker: 'backend',
    },
    releases: [{ releaseId: 'release_1', releaseVersion: 3, status: 'published', gateMode: 'standard', active: true, selectedConfigVersion: 7, evidenceReference: 'evidence_1', manualOverrideUsed: false, createdAt: '2026-05-13T10:00:00Z' }],
    selectedRelease: {
      releaseId: 'release_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      releaseVersion: 3,
      status: 'published',
      gateMode: 'standard',
      active: true,
      createdAt: '2026-05-13T10:00:00Z',
      updatedAt: '2026-05-13T10:00:00Z',
      selectedConfigVersion: 7,
      evidenceReference: 'evidence_1',
      evidencePassed: true,
      manualOverride: { used: false, status: null, reasonCode: null, approvalActorId: null, correlationId: null, relatedMissingOrFailedItems: [], comment: null },
      readinessItems: [{ itemId: 'config', ownerArea: 'config', state: 'ready', blocking: true, detail: 'Config ready', requiredAction: null }],
      missingOrFailedItems: [],
    },
    draftForm: {
      selectedConfigId: 'config_7',
      releaseCandidateId: '',
      evidenceStableReference: 'evidence_1',
      evidenceChangeKind: 'runtime_behavior',
      evidencePassed: true,
      smokeCaseId: '',
      smokeCasePassed: true,
      smokeCaseReference: '',
      smokeCaseOutcome: '',
      manualOverrideReasonCode: '',
      manualOverrideItemsText: '',
      manualOverrideComment: '',
    },
    publishForm: {
      supportReconstructionReference: 'support_1',
      usageChatId: '',
      usageConversationTurnId: '',
      usageModelRequestId: '',
      billingExportReference: '',
      releaseReportReference: 'report_1',
    },
    mutationResult: null,
    canManageReleases: true,
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadReleases: vi.fn(),
    selectRelease: vi.fn(),
    setDraftForm: vi.fn(),
    setPublishForm: vi.fn(),
    createRelease: vi.fn(),
    publishSelected: vi.fn(),
    rollbackSelected: vi.fn(),
    disableSelected: vi.fn(),
    ...manager,
  } as unknown as ReleasesManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1/releases']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ReleasesView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('ReleasesView', () => {
  beforeEach(() => {
    window.localStorage.setItem('ai_admin_panel:locale_v1', 'en')
  })

  it('renders readiness, release history and detail evidence without future links', () => {
    renderView()

    expect(screen.getByText('Releases')).toBeInTheDocument()
    expect(screen.getByText('Release readiness')).toBeInTheDocument()
    expect(screen.getByText('Release detail v3')).toBeInTheDocument()
    expect(screen.getByText('evidence_1')).toBeInTheDocument()
    expect(screen.getByLabelText('Manual override comment')).toBeInTheDocument()
    expect(screen.getAllByText('Backend release workflow').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Agent configuration: Ready - Active configuration is present and accepted').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /Conversations/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Usage/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Billing/i })).not.toBeInTheDocument()
  })

  it('localizes release backend markers and readiness evidence in Russian', () => {
    window.localStorage.setItem('ai_admin_panel:locale_v1', 'ru')

    renderView({
      readiness: {
        agentId: 'agent_1',
        readinessStatus: 'ready',
        releaseReady: true,
        gateMode: null,
        blockingItemCount: 0,
        items: [{ itemId: 'agent_config', ownerArea: 'agent_config', state: 'ready', blocking: true, detail: 'Active AgentConfig is present and accepted by the foundation policy.', requiredAction: null }],
        currentReleaseId: null,
        currentReleaseVersion: null,
        currentReleaseStatus: null,
        currentReleaseGateMode: null,
        currentReleaseManualOverride: null,
        activeReleasePresent: false,
        activeReleaseId: null,
        activeReleaseVersion: null,
        activeReleaseStatus: null,
        activeReleaseGateMode: 'stage24_release_validation',
        activeReleaseManualOverride: null,
        latestReleaseId: null,
        latestReleaseVersion: null,
        latestReleaseStatus: null,
        latestReleaseGateMode: 'standard',
        latestReleaseManualOverride: null,
        evaluationEvidenceOwnerMarker: 'backend',
        publishOwnerMarker: 'stage24_release_workflow',
      },
      selectedRelease: null,
      releases: [],
    })

    expect(screen.getAllByText('Релизы').length).toBeGreaterThan(0)
    expect(screen.getByText('Backend-процесс релиза')).toBeInTheDocument()
    expect(screen.getByText('Проверка релиза')).toBeInTheDocument()
    expect(screen.getByText('Стандартная проверка релиза')).toBeInTheDocument()
    expect(screen.getByText('Конфигурация агента: Готово - Активная конфигурация создана и принята')).toBeInTheDocument()
    expect(screen.queryByText('stage24_release_workflow')).not.toBeInTheDocument()
    expect(screen.queryByText('Active AgentConfig is present and accepted by the foundation policy.')).not.toBeInTheDocument()
  })

  it('lets operators edit optional manual override comment before draft creation', async () => {
    const setDraftForm = vi.fn()
    renderView({ setDraftForm })

    fireEvent.change(screen.getByPlaceholderText('Manual override comment'), { target: { value: 'Approved by launch owner.' } })

    expect(setDraftForm).toHaveBeenCalled()
  })

  it('confirms publish, rollback and disable with release context', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Publish' }))
    await user.click(screen.getByRole('button', { name: 'Rollback' }))
    await user.click(screen.getByRole('button', { name: 'Disable' }))

    expect(confirmSpy).toHaveBeenNthCalledWith(1, 'Publish release: v3, Published, Standard release check, Active=Yes')
    expect(confirmSpy).toHaveBeenNthCalledWith(2, 'Rollback release: v3, Published, Standard release check, Active=Yes')
    expect(confirmSpy).toHaveBeenNthCalledWith(3, 'Disable release: v3, Published, Standard release check, Active=Yes')
    expect(manager.publishSelected).toHaveBeenCalled()
    expect(manager.rollbackSelected).toHaveBeenCalled()
    expect(manager.disableSelected).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('disables mutation controls when backend action refs do not allow release management', () => {
    renderView({ canManageReleases: false, releases: [] })

    expect(screen.getByRole('button', { name: 'Create release draft' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create release draft' })).toHaveAttribute('title', 'Insufficient permissions to create a release.')
    expect(screen.getByLabelText('Selected config ID')).toHaveAttribute('title', 'Insufficient permissions to create a release.')
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Rollback' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Disable' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect releases but cannot change them.')).toBeInTheDocument()
    expect(screen.getByText('Release checks passed. Contact a platform_admin to publish the release.')).toBeInTheDocument()
    expect(screen.getByText('No releases have been created yet.')).toBeInTheDocument()
  })
})
