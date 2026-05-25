import { apiClient } from '@/core/api/apiClient'

const TENANTS_PREFIX = '/api/admin/v1/tenants'
const PORTAL_PREFIX = '/api/admin/v1/portal/tenants'

export type KnowledgeMutationResult = {
  action: string
  resourceType: string
  resourceId: string | null
  actorId: string | null
  actorType: string | null
  tenantId: string | null
  correlationId: string | null
  mutationTimestamp: string
  changedStateSummary: Record<string, unknown>
}

export type KnowledgeListMetadata = {
  page: number
  pageSize: number
  totalItems: number
  returnedItems: number
  ordering: string
}

export type KnowledgeSource = {
  id: string
  tenantId: string
  sourceKey: string
  name: string
  sourceKind: string
  allowedAgentScope: string
  allowedAgentIds: string[]
  accessScope: string
  status: string
  contentRevision: string
  readinessStatus: string
  metadata: Record<string, string>
  sourceSetEligibilityMarker: string
  idempotencyKey: string | null
  createdByCorrelationId: string | null
  updatedByCorrelationId: string | null
}

export type KnowledgeLifecycleSummary = {
  status: string
  readinessStatus: string
  sourceSetEligibilityMarker: string
  documentCount: number
  indexingRequired: boolean
  downstreamOwner: string
}

export type KnowledgeIndexReadiness = {
  tenantId: string
  sourceId: string
  indexId: string | null
  latestIndexVersionId: string | null
  readinessStatus: string
  sourceSetReadinessMarker: string | null
  membershipFingerprint: string | null
  chunkCount: number
  vectorizationCount: number
  failedJobCount: number
  retryableJobCount: number
}

export type KnowledgeDocument = {
  id: string
  tenantId: string
  sourceId: string
  documentKey: string
  title: string
  contentRevision: string
  normalizedMetadata: Record<string, string>
  contentReference: string | null
  status: string
  retentionPolicy: string | null
  disableReason: string | null
  idempotencyKey: string | null
  createdByCorrelationId: string | null
  updatedByCorrelationId: string | null
}

export type KnowledgeIngestionJob = {
  id: string
  tenantId: string
  sourceId: string
  documentId: string | null
  pipelineStep: string
  status: string
  retryCount: number
  errorClassification: string | null
  errorMessage: string | null
  idempotencyKey: string
  correlationId: string | null
  chunkingProfile: string
  chunkSize: number
  vectorizationProfile: string
  embeddingProvider: string
  embeddingModel: string
  embeddingVersion: string
  accessScope: string
  allowedAgentScope: string
  allowedAgentIds: string[]
}

export type KnowledgeChunk = {
  id: string
  sourceId: string
  documentId: string
  chunkKey: string
  sequence: number
  normalizedContent: string
  citationAnchor: string
  accessScope: string
  allowedAgentScope: string
  allowedAgentIds: string[]
  status: string
}

export type KnowledgeRetrievalRun = {
  id: string
  agentId: string
  correlationId: string
  queryId: string
  retrievalMode: string
  outcome: string
  outcomeReason: string | null
  effectiveSourceIds: string[]
  selectedChunkIds: string[]
  citationAnchors: string[]
}

export type KnowledgeSupportReconstruction = {
  retrievalRun: KnowledgeRetrievalRun
  sourceArtifactKind: string
  sourceArtifactId: string
  authoritativeEvidenceSource: string
  directDbOrVectorDbRequired: boolean
  supportReconstructionPath: string[]
  troubleshootingHints: string[]
  redactionApplied: boolean
}

export type KnowledgePortalSourceCard = {
  source: KnowledgeSource
  lifecycle: KnowledgeLifecycleSummary
  readiness: KnowledgeIndexReadiness
  latestJob: KnowledgeIngestionJob | null
  failedOrRetryable: boolean
}

export type KnowledgePortalSourceDetail = KnowledgePortalSourceCard & {
  documents: KnowledgeDocument[]
  jobs: KnowledgeIngestionJob[]
  chunks: KnowledgeChunk[]
}

export type KnowledgePortalReleaseReadiness = {
  tenantId: string
  ownerStage: string
  sourceCount: number
  readySourceCount: number
  failedOrRetryableSourceCount: number
  releaseReady: boolean
  sources: KnowledgePortalSourceCard[]
}

