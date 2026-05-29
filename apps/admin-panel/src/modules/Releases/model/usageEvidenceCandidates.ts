import type { ReleaseUsageEvidenceCandidate, ReleaseUsageEvidenceCandidates } from '@/modules/Releases/api/releasesApi'

type PublishEvidenceFormLike = {
  supportReconstructionReference: string
  usageChatId: string
  usageConversationTurnId: string
  usageModelRequestId: string
  billingExportReference: string
  releaseReportReference: string
}

const KNOWN_NO_CANDIDATE_REASONS = new Set([
  'runtime_provider_not_ready',
  'no_successful_widget_conversation',
  'usage_not_recorded',
  'candidate_source_unavailable',
])

function keySuffix(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export function selectUsageEvidenceCandidateId(
  currentId: string,
  candidates: ReleaseUsageEvidenceCandidates,
) {
  if (currentId && candidates.items.some((candidate) => candidate.conversationTurnId === currentId)) {
    return currentId
  }
  return candidates.items[0]?.conversationTurnId ?? ''
}

export function applyUsageEvidenceCandidate(
  current: PublishEvidenceFormLike,
  candidate: ReleaseUsageEvidenceCandidate,
): PublishEvidenceFormLike {
  return {
    ...current,
    usageChatId: candidate.chatId,
    usageConversationTurnId: candidate.conversationTurnId,
    usageModelRequestId: candidate.modelRequestId,
  }
}

export function getUsageEvidenceNoCandidateReasonKey(reason: string | null | undefined) {
  if (!reason) return 'agents.empty_value'
  const suffix = keySuffix(reason)
  return KNOWN_NO_CANDIDATE_REASONS.has(suffix)
    ? `releases.usage_evidence.no_candidate_reason.${suffix}`
    : 'releases.usage_evidence.no_candidate_reason.unknown'
}
