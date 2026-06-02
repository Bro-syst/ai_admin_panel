import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { knowledgeApi } from '@/modules/Knowledge/api/knowledgeApi'
import { useKnowledgeManager } from '@/modules/Knowledge/model/useKnowledgeManager'

vi.mock('@/modules/Knowledge/api/knowledgeApi', () => ({
  knowledgeApi: {
    listPortalSources: vi.fn(),
    getPortalReleaseReadiness: vi.fn(),
    listRetrievalRuns: vi.fn(),
    getPortalSourceDetail: vi.fn(),
    createSource: vi.fn(),
  },
}))

function mockApi(method: keyof typeof knowledgeApi) {
  return knowledgeApi[method] as unknown as Mock
}

function sourceCard(sourceId = 'source_1') {
  const source = {
    id: sourceId,
    tenantId: 'tenant_1',
    sourceKey: 'sales_faq',
    name: 'Sales FAQ',
    sourceKind: 'faq',
    allowedAgentScope: 'agent_ids',
    allowedAgentIds: ['agent_1'],
    accessScope: 'tenant_restricted',
    status: 'ready',
    contentRevision: 'v1',
    readinessStatus: 'ready',
    metadata: {},
    sourceSetEligibilityMarker: null,
    idempotencyKey: null,
    createdByCorrelationId: null,
    updatedByCorrelationId: null,
  }

  return {
    source,
    lifecycle: {
      status: 'ready',
      readinessStatus: 'ready',
      sourceSetEligibilityMarker: null,
      documentCount: 0,
      indexingRequired: false,
      downstreamOwner: 'backend',
    },
    readiness: {
      tenantId: 'tenant_1',
      sourceId,
      indexId: null,
      latestIndexVersionId: null,
      readinessStatus: 'ready',
      sourceSetReadinessMarker: null,
      membershipFingerprint: null,
      chunkCount: 0,
      vectorizationCount: 0,
      failedJobCount: 0,
      retryableJobCount: 0,
    },
    latestJob: null,
    failedOrRetryable: false,
  }
}

function Probe() {
  const manager = useKnowledgeManager('tenant_1', 'agent_1', true)

  return (
    <div>
      <span data-testid="loading">{String(manager.isLoading)}</span>
      <span data-testid="error">{manager.errorMessage ?? 'none'}</span>
      <span data-testid="retrieval-error">{manager.retrievalErrorMessage ?? 'none'}</span>
      <span data-testid="source-count">{manager.sources.length}</span>
      <span data-testid="selected-source">{manager.selectedSourceDetail?.source.id ?? 'none'}</span>
      <span data-testid="notice">{manager.notice ?? 'none'}</span>
      <span data-testid="warning">{manager.warningMessage ?? 'none'}</span>
      <button
        type="button"
        onClick={() => manager.setSourceForm((current) => ({
          ...current,
          sourceKey: 'sales_faq',
          name: 'Sales FAQ',
          contentRevision: 'v1',
        }))}
      >
        prepare source
      </button>
      <button type="button" onClick={() => void manager.createSource()}>
        create source
      </button>
    </div>
  )
}