export type CreateKnowledgeSourceInput = {
  sourceKey: string
  name: string
  sourceKind: string
  allowedAgentScope: string
  allowedAgentIds: string[]
  accessScope: string
  contentRevision: string
  metadata: Record<string, string>
  idempotencyKey: string | null
}

export type RegisterKnowledgeDocumentInput = {
  documentKey: string
  title: string
  contentRevision: string
  normalizedMetadata: Record<string, string>
  contentReference: string | null
  retentionPolicy: string | null
  idempotencyKey: string | null
  agentId: string | null
  restrictedAccessApproved: boolean
}

export type RunKnowledgeIndexingInput = {
  documentId: string
  rawContent: string
  chunkingProfile: string
  vectorizationProfile: string
  embeddingProvider: string
  embeddingModel: string
  embeddingVersion: string
  idempotencyKey: string
  chunkSize: number
  agentId: string | null
  restrictedAccessApproved: boolean
}

export type KnowledgeSourceMutationResponse = {
  resource: KnowledgeSource
  result: KnowledgeMutationResult
}

export type KnowledgeDocumentMutationResponse = {
  resource: KnowledgeDocument
  result: KnowledgeMutationResult
}

export type KnowledgeIndexingMutationResponse = {
  resource: {
    job: KnowledgeIngestionJob
    readinessSummary: KnowledgeIndexReadiness
    chunkCount: number
    vectorizationCount: number
  }
  result: KnowledgeMutationResult
}

export type KnowledgeJobMutationResponse = {
  resource: KnowledgeIngestionJob
  result: KnowledgeMutationResult
}

type MetadataPayload = {
  page?: number
  page_size?: number
  total_items?: number
  returned_items?: number
  ordering?: string
}

type MutationResultPayload = {
  action?: string
  resource_type?: string
  resource_id?: string | null
  actor_id?: string | null
  actor_type?: string | null
  tenant_id?: string | null
  correlation_id?: string | null
  mutation_timestamp?: string
  changed_state_summary?: Record<string, unknown>
}

type SourcePayload = {
  id?: string
  tenant_id?: string
  source_key?: string
  name?: string
  source_kind?: string
  allowed_agent_scope?: string
  allowed_agent_ids?: string[]
  access_scope?: string
  status?: string
  content_revision?: string
  readiness_status?: string
  metadata?: Record<string, string>
  source_set_eligibility_marker?: string
  idempotency_key?: string | null
  created_by_correlation_id?: string | null
  updated_by_correlation_id?: string | null
}

type LifecyclePayload = {
  status?: string
  readiness_status?: string
  source_set_eligibility_marker?: string
  document_count?: number
  indexing_required?: boolean
  downstream_owner?: string
}

type ReadinessPayload = {
  tenant_id?: string
  source_id?: string
  index_id?: string | null
  latest_index_version_id?: string | null
  readiness_status?: string
  source_set_readiness_marker?: string | null
  membership_fingerprint?: string | null
  chunk_count?: number
  vectorization_count?: number
  failed_job_count?: number
  retryable_job_count?: number
}

type DocumentPayload = {
  id?: string
  tenant_id?: string
  source_id?: string
  document_key?: string
  title?: string
  content_revision?: string
  normalized_metadata?: Record<string, string>
  content_reference?: string | null
  status?: string
  retention_policy?: string | null
  disable_reason?: string | null
  idempotency_key?: string | null
  created_by_correlation_id?: string | null
  updated_by_correlation_id?: string | null
}

type JobPayload = {
  id?: string
  tenant_id?: string
  source_id?: string
  document_id?: string | null
  pipeline_step?: string
  status?: string
  retry_count?: number
  error_classification?: string | null
  error_message?: string | null
  idempotency_key?: string
  correlation_id?: string | null
  chunking_profile?: string
  chunk_size?: number
  vectorization_profile?: string
  embedding_provider?: string
  embedding_model?: string
  embedding_version?: string
  access_scope?: string
  allowed_agent_scope?: string
  allowed_agent_ids?: string[]
}

type ChunkPayload = {
  id?: string
  source_id?: string
  document_id?: string
  chunk_key?: string
  sequence?: number
  normalized_content?: string
  citation_anchor?: string
  access_scope?: string
  allowed_agent_scope?: string
  allowed_agent_ids?: string[]
  status?: string
}

