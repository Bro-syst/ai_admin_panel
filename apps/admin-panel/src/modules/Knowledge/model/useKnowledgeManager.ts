import { useCallback, useEffect, useRef, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useI18n } from '@/core/i18n/useI18n'
import {
  knowledgeApi,
  type CreateKnowledgeSourceInput,
  type KnowledgeDocument,
  type KnowledgeIndexingMutationResponse,
  type KnowledgeMutationResult,
  type KnowledgePortalReleaseReadiness,
  type KnowledgePortalSourceCard,
  type KnowledgePortalSourceDetail,
  type KnowledgeRetrievalRun,
  type KnowledgeSupportReconstruction,
  type RegisterKnowledgeDocumentInput,
  type RunKnowledgeIndexingInput,
} from '@/modules/Knowledge/api/knowledgeApi'

export type KnowledgeSourceForm = {
  sourceKey: string
  name: string
  sourceKind: string
  accessScope: string
  allowedAgentScope: string
  contentRevision: string
  metadataText: string
  idempotencyKey: string
  restrictToCurrentAgent: boolean
}

export type KnowledgeDocumentForm = {
  documentKey: string
  title: string
  contentRevision: string
  normalizedMetadataText: string
  contentReference: string
  retentionPolicy: string
  idempotencyKey: string
  restrictedAccessApproved: boolean
}

export type KnowledgeIndexingForm = {
  documentId: string
  rawContent: string
  chunkingProfile: string
  vectorizationProfile: string
  embeddingProvider: string
  embeddingModel: string
  embeddingVersion: string
  idempotencyKey: string
  chunkSize: string
  restrictedAccessApproved: boolean
}

function defaultSourceForm(agentId: string): KnowledgeSourceForm {
  return {
    sourceKey: '',
    name: '',
    sourceKind: 'documentation',
    accessScope: 'tenant_public',
    allowedAgentScope: 'agent_ids',
    contentRevision: 'v1',
    metadataText: '',
    idempotencyKey: '',
    restrictToCurrentAgent: Boolean(agentId),
  }
}

function defaultDocumentForm(): KnowledgeDocumentForm {
  return {
    documentKey: '',
    title: '',
    contentRevision: 'v1',
    normalizedMetadataText: '',
    contentReference: '',
    retentionPolicy: '',
    idempotencyKey: '',
    restrictedAccessApproved: false,
  }
}

function defaultIndexingForm(): KnowledgeIndexingForm {
  return {
    documentId: '',
    rawContent: '',
    chunkingProfile: 'default',
    vectorizationProfile: 'default',
    embeddingProvider: 'backend_default',
    embeddingModel: 'backend_default',
    embeddingVersion: 'v1',
    idempotencyKey: '',
    chunkSize: '512',
    restrictedAccessApproved: false,
  }
}

