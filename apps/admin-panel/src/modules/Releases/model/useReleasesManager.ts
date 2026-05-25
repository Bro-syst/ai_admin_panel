import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'
import {
  releasesApi,
  type MutationResult,
  type PublishEvidenceInput,
  type ReleaseCreateInput,
  type ReleaseDetail,
  type ReleaseListItem,
  type ReleaseReadiness,
} from '@/modules/Releases/api/releasesApi'

const RELEASE_ACTION_REFS = [
  'releases.manage',
  'release.manage',
  'agent_releases.manage',
  'agent.releases.manage',
  'agents.releases.manage',
]

function canMutateReleases(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['releases:write', 'release:write', 'agent-releases:write', 'manage-releases', 'manage-agents'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveReleasesCanManage(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && RELEASE_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

export type ReleaseDraftForm = {
  selectedConfigId: string
  releaseCandidateId: string
  evidenceStableReference: string
  evidenceChangeKind: string
  evidencePassed: boolean
  smokeCaseId: string
  smokeCasePassed: boolean
  smokeCaseReference: string
  smokeCaseOutcome: string
  manualOverrideReasonCode: string
  manualOverrideItemsText: string
  manualOverrideComment: string
}

export type PublishEvidenceForm = {
  supportReconstructionReference: string
  usageChatId: string
  usageConversationTurnId: string
  usageModelRequestId: string
  billingExportReference: string
  releaseReportReference: string
}

function linesToArray(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function defaultDraftForm(): ReleaseDraftForm {
  return {
    selectedConfigId: '',
    releaseCandidateId: '',
    evidenceStableReference: '',
    evidenceChangeKind: 'runtime_behavior',
    evidencePassed: true,
    smokeCaseId: '',
    smokeCasePassed: true,
    smokeCaseReference: '',
    smokeCaseOutcome: '',
    manualOverrideReasonCode: '',
    manualOverrideItemsText: '',
    manualOverrideComment: '',
  }
}

function defaultPublishForm(): PublishEvidenceForm {
  return {
    supportReconstructionReference: '',
    usageChatId: '',
    usageConversationTurnId: '',
    usageModelRequestId: '',
    billingExportReference: '',
    releaseReportReference: '',
  }
}

export function buildReleaseDraftInput(form: ReleaseDraftForm): ReleaseCreateInput {
  return {
    selectedConfigId: form.selectedConfigId.trim() || null,
    releaseCandidateId: form.releaseCandidateId.trim() || null,
    evidence: form.evidenceStableReference.trim()
      ? {
          changeKind: form.evidenceChangeKind,
          stableReference: form.evidenceStableReference.trim(),
          passed: form.evidencePassed,
          smokeCaseId: form.smokeCaseId.trim(),
          smokeCasePassed: form.smokeCasePassed,
          smokeCaseReference: form.smokeCaseReference.trim() || null,
          smokeCaseOutcome: form.smokeCaseOutcome.trim() || null,
        }
      : null,
    manualOverride: form.manualOverrideReasonCode.trim()
      ? {
          reasonCode: form.manualOverrideReasonCode.trim(),
          relatedMissingOrFailedItems: linesToArray(form.manualOverrideItemsText),
          comment: form.manualOverrideComment.trim() || null,
        }
      : null,
  }
}

function buildPublishInput(form: PublishEvidenceForm): PublishEvidenceInput | null {
  const input = {
    supportReconstructionReference: form.supportReconstructionReference.trim() || null,
    usageChatId: form.usageChatId.trim() || null,
    usageConversationTurnId: form.usageConversationTurnId.trim() || null,
    usageModelRequestId: form.usageModelRequestId.trim() || null,
    billingExportReference: form.billingExportReference.trim() || null,
    releaseReportReference: form.releaseReportReference.trim() || null,
  }
  return Object.values(input).some(Boolean) ? input : null
}

export function useReleasesManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [readiness, setReadiness] = useState<ReleaseReadiness | null>(null)
  const [releases, setReleases] = useState<ReleaseListItem[]>([])
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDetail | null>(null)
  const [draftForm, setDraftForm] = useState<ReleaseDraftForm>(() => defaultDraftForm())
  const [publishForm, setPublishForm] = useState<PublishEvidenceForm>(() => defaultPublishForm())
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateReleases(adminUser)
  const canManageReleases = useMemo(
    () => deriveReleasesCanManage(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )

  const loadReleases = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agent, nextReadiness, nextReleases] = await Promise.all([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        releasesApi.getReadiness(tenantId, agentId),
        releasesApi.listReleases(tenantId, agentId),
      ])
      setAgentDetail(agent)
      setReadiness(nextReadiness)
      setReleases(nextReleases)
      const selectedId = selectedRelease?.releaseId ?? nextReleases[0]?.releaseId
      setSelectedRelease(selectedId ? await releasesApi.getRelease(tenantId, agentId, selectedId) : null)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('releases.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, selectedRelease?.releaseId, tenantId, t])

  useEffect(() => {
    void loadReleases()
  }, [loadReleases])

  const selectRelease = useCallback(async (releaseId: string) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      setSelectedRelease(await releasesApi.getRelease(tenantId, agentId, releaseId))
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('releases.detail_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  const applyMutation = useCallback(async (mutation: () => Promise<{ resource: ReleaseDetail; result: MutationResult }>, message: string) => {
    if (!canManageReleases) {
      setFormError(t('releases.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await mutation()
      setSelectedRelease(response.resource)
      setMutationResult(response.result)
      setNotice(message)
      const [nextReadiness, nextReleases] = await Promise.all([
        releasesApi.getReadiness(tenantId, agentId),
        releasesApi.listReleases(tenantId, agentId),
      ])
      setReadiness(nextReadiness)
      setReleases(nextReleases)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('releases.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, canManageReleases, tenantId, t])

  const createRelease = useCallback(async () => {
    const input = buildReleaseDraftInput(draftForm)
    await applyMutation(() => releasesApi.createRelease(tenantId, agentId, input), t('releases.notice.created'))
  }, [agentId, applyMutation, draftForm, tenantId, t])

  const publishSelected = useCallback(async () => {
    if (!selectedRelease) return
    await applyMutation(
      () => releasesApi.publishRelease(tenantId, agentId, selectedRelease.releaseId, buildPublishInput(publishForm)),
      t('releases.notice.published'),
    )
  }, [agentId, applyMutation, publishForm, selectedRelease, tenantId, t])

  const rollbackSelected = useCallback(async () => {
    if (!selectedRelease) return
    await applyMutation(() => releasesApi.rollbackRelease(tenantId, agentId, selectedRelease.releaseId), t('releases.notice.rolled_back'))
  }, [agentId, applyMutation, selectedRelease, tenantId, t])

  const disableSelected = useCallback(async () => {
    if (!selectedRelease) return
    await applyMutation(() => releasesApi.disableRelease(tenantId, agentId, selectedRelease.releaseId), t('releases.notice.disabled'))
  }, [agentId, applyMutation, selectedRelease, tenantId, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    readiness,
    releases,
    selectedRelease,
    draftForm,
    publishForm,
    mutationResult,
    canManageReleases,
    isLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    loadReleases,
    selectRelease,
    setDraftForm,
    setPublishForm,
    createRelease,
    publishSelected,
    rollbackSelected,
    disableSelected,
  }
}

export type ReleasesManager = ReturnType<typeof useReleasesManager>