type RetrievalRunPayload = {
  id?: string
  agent_id?: string
  correlation_id?: string
  query_id?: string
  retrieval_mode?: string
  outcome?: string
  outcome_reason?: string | null
  effective_source_ids?: string[]
  selected_chunk_ids?: string[]
  citation_anchors?: string[]
}

type PortalCardPayload = {
  source?: SourcePayload
  lifecycle?: LifecyclePayload
  readiness?: ReadinessPayload
  latest_job?: JobPayload | null
  failed_or_retryable?: boolean
}

type PortalDetailPayload = PortalCardPayload & {
  documents?: DocumentPayload[]
  jobs?: JobPayload[]
  chunks?: ChunkPayload[]
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function readStringRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function mapMetadata(payload: MetadataPayload = {}): KnowledgeListMetadata {
  return {
    page: readNumber(payload.page, 1),
    pageSize: readNumber(payload.page_size, 20),
    totalItems: readNumber(payload.total_items),
    returnedItems: readNumber(payload.returned_items),
    ordering: readString(payload.ordering),
  }
}

function mapMutationResult(payload: MutationResultPayload = {}): KnowledgeMutationResult {
  return {
    action: readString(payload.action),
    resourceType: readString(payload.resource_type),
    resourceId: readNullableString(payload.resource_id),
    actorId: readNullableString(payload.actor_id),
    actorType: readNullableString(payload.actor_type),
    tenantId: readNullableString(payload.tenant_id),
    correlationId: readNullableString(payload.correlation_id),
    mutationTimestamp: readString(payload.mutation_timestamp),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

export function mapKnowledgeSource(payload: SourcePayload = {}): KnowledgeSource {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    sourceKey: readString(payload.source_key),
    name: readString(payload.name),
    sourceKind: readString(payload.source_kind),
    allowedAgentScope: readString(payload.allowed_agent_scope),
    allowedAgentIds: readStringArray(payload.allowed_agent_ids),
    accessScope: readString(payload.access_scope),
    status: readString(payload.status),
    contentRevision: readString(payload.content_revision),
    readinessStatus: readString(payload.readiness_status),
    metadata: readStringRecord(payload.metadata),
    sourceSetEligibilityMarker: readString(payload.source_set_eligibility_marker),
    idempotencyKey: readNullableString(payload.idempotency_key),
    createdByCorrelationId: readNullableString(payload.created_by_correlation_id),
    updatedByCorrelationId: readNullableString(payload.updated_by_correlation_id),
  }
}

function mapLifecycle(payload: LifecyclePayload = {}): KnowledgeLifecycleSummary {
  return {
    status: readString(payload.status),
    readinessStatus: readString(payload.readiness_status),
    sourceSetEligibilityMarker: readString(payload.source_set_eligibility_marker),
    documentCount: readNumber(payload.document_count),
    indexingRequired: readBoolean(payload.indexing_required),
    downstreamOwner: readString(payload.downstream_owner),
  }
}

export function mapIndexReadiness(payload: ReadinessPayload = {}): KnowledgeIndexReadiness {
  return {
    tenantId: readString(payload.tenant_id),
    sourceId: readString(payload.source_id),
    indexId: readNullableString(payload.index_id),
    latestIndexVersionId: readNullableString(payload.latest_index_version_id),
    readinessStatus: readString(payload.readiness_status),
    sourceSetReadinessMarker: readNullableString(payload.source_set_readiness_marker),
    membershipFingerprint: readNullableString(payload.membership_fingerprint),
    chunkCount: readNumber(payload.chunk_count),
    vectorizationCount: readNumber(payload.vectorization_count),
    failedJobCount: readNumber(payload.failed_job_count),
    retryableJobCount: readNumber(payload.retryable_job_count),
  }
}

export function mapKnowledgeDocument(payload: DocumentPayload = {}): KnowledgeDocument {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    sourceId: readString(payload.source_id),
    documentKey: readString(payload.document_key),
    title: readString(payload.title),
    contentRevision: readString(payload.content_revision),
    normalizedMetadata: readStringRecord(payload.normalized_metadata),
    contentReference: readNullableString(payload.content_reference),
    status: readString(payload.status),
    retentionPolicy: readNullableString(payload.retention_policy),
    disableReason: readNullableString(payload.disable_reason),
    idempotencyKey: readNullableString(payload.idempotency_key),
    createdByCorrelationId: readNullableString(payload.created_by_correlation_id),
    updatedByCorrelationId: readNullableString(payload.updated_by_correlation_id),
  }
}

export function mapIngestionJob(payload: JobPayload = {}): KnowledgeIngestionJob {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    sourceId: readString(payload.source_id),
    documentId: readNullableString(payload.document_id),
    pipelineStep: readString(payload.pipeline_step),
    status: readString(payload.status),
    retryCount: readNumber(payload.retry_count),
    errorClassification: readNullableString(payload.error_classification),
    errorMessage: readNullableString(payload.error_message),
    idempotencyKey: readString(payload.idempotency_key),
    correlationId: readNullableString(payload.correlation_id),
    chunkingProfile: readString(payload.chunking_profile),
    chunkSize: readNumber(payload.chunk_size),
    vectorizationProfile: readString(payload.vectorization_profile),
    embeddingProvider: readString(payload.embedding_provider),
    embeddingModel: readString(payload.embedding_model),
    embeddingVersion: readString(payload.embedding_version),
    accessScope: readString(payload.access_scope),
    allowedAgentScope: readString(payload.allowed_agent_scope),
    allowedAgentIds: readStringArray(payload.allowed_agent_ids),
  }
}

