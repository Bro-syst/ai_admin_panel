import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { I18nContext, type Locale } from '@/core/i18n/I18nContext'
import { messages } from '@/core/i18n/messages'
import type { KnowledgeManager } from '@/modules/Knowledge/model/useKnowledgeManager'
import { KnowledgeView } from '@/modules/Knowledge/ui/KnowledgeView'

function renderView(manager: Partial<KnowledgeManager> = {}, locale: Locale = 'en', bindingReady = false) {
  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    sources: [{
      source: {
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
        readinessStatus: 'indexing_required',
        metadata: { owner: 'support' },
        sourceSetEligibilityMarker: 'source_pack.aml_kyc_domain_knowledge_v1',
        idempotencyKey: 'idem_1',
        createdByCorrelationId: null,
        updatedByCorrelationId: null,
      },
      lifecycle: { status: 'ready', readinessStatus: 'indexing_required', sourceSetEligibilityMarker: 'marker', documentCount: 1, indexingRequired: true, downstreamOwner: 'backend' },
      readiness: { tenantId: 'tenant_1', sourceId: 'source_1', indexId: null, latestIndexVersionId: null, readinessStatus: 'indexing_required', sourceSetReadinessMarker: null, membershipFingerprint: null, chunkCount: 1, vectorizationCount: 0, failedJobCount: 1, retryableJobCount: 1 },
      latestJob: null,
      failedOrRetryable: true,
    }],
    releaseReadiness: { tenantId: 'tenant_1', ownerStage: 'stage_08', sourceCount: 1, readySourceCount: 0, failedOrRetryableSourceCount: 1, releaseReady: false, sources: [] },
    selectedSourceDetail: {
      source: {
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
        readinessStatus: 'indexing_required',
        metadata: { owner: 'support' },
        sourceSetEligibilityMarker: 'source_pack.aml_kyc_domain_knowledge_v1',
        idempotencyKey: null,
        createdByCorrelationId: null,
        updatedByCorrelationId: null,
      },
      lifecycle: { status: 'ready', readinessStatus: 'indexing_required', sourceSetEligibilityMarker: 'marker', documentCount: 1, indexingRequired: true, downstreamOwner: 'backend' },
      readiness: { tenantId: 'tenant_1', sourceId: 'source_1', indexId: null, latestIndexVersionId: null, readinessStatus: 'indexing_required', sourceSetReadinessMarker: null, membershipFingerprint: null, chunkCount: 1, vectorizationCount: 0, failedJobCount: 1, retryableJobCount: 1 },
      latestJob: null,
      failedOrRetryable: true,
      documents: [{ id: 'doc_1', tenantId: 'tenant_1', sourceId: 'source_1', documentKey: 'doc', title: 'FAQ doc', contentRevision: 'v1', normalizedMetadata: {}, contentReference: 's3://safe', status: 'registered', retentionPolicy: null, disableReason: null, idempotencyKey: null, createdByCorrelationId: null, updatedByCorrelationId: null }],
      jobs: [{ id: 'job_1', tenantId: 'tenant_1', sourceId: 'source_1', documentId: 'doc_1', pipelineStep: 'chunking', status: 'failed', retryCount: 1, errorClassification: 'temporary', errorMessage: 'retry', idempotencyKey: 'job', correlationId: 'corr_job', chunkingProfile: 'default', chunkSize: 512, vectorizationProfile: 'default', embeddingProvider: 'backend', embeddingModel: 'model', embeddingVersion: 'v1', accessScope: 'tenant_restricted', allowedAgentScope: 'agent_ids', allowedAgentIds: ['agent_1'] }],
      chunks: [{ id: 'chunk_1', sourceId: 'source_1', documentId: 'doc_1', chunkKey: 'c1', sequence: 1, normalizedContent: 'safe projection', citationAnchor: 'faq#1', accessScope: 'tenant_restricted', allowedAgentScope: 'agent_ids', allowedAgentIds: ['agent_1'], status: 'active' }],
    },
    retrievalRuns: [{
      id: 'retrieval_1',
      agentId: 'agent_1',
      correlationId: 'corr_retrieval',
      queryId: 'query_1',
      retrievalMode: 'grounded',
      outcome: 'answered',
      outcomeReason: null,
      effectiveSourceIds: ['source_1'],
      selectedChunkIds: ['chunk_1'],
      citationAnchors: ['faq#1'],
    }],
    retrievalErrorMessage: null,
    supportReconstruction: {
      retrievalRun: {
        id: 'retrieval_1',
        agentId: 'agent_1',
        correlationId: 'corr_retrieval',
        queryId: 'query_1',
        retrievalMode: 'grounded',
        outcome: 'answered',
        outcomeReason: null,
        effectiveSourceIds: ['source_1'],
        selectedChunkIds: ['chunk_1'],
        citationAnchors: ['faq#1'],
      },
      sourceArtifactKind: 'portal_read_model',
      sourceArtifactId: 'retrieval_1',
      authoritativeEvidenceSource: 'backend_read_model',
      directDbOrVectorDbRequired: false,
      supportReconstructionPath: ['portal retrieval run', 'selected chunk'],
      troubleshootingHints: ['Check source readiness'],
      redactionApplied: true,
    },
    sourceForm: { sourceKey: '', name: '', sourceKind: 'documentation', accessScope: 'tenant_public', allowedAgentScope: 'agent_ids', contentRevision: 'v1', metadataText: '', idempotencyKey: '', restrictToCurrentAgent: true },
    documentForm: { documentKey: '', title: '', contentRevision: 'v1', normalizedMetadataText: '', contentReference: '', retentionPolicy: '', idempotencyKey: '', restrictedAccessApproved: false },
    indexingForm: { documentId: 'doc_1', rawContent: '', chunkingProfile: 'default', vectorizationProfile: 'default', embeddingProvider: 'backend', embeddingModel: 'model', embeddingVersion: 'v1', idempotencyKey: '', chunkSize: '512', restrictedAccessApproved: false },
    mutationResult: null,
    indexingResult: null,
    canManageKnowledge: true,
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadKnowledge: vi.fn(),
    selectSource: vi.fn(),
    setSourceForm: vi.fn(),
    setDocumentForm: vi.fn(),
    setIndexingForm: vi.fn(),
    createSource: vi.fn(),
    updateSelectedSourceMetadata: vi.fn(),
    disableSelectedSource: vi.fn(),
    registerDocument: vi.fn(),
    updateDocumentMetadata: vi.fn(),
    disableDocument: vi.fn(),
    runIndexing: vi.fn(),
    retryIndexingJob: vi.fn(),
    loadSupportReconstruction: vi.fn(),
    ...manager,
  } as unknown as KnowledgeManager

  render(
    <I18nContext.Provider value={{
      locale,
      setLocale: vi.fn(),
      t: (key) => messages[locale][key] ?? key,
    }}>
      <KnowledgeView manager={defaultManager} bindingReady={bindingReady} />
    </I18nContext.Provider>,
  )

  return defaultManager
}

