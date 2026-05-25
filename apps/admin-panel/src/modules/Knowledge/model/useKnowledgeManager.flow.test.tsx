import { render, screen, waitFor } from '@testing-library/react'
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
  },
}))

function mockApi(method: keyof typeof knowledgeApi) {
  return knowledgeApi[method] as unknown as Mock
}

function sourceCard() {
  const source = {
    id: 'source_1',
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
      sourceId: 'source_1',
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
  })
})