function mapChunk(payload: ChunkPayload = {}): KnowledgeChunk {
  return {
    id: readString(payload.id),
    sourceId: readString(payload.source_id),
    documentId: readString(payload.document_id),
    chunkKey: readString(payload.chunk_key),
    sequence: readNumber(payload.sequence),
    normalizedContent: readString(payload.normalized_content),
    citationAnchor: readString(payload.citation_anchor),
    accessScope: readString(payload.access_scope),
    allowedAgentScope: readString(payload.allowed_agent_scope),
    allowedAgentIds: readStringArray(payload.allowed_agent_ids),
    status: readString(payload.status),
  }
}

function mapRetrievalRun(payload: RetrievalRunPayload = {}): KnowledgeRetrievalRun {
  return {
    id: readString(payload.id),
    agentId: readString(payload.agent_id),
    correlationId: readString(payload.correlation_id),
    queryId: readString(payload.query_id),
    retrievalMode: readString(payload.retrieval_mode),
    outcome: readString(payload.outcome),
    outcomeReason: readNullableString(payload.outcome_reason),
    effectiveSourceIds: readStringArray(payload.effective_source_ids),
    selectedChunkIds: readStringArray(payload.selected_chunk_ids),
    citationAnchors: readStringArray(payload.citation_anchors),
  }
}

export function mapPortalSourceCard(payload: PortalCardPayload = {}): KnowledgePortalSourceCard {
  return {
    source: mapKnowledgeSource(payload.source),
    lifecycle: mapLifecycle(payload.lifecycle),
    readiness: mapIndexReadiness(payload.readiness),
    latestJob: payload.latest_job ? mapIngestionJob(payload.latest_job) : null,
    failedOrRetryable: readBoolean(payload.failed_or_retryable),
  }
}

export function mapPortalSourceDetail(payload: PortalDetailPayload = {}): KnowledgePortalSourceDetail {
  return {
    ...mapPortalSourceCard(payload),
    documents: Array.isArray(payload.documents) ? payload.documents.map(mapKnowledgeDocument) : [],
    jobs: Array.isArray(payload.jobs) ? payload.jobs.map(mapIngestionJob) : [],
    chunks: Array.isArray(payload.chunks) ? payload.chunks.map(mapChunk) : [],
  }
}

function compactString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toSourcePayload(input: CreateKnowledgeSourceInput) {
  return {
    source_key: input.sourceKey.trim(),
    name: input.name.trim(),
    source_kind: input.sourceKind,
    allowed_agent_scope: input.allowedAgentScope,
    allowed_agent_ids: input.allowedAgentIds,
    access_scope: input.accessScope,
    content_revision: input.contentRevision.trim(),
    metadata: input.metadata,
    idempotency_key: compactString(input.idempotencyKey),
  }
}

