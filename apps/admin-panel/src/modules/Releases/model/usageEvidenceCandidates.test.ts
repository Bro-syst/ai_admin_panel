import { describe, expect, it } from 'vitest'
import type { ReleaseUsageEvidenceCandidates } from '@/modules/Releases/api/releasesApi'
import {
  applyUsageEvidenceCandidate,
  getUsageEvidenceNoCandidateReasonKey,
  selectUsageEvidenceCandidateId,
} from '@/modules/Releases/model/usageEvidenceCandidates'

const candidates: ReleaseUsageEvidenceCandidates = {
  items: [{
    chatId: 'chat_1',
    conversationTurnId: 'turn_1',
    modelRequestId: 'model_request_1',
    createdAt: '2026-05-27T10:00:00Z',
    turnStatus: 'response_rendered',
    modelRequestState: 'completed',
    usageRecorded: true,
    agentId: 'agent_1',
    agentConfigId: 'config_1',
    widgetKey: 'sales-widget',
    channel: 'public_widget',
    displayLabel: 'Widget smoke',
  }],
  summary: {
    candidateCount: 1,
    ready: true,
    noCandidateReason: null,
    message: 'Ready.',
  },
  noCandidateReason: null,
  generatedAt: '2026-05-27T10:01:00Z',
}

describe('usageEvidenceCandidates helpers', () => {
  it('keeps an existing backend candidate selection when it is still present', () => {
    expect(selectUsageEvidenceCandidateId('turn_1', candidates)).toBe('turn_1')
  })

  it('selects the first backend candidate or clears selection when no candidates are present', () => {
    expect(selectUsageEvidenceCandidateId('missing_turn', candidates)).toBe('turn_1')
    expect(selectUsageEvidenceCandidateId('missing_turn', { ...candidates, items: [] })).toBe('')
  })

  it('copies only backend-provided publish usage ids from the selected candidate', () => {
    expect(
      applyUsageEvidenceCandidate({
        supportReconstructionReference: 'support_1',
        usageChatId: '',
        usageConversationTurnId: '',
        usageModelRequestId: '',
        billingExportReference: '',
        releaseReportReference: 'report_1',
      }, candidates.items[0]),
    ).toEqual({
      supportReconstructionReference: 'support_1',
      usageChatId: 'chat_1',
      usageConversationTurnId: 'turn_1',
      usageModelRequestId: 'model_request_1',
      billingExportReference: '',
      releaseReportReference: 'report_1',
    })
  })

  it('resolves no-candidate reasons through known frontend dictionary keys', () => {
    expect(getUsageEvidenceNoCandidateReasonKey(null)).toBe('agents.empty_value')
    expect(getUsageEvidenceNoCandidateReasonKey('candidate_source_unavailable')).toBe('releases.usage_evidence.no_candidate_reason.candidate_source_unavailable')
    expect(getUsageEvidenceNoCandidateReasonKey('Candidate Source Unavailable')).toBe('releases.usage_evidence.no_candidate_reason.candidate_source_unavailable')
    expect(getUsageEvidenceNoCandidateReasonKey('future_reason')).toBe('releases.usage_evidence.no_candidate_reason.unknown')
  })
})