function metadataFromText(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return {}
  const parsed = JSON.parse(trimmed) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('metadata_object_required')
  }
  return Object.fromEntries(
    Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function compact(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function toMetadataText(value: Record<string, string>) {
  if (Object.keys(value).length === 0) return ''
  return JSON.stringify(value, null, 2)
}

export function useKnowledgeManager(tenantId: string, agentId: string, canManageKnowledge: boolean) {
  const { t } = useI18n()
  const [sources, setSources] = useState<KnowledgePortalSourceCard[]>([])
  const [releaseReadiness, setReleaseReadiness] = useState<KnowledgePortalReleaseReadiness | null>(null)
  const selectedSourceIdRef = useRef<string | null>(null)
  const [selectedSourceDetail, setSelectedSourceDetail] = useState<KnowledgePortalSourceDetail | null>(null)
  const [retrievalRuns, setRetrievalRuns] = useState<KnowledgeRetrievalRun[]>([])
  const [retrievalErrorMessage, setRetrievalErrorMessage] = useState<string | null>(null)
  const [supportReconstruction, setSupportReconstruction] = useState<KnowledgeSupportReconstruction | null>(null)
  const [sourceForm, setSourceForm] = useState<KnowledgeSourceForm>(() => defaultSourceForm(agentId))
  const [documentForm, setDocumentForm] = useState<KnowledgeDocumentForm>(() => defaultDocumentForm())
  const [indexingForm, setIndexingForm] = useState<KnowledgeIndexingForm>(() => defaultIndexingForm())
  const [mutationResult, setMutationResult] = useState<KnowledgeMutationResult | null>(null)
  const [indexingResult, setIndexingResult] = useState<KnowledgeIndexingMutationResponse['resource'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const rememberSelectedSourceId = useCallback((sourceId: string | null) => {
    selectedSourceIdRef.current = sourceId
  }, [])

  const loadSourceDetail = useCallback(async (sourceId: string) => {
    const detail = await knowledgeApi.getPortalSourceDetail(tenantId, agentId, sourceId)
    rememberSelectedSourceId(detail.source.id)
    setSelectedSourceDetail(detail)
    setSourceForm((current) => ({
      ...current,
      metadataText: current.metadataText || toMetadataText(detail.source.metadata),
    }))
    setDocumentForm(defaultDocumentForm())
    setIndexingForm((current) => ({
      ...current,
      documentId: current.documentId || detail.documents[0]?.id || '',
    }))
  }, [agentId, rememberSelectedSourceId, tenantId])

  const loadKnowledge = useCallback(async (preferredSourceId?: string | null) => {
    setIsLoading(true)
    setErrorMessage(null)
    setRetrievalErrorMessage(null)
    try {
      const [sourceListResult, readinessResult, retrievalRunListResult] = await Promise.allSettled([
        knowledgeApi.listPortalSources(tenantId, agentId),
        knowledgeApi.getPortalReleaseReadiness(tenantId, agentId),
        knowledgeApi.listRetrievalRuns(tenantId, { agentId }),
      ])
      if (sourceListResult.status === 'rejected') {
        throw sourceListResult.reason
      }
      if (readinessResult.status === 'rejected') {
        throw readinessResult.reason
      }
      const sourceList = sourceListResult.value
      const readiness = readinessResult.value
      setSources(sourceList.items)
      setReleaseReadiness(readiness)
      if (retrievalRunListResult.status === 'fulfilled') {
        setRetrievalRuns(retrievalRunListResult.value.items)
      } else {
        setRetrievalRuns([])
        setRetrievalErrorMessage(getLocalizedApiErrorMessage(
          retrievalRunListResult.reason,
          t,
          t('knowledge.retrieval_runs_error'),
        ))
      }
      const backendSourceIds = new Set(sourceList.items.map((item) => item.source.id))
      const requestedSourceId = preferredSourceId ?? selectedSourceIdRef.current
      const nextSourceId = requestedSourceId && backendSourceIds.has(requestedSourceId)
        ? requestedSourceId
        : sourceList.items[0]?.source.id ?? null
      if (nextSourceId) {
        await loadSourceDetail(nextSourceId)
      } else {
        rememberSelectedSourceId(null)
        setSelectedSourceDetail(null)
      }
      return {
        selectedSourceId: nextSourceId,
        containsPreferredSource: Boolean(preferredSourceId && backendSourceIds.has(preferredSourceId)),
      }
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('knowledge.load_error')))
      return {
        selectedSourceId: null,
        containsPreferredSource: false,
      }
    } finally {
      setIsLoading(false)
    }
  }, [agentId, loadSourceDetail, rememberSelectedSourceId, tenantId, t])

  useEffect(() => {
    void loadKnowledge()
  }, [loadKnowledge])

  const selectSource = useCallback(async (sourceId: string) => {
    setIsMutating(true)
    setFormError(null)
    try {
      await loadSourceDetail(sourceId)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('knowledge.source_detail_error')))
    } finally {
      setIsMutating(false)
    }
  }, [loadSourceDetail, t])

  const runMutation = useCallback(async (
    mutation: () => Promise<{ result: KnowledgeMutationResult }>,
    successMessage: string,
    afterSuccess?: () => void,
  ) => {
    if (!canManageKnowledge) {
      setFormError(t('knowledge.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setWarningMessage(null)
    setMutationResult(null)
    try {
      const response = await mutation()
      setMutationResult(response.result)
      setNotice(successMessage)
      await loadKnowledge()
      afterSuccess?.()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('knowledge.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [canManageKnowledge, loadKnowledge, t])

  const createSource = useCallback(async () => {
    if (!sourceForm.sourceKey.trim() || !sourceForm.name.trim() || !sourceForm.contentRevision.trim()) {
      setFormError(t('knowledge.validation.source_required'))
      return
    }
    let metadata: Record<string, string>
    try {
      metadata = metadataFromText(sourceForm.metadataText)
    } catch {
      setFormError(t('knowledge.validation.metadata_json'))
      return
    }
    const input: CreateKnowledgeSourceInput = {
      sourceKey: sourceForm.sourceKey,
      name: sourceForm.name,
      sourceKind: sourceForm.sourceKind,
      accessScope: sourceForm.accessScope,
      allowedAgentScope: sourceForm.restrictToCurrentAgent ? 'agent_ids' : sourceForm.allowedAgentScope,
      allowedAgentIds: sourceForm.restrictToCurrentAgent ? [agentId] : [],
      contentRevision: sourceForm.contentRevision,
      metadata,
      idempotencyKey: compact(sourceForm.idempotencyKey),
    }
    if (!canManageKnowledge) {
      setFormError(t('knowledge.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setWarningMessage(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await knowledgeApi.createSource(tenantId, input)
      setMutationResult(response.result)
      const createdSourceId = response.resource.id || response.result.resourceId
      const reloadResult = await loadKnowledge(createdSourceId)
      if (createdSourceId && reloadResult.containsPreferredSource) {
        setNotice(t('knowledge.notice.source_created'))
      } else {
        setWarningMessage(t('knowledge.notice.source_created_not_visible'))
      }
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('knowledge.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, canManageKnowledge, loadKnowledge, sourceForm, tenantId, t])

  const updateSelectedSourceMetadata = useCallback(async () => {
    if (!selectedSourceDetail) return
    let metadata: Record<string, string>
    try {
      metadata = metadataFromText(sourceForm.metadataText)
    } catch {
      setFormError(t('knowledge.validation.metadata_json'))
      return
    }
    await runMutation(
      () => knowledgeApi.updateSourceMetadata(tenantId, selectedSourceDetail.source.id, {
        expectedContentRevision: selectedSourceDetail.source.contentRevision,
        metadata,
        agentId,
        restrictedAccessApproved: selectedSourceDetail.source.accessScope === 'tenant_restricted',
      }),
      t('knowledge.notice.source_metadata_updated'),
    )
  }, [agentId, runMutation, selectedSourceDetail, sourceForm.metadataText, tenantId, t])

  const disableSelectedSource = useCallback(async () => {
    if (!selectedSourceDetail) return
    await runMutation(
      () => knowledgeApi.disableSource(tenantId, selectedSourceDetail.source.id, agentId),
      t('knowledge.notice.source_disabled'),
    )
  }, [agentId, runMutation, selectedSourceDetail, tenantId, t])

  const registerDocument = useCallback(async () => {
    if (!selectedSourceDetail) return
    if (!documentForm.documentKey.trim() || !documentForm.title.trim() || !documentForm.contentRevision.trim()) {
      setFormError(t('knowledge.validation.document_required'))
      return
    }
    let normalizedMetadata: Record<string, string>
    try {
      normalizedMetadata = metadataFromText(documentForm.normalizedMetadataText)
    } catch {
      setFormError(t('knowledge.validation.metadata_json'))
      return
    }
    const input: RegisterKnowledgeDocumentInput = {
      documentKey: documentForm.documentKey,
      title: documentForm.title,
      contentRevision: documentForm.contentRevision,
      normalizedMetadata,
      contentReference: compact(documentForm.contentReference),
      retentionPolicy: compact(documentForm.retentionPolicy),
      idempotencyKey: compact(documentForm.idempotencyKey),
      agentId,
      restrictedAccessApproved: documentForm.restrictedAccessApproved,
    }
    await runMutation(
      () => knowledgeApi.registerDocument(tenantId, selectedSourceDetail.source.id, input),
      t('knowledge.notice.document_registered'),
      () => setDocumentForm(defaultDocumentForm()),
    )
  }, [agentId, documentForm, runMutation, selectedSourceDetail, tenantId, t])

  const updateDocumentMetadata = useCallback(async (document: KnowledgeDocument) => {
    await runMutation(
      () => knowledgeApi.updateDocumentMetadata(tenantId, document.id, {
        expectedContentRevision: document.contentRevision,
        normalizedMetadata: document.normalizedMetadata,
        agentId,
        restrictedAccessApproved: selectedSourceDetail?.source.accessScope === 'tenant_restricted',
      }),
      t('knowledge.notice.document_metadata_updated'),
    )
  }, [agentId, runMutation, selectedSourceDetail?.source.accessScope, tenantId, t])

  const disableDocument = useCallback(async (documentId: string) => {
    await runMutation(
      () => knowledgeApi.disableDocument(tenantId, documentId, agentId),
      t('knowledge.notice.document_disabled'),
    )
  }, [agentId, runMutation, tenantId, t])

  const runIndexing = useCallback(async () => {
    if (!selectedSourceDetail) return
    if (
      !indexingForm.documentId ||
      !indexingForm.rawContent.trim() ||
      !indexingForm.chunkingProfile.trim() ||
      !indexingForm.vectorizationProfile.trim() ||
      !indexingForm.embeddingProvider.trim() ||
      !indexingForm.embeddingModel.trim() ||
      !indexingForm.embeddingVersion.trim() ||
      !indexingForm.idempotencyKey.trim()
    ) {
      setFormError(t('knowledge.validation.indexing_required'))
      return
    }
    const input: RunKnowledgeIndexingInput = {
      documentId: indexingForm.documentId,
      rawContent: indexingForm.rawContent,
      chunkingProfile: indexingForm.chunkingProfile,
      vectorizationProfile: indexingForm.vectorizationProfile,
      embeddingProvider: indexingForm.embeddingProvider,
      embeddingModel: indexingForm.embeddingModel,
      embeddingVersion: indexingForm.embeddingVersion,
      idempotencyKey: indexingForm.idempotencyKey,
      chunkSize: Number.parseInt(indexingForm.chunkSize, 10) || 512,
      agentId,
      restrictedAccessApproved: indexingForm.restrictedAccessApproved,
    }
    setIndexingResult(null)
    await runMutation(async () => {
      const response = await knowledgeApi.runIndexing(tenantId, selectedSourceDetail.source.id, input)
      setIndexingResult(response.resource)
      return response
    }, t('knowledge.notice.indexing_started'), () => setIndexingForm(defaultIndexingForm()))
  }, [agentId, indexingForm, runMutation, selectedSourceDetail, tenantId, t])

  const retryIndexingJob = useCallback(async (jobId: string) => {
    await runMutation(
      () => knowledgeApi.retryIndexingJob(tenantId, jobId, agentId),
      t('knowledge.notice.indexing_retry'),
    )
  }, [agentId, runMutation, tenantId, t])

  const loadSupportReconstruction = useCallback(async (retrievalRunId: string) => {
    setIsMutating(true)
    setFormError(null)
    try {
      setSupportReconstruction(await knowledgeApi.getSupportReconstruction(tenantId, retrievalRunId))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('knowledge.support_reconstruction_error')))
    } finally {
      setIsMutating(false)
    }
  }, [tenantId, t])

  return {
    tenantId,
    agentId,
    sources,
    releaseReadiness,
    selectedSourceDetail,
    retrievalRuns,
    retrievalErrorMessage,
    supportReconstruction,
    sourceForm,
    documentForm,
    indexingForm,
    mutationResult,
    indexingResult,
    canManageKnowledge,
    isLoading,
    isMutating,
    errorMessage,
    formError,
    warningMessage,
    notice,
    loadKnowledge,
    selectSource,
    setSourceForm,
    setDocumentForm,
    setIndexingForm,
    createSource,
    updateSelectedSourceMetadata,
    disableSelectedSource,
    registerDocument,
    updateDocumentMetadata,
    disableDocument,
    runIndexing,
    retryIndexingJob,
    loadSupportReconstruction,
  }
}

export type KnowledgeManager = ReturnType<typeof useKnowledgeManager>