export const knowledgeApi = {
  async listPortalSources(tenantId: string): Promise<{ items: KnowledgePortalSourceCard[]; metadata: KnowledgeListMetadata }> {
    const response = await apiClient.get<{ items?: PortalCardPayload[]; metadata?: MetadataPayload }>(
      `${PORTAL_PREFIX}/${tenantId}/knowledge/sources`,
    )
    return {
      items: response.data.items?.map(mapPortalSourceCard) ?? [],
      metadata: mapMetadata(response.data.metadata),
    }
  },

  async getPortalSourceDetail(tenantId: string, sourceId: string): Promise<KnowledgePortalSourceDetail> {
    const response = await apiClient.get<PortalDetailPayload>(`${PORTAL_PREFIX}/${tenantId}/knowledge/sources/${sourceId}`)
    return mapPortalSourceDetail(response.data)
  },

  async getPortalReleaseReadiness(tenantId: string): Promise<KnowledgePortalReleaseReadiness> {
    const response = await apiClient.get<{
      tenant_id?: string
      owner_stage?: string
      source_count?: number
      ready_source_count?: number
      failed_or_retryable_source_count?: number
      release_ready?: boolean
      sources?: PortalCardPayload[]
    }>(`${PORTAL_PREFIX}/${tenantId}/knowledge/release-readiness`)
    return {
      tenantId: readString(response.data.tenant_id),
      ownerStage: readString(response.data.owner_stage),
      sourceCount: readNumber(response.data.source_count),
      readySourceCount: readNumber(response.data.ready_source_count),
      failedOrRetryableSourceCount: readNumber(response.data.failed_or_retryable_source_count),
      releaseReady: readBoolean(response.data.release_ready),
      sources: response.data.sources?.map(mapPortalSourceCard) ?? [],
    }
  },

  async createSource(tenantId: string, input: CreateKnowledgeSourceInput): Promise<KnowledgeSourceMutationResponse> {
    const response = await apiClient.post<{ resource?: SourcePayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/sources`,
      toSourcePayload(input),
    )
    return { resource: mapKnowledgeSource(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async updateSourceMetadata(
    tenantId: string,
    sourceId: string,
    input: { expectedContentRevision: string; metadata: Record<string, string>; agentId: string | null; restrictedAccessApproved: boolean },
  ): Promise<KnowledgeSourceMutationResponse> {
    const response = await apiClient.patch<{ resource?: SourcePayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/sources/${sourceId}/metadata`,
      {
        expected_content_revision: input.expectedContentRevision,
        metadata: input.metadata,
        agent_id: input.agentId,
        restricted_access_approved: input.restrictedAccessApproved,
      },
    )
    return { resource: mapKnowledgeSource(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async disableSource(tenantId: string, sourceId: string, agentId: string | null): Promise<KnowledgeSourceMutationResponse> {
    const response = await apiClient.post<{ resource?: SourcePayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/sources/${sourceId}/disable`,
      { agent_id: agentId, restricted_access_approved: true },
    )
    return { resource: mapKnowledgeSource(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async registerDocument(tenantId: string, sourceId: string, input: RegisterKnowledgeDocumentInput): Promise<KnowledgeDocumentMutationResponse> {
    const response = await apiClient.post<{ resource?: DocumentPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/sources/${sourceId}/documents`,
      {
        document_key: input.documentKey.trim(),
        title: input.title.trim(),
        content_revision: input.contentRevision.trim(),
        normalized_metadata: input.normalizedMetadata,
        content_reference: compactString(input.contentReference),
        retention_policy: compactString(input.retentionPolicy),
        idempotency_key: compactString(input.idempotencyKey),
        agent_id: input.agentId,
        restricted_access_approved: input.restrictedAccessApproved,
      },
    )
    return { resource: mapKnowledgeDocument(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async updateDocumentMetadata(
    tenantId: string,
    documentId: string,
    input: { expectedContentRevision: string; normalizedMetadata: Record<string, string>; agentId: string | null; restrictedAccessApproved: boolean },
  ): Promise<KnowledgeDocumentMutationResponse> {
    const response = await apiClient.patch<{ resource?: DocumentPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/documents/${documentId}/metadata`,
      {
        expected_content_revision: input.expectedContentRevision,
        normalized_metadata: input.normalizedMetadata,
        agent_id: input.agentId,
        restricted_access_approved: input.restrictedAccessApproved,
      },
    )
    return { resource: mapKnowledgeDocument(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async disableDocument(tenantId: string, documentId: string, agentId: string | null): Promise<KnowledgeDocumentMutationResponse> {
    const response = await apiClient.post<{ resource?: DocumentPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/documents/${documentId}/disable`,
      { agent_id: agentId, restricted_access_approved: true },
    )
    return { resource: mapKnowledgeDocument(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async runIndexing(tenantId: string, sourceId: string, input: RunKnowledgeIndexingInput): Promise<KnowledgeIndexingMutationResponse> {
    const response = await apiClient.post<{
      resource?: { job?: JobPayload; readiness_summary?: ReadinessPayload; chunks?: ChunkPayload[]; vectorization_records?: unknown[] }
      result?: MutationResultPayload
    }>(`${TENANTS_PREFIX}/${tenantId}/knowledge/sources/${sourceId}/indexing/jobs`, {
      document_id: input.documentId,
      raw_content: input.rawContent,
      chunking_profile: input.chunkingProfile,
      vectorization_profile: input.vectorizationProfile,
      embedding_provider: input.embeddingProvider,
      embedding_model: input.embeddingModel,
      embedding_version: input.embeddingVersion,
      idempotency_key: input.idempotencyKey,
      chunk_size: input.chunkSize,
      agent_id: input.agentId,
      restricted_access_approved: input.restrictedAccessApproved,
    })
    return {
      resource: {
        job: mapIngestionJob(response.data.resource?.job),
        readinessSummary: mapIndexReadiness(response.data.resource?.readiness_summary),
        chunkCount: response.data.resource?.chunks?.length ?? 0,
        vectorizationCount: response.data.resource?.vectorization_records?.length ?? 0,
      },
      result: mapMutationResult(response.data.result),
    }
  },

  async retryIndexingJob(tenantId: string, jobId: string, agentId: string | null): Promise<KnowledgeJobMutationResponse> {
    const response = await apiClient.post<{ resource?: JobPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/indexing/jobs/${jobId}/retry`,
      { idempotency_key: `${jobId}:retry`, agent_id: agentId, restricted_access_approved: true },
    )
    return { resource: mapIngestionJob(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async listRetrievalRuns(
    tenantId: string,
    filters: { agentId?: string } = {},
  ): Promise<{ items: KnowledgeRetrievalRun[]; metadata: KnowledgeListMetadata }> {
    const params = new URLSearchParams()
    if (filters.agentId) {
      params.set('agent_id', filters.agentId)
    }
    const query = params.toString()
    const response = await apiClient.get<{ items?: RetrievalRunPayload[]; metadata?: MetadataPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/knowledge/retrieval/runs${query ? `?${query}` : ''}`,
    )
    return {
      items: response.data.items?.map(mapRetrievalRun) ?? [],
      metadata: mapMetadata(response.data.metadata),
    }
  },

  async getSupportReconstruction(tenantId: string, retrievalRunId: string): Promise<KnowledgeSupportReconstruction> {
    const response = await apiClient.get<{
      retrieval_run?: RetrievalRunPayload
      source_artifact_kind?: string
      source_artifact_id?: string
      authoritative_evidence_source?: string
      direct_db_or_vector_db_required?: boolean
      support_reconstruction_path?: string[]
      troubleshooting_hints?: string[]
      redaction_applied?: boolean
    }>(`${TENANTS_PREFIX}/${tenantId}/knowledge/retrieval/runs/${retrievalRunId}/support-reconstruction`)
    return {
      retrievalRun: mapRetrievalRun(response.data.retrieval_run),
      sourceArtifactKind: readString(response.data.source_artifact_kind),
      sourceArtifactId: readString(response.data.source_artifact_id),
      authoritativeEvidenceSource: readString(response.data.authoritative_evidence_source),
      directDbOrVectorDbRequired: readBoolean(response.data.direct_db_or_vector_db_required),
      supportReconstructionPath: readStringArray(response.data.support_reconstruction_path),
      troubleshootingHints: readStringArray(response.data.troubleshooting_hints),
      redactionApplied: readBoolean(response.data.redaction_applied),
    }
  },
}