describe('KnowledgeView', () => {
  it('renders Knowledge-owned source readiness, documents, chunks and support reconstruction', () => {
    renderView()

    expect(screen.getByText('Indexing / retrieval readiness')).toBeInTheDocument()
    expect(screen.getAllByText('Sales FAQ').length).toBeGreaterThan(0)
    expect(screen.getAllByText('FAQ doc').length).toBeGreaterThan(0)
    expect(screen.getByText('safe projection')).toBeInTheDocument()
    expect(screen.getByText('Support reconstruction')).toBeInTheDocument()
    expect(screen.getByText('backend_read_model')).toBeInTheDocument()
  })

  it('confirms disable source and retries failed indexing job', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Disable source' }))
    await user.click(screen.getByRole('button', { name: 'Retry job' }))

    expect(confirmSpy).toHaveBeenCalledWith('Disable the selected knowledge source?')
    expect(manager.disableSelectedSource).toHaveBeenCalled()
    expect(manager.retryIndexingJob).toHaveBeenCalledWith('job_1')
    confirmSpy.mockRestore()
  })

  it('loads support-safe reconstruction from returned retrieval runs', async () => {
    const user = userEvent.setup()
    const manager = renderView({ supportReconstruction: null })

    await user.click(screen.getByRole('button', { name: 'View support evidence' }))

    expect(manager.loadSupportReconstruction).toHaveBeenCalledWith('retrieval_1')
  })

  it('shows retrieval history as unavailable without hiding the knowledge page', () => {
    renderView({
      retrievalRuns: [],
      retrievalErrorMessage: 'История поисковых запусков временно недоступна',
    })

    expect(screen.getByText('Indexing / retrieval readiness')).toBeInTheDocument()
    expect(screen.getByText('История поисковых запусков временно недоступна')).toBeInTheDocument()
    expect(screen.getByText('Retrieval history is temporarily unavailable. The rest of the knowledge setup is still available.')).toBeInTheDocument()
  })

  it('localizes all knowledge select options in Russian while preserving backend values', () => {
    renderView({
      sourceForm: {
        sourceKey: '',
        name: '',
        sourceKind: 'documentation',
        accessScope: 'tenant_public',
        allowedAgentScope: 'agent_ids',
        contentRevision: 'v1',
        metadataText: '',
        idempotencyKey: '',
        restrictToCurrentAgent: true,
      },
      indexingForm: {
        documentId: 'doc_1',
        rawContent: '',
        chunkingProfile: 'default',
        vectorizationProfile: 'default',
        embeddingProvider: 'backend',
        embeddingModel: 'model',
        embeddingVersion: 'v1',
        idempotencyKey: '',
        chunkSize: '512',
        restrictedAccessApproved: false,
      },
    }, 'ru')

    expect(screen.getByLabelText('Тип источника')).toHaveValue('documentation')
    expect(screen.getByRole('option', { name: 'Документация' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'FAQ' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Корпус политик' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Каталог продуктов' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Утверждённая внутренняя коллекция' })).toBeInTheDocument()

    expect(screen.getByLabelText('Область доступа')).toHaveValue('tenant_public')
    expect(screen.getByRole('option', { name: 'Доступно в рамках тенанта' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Ограниченный доступ тенанта' })).toBeInTheDocument()

    expect(screen.getByLabelText('Доступность для агентов')).toHaveValue('agent_ids')
    expect(screen.getByRole('option', { name: 'Все агенты' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Только выбранные агенты' })).toBeInTheDocument()

    expect(screen.getByLabelText('Документ')).toHaveValue('doc_1')
    expect(screen.getByRole('option', { name: 'FAQ doc' })).toBeInTheDocument()
    expect(screen.getAllByText('Ограниченный доступ тенанта').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Только выбранные агенты').length).toBeGreaterThan(0)
    expect(screen.queryByRole('option', { name: 'documentation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'tenant_public' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'agent_ids' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'doc_1' })).not.toBeInTheDocument()
  })

  it('separates binding readiness from indexing readiness in Russian', () => {
    renderView({
      sources: [],
      releaseReadiness: {
        tenantId: 'tenant_1',
        ownerStage: 'stage_08',
        sourceCount: 0,
        readySourceCount: 0,
        failedOrRetryableSourceCount: 0,
        releaseReady: false,
        sources: [],
      },
      retrievalRuns: [],
    }, 'ru', true)

    expect(screen.getByText('Индексация / retrieval readiness')).toBeInTheDocument()
    expect(screen.getByText('Привязка готова, но индекс/readiness не подтвержден.')).toBeInTheDocument()
    expect(screen.getByText('Нет данных по индексированной готовности.')).toBeInTheDocument()
    expect(screen.getByText('Детали источников недоступны для выбранного режима.')).toBeInTheDocument()
  })
})