describe('useKnowledgeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps knowledge data available when retrieval history returns a non-fatal conflict', async () => {
    const card = sourceCard()
    mockApi('listPortalSources').mockResolvedValue({ items: [card] })
    mockApi('getPortalReleaseReadiness').mockResolvedValue({
      tenantId: 'tenant_1',
      ownerStage: 'stage_08',
      sourceCount: 1,
      readySourceCount: 1,
      failedOrRetryableSourceCount: 0,
      releaseReady: true,
      sources: [],
    })
    mockApi('listRetrievalRuns').mockRejectedValue({ kind: 'conflict', code: 'conflict' })
    mockApi('getPortalSourceDetail').mockResolvedValue({
      ...card,
      documents: [],
      jobs: [],
      chunks: [],
    })

    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    expect(screen.getByTestId('source-count')).toHaveTextContent('1')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
    expect(screen.getByTestId('retrieval-error')).not.toHaveTextContent('none')
    expect(mockApi('listPortalSources')).toHaveBeenCalledWith('tenant_1', 'agent_1')
    expect(mockApi('getPortalReleaseReadiness')).toHaveBeenCalledWith('tenant_1', 'agent_1')
    expect(mockApi('getPortalSourceDetail')).toHaveBeenCalledWith('tenant_1', 'agent_1', 'source_1')
    expect(mockApi('listRetrievalRuns')).toHaveBeenCalledWith('tenant_1', { agentId: 'agent_1' })
  })

  it('auto-selects a created source only after the agent-scoped list returns it', async () => {
    const user = userEvent.setup()
    const createdCard = sourceCard('source_2')
    mockApi('listPortalSources')
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ items: [createdCard] })
    mockApi('getPortalReleaseReadiness').mockResolvedValue({
      tenantId: 'tenant_1',
      ownerStage: 'stage_08',
      sourceCount: 1,
      readySourceCount: 0,
      failedOrRetryableSourceCount: 0,
      releaseReady: false,
      sources: [],
    })
    mockApi('listRetrievalRuns').mockResolvedValue({ items: [] })
    mockApi('getPortalSourceDetail').mockResolvedValue({
      ...createdCard,
      documents: [],
      jobs: [],
      chunks: [],
    })
    mockApi('createSource').mockResolvedValue({
      resource: createdCard.source,
      result: {
        action: 'create_knowledge_source',
        resourceType: 'knowledge_source',
        resourceId: 'source_2',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_2',
        mutationTimestamp: '2026-06-01T00:00:00Z',
        changedStateSummary: {},
      },
    })

    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await user.click(screen.getByRole('button', { name: 'prepare source' }))
    await user.click(screen.getByRole('button', { name: 'create source' }))

    await waitFor(() => expect(screen.getByTestId('selected-source')).toHaveTextContent('source_2'))

    expect(mockApi('createSource')).toHaveBeenCalledWith('tenant_1', expect.objectContaining({
      allowedAgentIds: ['agent_1'],
      allowedAgentScope: 'agent_ids',
    }))
    expect(mockApi('listPortalSources')).toHaveBeenLastCalledWith('tenant_1', 'agent_1')
    expect(mockApi('getPortalSourceDetail')).toHaveBeenLastCalledWith('tenant_1', 'agent_1', 'source_2')
    expect(screen.getByTestId('notice')).toHaveTextContent('Source was created and is available to the current agent')
    expect(screen.getByTestId('warning')).toHaveTextContent('none')
  })

  it('warns when a created source is absent from the agent-scoped list after reload', async () => {
    const user = userEvent.setup()
    const createdCard = sourceCard('source_2')
    mockApi('listPortalSources').mockResolvedValue({ items: [] })
    mockApi('getPortalReleaseReadiness').mockResolvedValue({
      tenantId: 'tenant_1',
      ownerStage: 'stage_08',
      sourceCount: 0,
      readySourceCount: 0,
      failedOrRetryableSourceCount: 0,
      releaseReady: false,
      sources: [],
    })
    mockApi('listRetrievalRuns').mockResolvedValue({ items: [] })
    mockApi('getPortalSourceDetail').mockResolvedValue({
      ...createdCard,
      documents: [],
      jobs: [],
      chunks: [],
    })
    mockApi('createSource').mockResolvedValue({
      resource: createdCard.source,
      result: {
        action: 'create_knowledge_source',
        resourceType: 'knowledge_source',
        resourceId: 'source_2',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_2',
        mutationTimestamp: '2026-06-01T00:00:00Z',
        changedStateSummary: {},
      },
    })

    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await user.click(screen.getByRole('button', { name: 'prepare source' }))
    await user.click(screen.getByRole('button', { name: 'create source' }))

    await waitFor(() => expect(screen.getByTestId('warning')).toHaveTextContent('Source was created but is not visible to the current agent'))

    expect(screen.getByTestId('selected-source')).toHaveTextContent('none')
    expect(mockApi('getPortalSourceDetail')).not.toHaveBeenCalled()
  })
})
