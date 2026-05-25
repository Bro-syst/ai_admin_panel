import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { knowledgeApi } from '@/modules/Knowledge/api/knowledgeApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>
const patchMock = apiClient.patch as unknown as ReturnType<typeof vi.fn>

const sourcePayload = {
  id: 'source_1',
  tenant_id: 'tenant_1',
  source_key: 'sales_faq',
  name: 'Sales FAQ',
  source_kind: 'faq',
  allowed_agent_scope: 'agent_ids',
  allowed_agent_ids: ['agent_1'],
  access_scope: 'tenant_restricted',
  status: 'ready',
  content_revision: 'v1',
  readiness_status: 'indexing_required',
  metadata: { owner: 'support' },
  source_set_eligibility_marker: 'source_pack.aml_kyc_domain_knowledge_v1',
  idempotency_key: 'idem_1',
  created_by_correlation_id: 'corr_create',
  updated_by_correlation_id: 'corr_update',
}

const readinessPayload = {
  tenant_id: 'tenant_1',
  source_id: 'source_1',
  readiness_status: 'indexing_required',
  chunk_count: 2,
  vectorization_count: 1,
  failed_job_count: 0,
  retryable_job_count: 1,
}

const jobPayload = {
  id: 'job_1',
  tenant_id: 'tenant_1',
  source_id: 'source_1',
  document_id: 'document_1',
  pipeline_step: 'chunking',
  status: 'failed',
  retry_count: 1,
  idempotency_key: 'job_idem',
  chunking_profile: 'default',
  chunk_size: 512,
  vectorization_profile: 'default',
  embedding_provider: 'backend',
  embedding_model: 'model',
  embedding_version: 'v1',
  access_scope: 'tenant_restricted',
  allowed_agent_scope: 'agent_ids',
  allowed_agent_ids: ['agent_1'],
}

const mutationPayload = {
  resource: sourcePayload,
  result: {
    action: 'create_knowledge_source',
    resource_type: 'knowledge_source',
    resource_id: 'source_1',
    actor_id: 'admin_1',
    actor_type: 'admin',
    tenant_id: 'tenant_1',
    correlation_id: 'corr_1',
    mutation_timestamp: '2026-05-13T10:00:00Z',
    changed_state_summary: { status: 'ready' },
  },
}

describe('knowledgeApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
  })

  it('maps portal source cards without calculating readiness locally', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [{ source: sourcePayload, lifecycle: { status: 'ready', readiness_status: 'indexing_required', source_set_eligibility_marker: 'marker', document_count: 1, indexing_required: true, downstream_owner: 'backend' }, readiness: readinessPayload, latest_job: jobPayload, failed_or_retryable: true }],
        metadata: { page: 1, page_size: 20, total_items: 1, returned_items: 1, ordering: 'created_at_desc' },
      },
    })

    await expect(knowledgeApi.listPortalSources('tenant_1')).resolves.toMatchObject({
      items: [{ source: { sourceKey: 'sales_faq' }, readiness: { readinessStatus: 'indexing_required', retryableJobCount: 1 }, failedOrRetryable: true }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/knowledge/sources')
  })

  it('creates managed source and preserves backend mutation feedback', async () => {
    postMock.mockResolvedValue({ data: mutationPayload })

    await expect(knowledgeApi.createSource('tenant_1', {
      sourceKey: 'sales_faq',
      name: 'Sales FAQ',
      sourceKind: 'faq',
      allowedAgentScope: 'agent_ids',
      allowedAgentIds: ['agent_1'],
      accessScope: 'tenant_restricted',
      contentRevision: 'v1',
      metadata: { owner: 'support' },
      idempotencyKey: 'idem_1',
    })).resolves.toMatchObject({
      resource: { id: 'source_1' },
      result: { correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/knowledge/sources', {
      source_key: 'sales_faq',
      name: 'Sales FAQ',
      source_kind: 'faq',
      allowed_agent_scope: 'agent_ids',
      allowed_agent_ids: ['agent_1'],
      access_scope: 'tenant_restricted',
      content_revision: 'v1',
      metadata: { owner: 'support' },
      idempotency_key: 'idem_1',
    })
  })

  it('starts indexing through backend management endpoint', async () => {
    postMock.mockResolvedValue({
      data: {
        resource: { job: jobPayload, readiness_summary: readinessPayload, chunks: [{ id: 'chunk_1' }], vectorization_records: [{}] },
        result: mutationPayload.result,
      },
    })

    await expect(knowledgeApi.runIndexing('tenant_1', 'source_1', {
      documentId: 'document_1',
      rawContent: 'approved support text',
      chunkingProfile: 'default',
      vectorizationProfile: 'default',
      embeddingProvider: 'backend',
      embeddingModel: 'model',
      embeddingVersion: 'v1',
      idempotencyKey: 'index_1',
      chunkSize: 512,
      agentId: 'agent_1',
      restrictedAccessApproved: true,
    })).resolves.toMatchObject({
      resource: { job: { id: 'job_1' }, readinessSummary: { readinessStatus: 'indexing_required' }, chunkCount: 1 },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/knowledge/sources/source_1/indexing/jobs', expect.objectContaining({
      document_id: 'document_1',
      raw_content: 'approved support text',
      restricted_access_approved: true,
    }))
  })

  it('anchors retrieval run support drill-down by agent id', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [{
          id: 'run_1',
          agent_id: 'agent_1',
          correlation_id: 'corr_1',
          query_id: 'query_1',
          retrieval_mode: 'hybrid_curated',
          outcome: 'succeeded',
          effective_source_ids: ['source_1'],
          selected_chunk_ids: ['chunk_1'],
          citation_anchors: ['faq#1'],
        }],
        metadata: { page: 1, page_size: 20, total_items: 1, returned_items: 1, ordering: 'created_at_asc' },
      },
    })

    await expect(knowledgeApi.listRetrievalRuns('tenant_1', { agentId: 'agent_1' })).resolves.toMatchObject({
      items: [{ id: 'run_1', agentId: 'agent_1' }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/knowledge/retrieval/runs?agent_id=agent_1')
  })
})
