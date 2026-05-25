import { describe, expect, it } from 'vitest'
import { buildReleaseDraftInput, deriveReleasesCanManage } from '@/modules/Releases/model/useReleasesManager'

describe('deriveReleasesCanManage', () => {
  it('allows release mutations only when role and backend action refs both allow them', () => {
    expect(deriveReleasesCanManage(['releases.manage'], true)).toBe(true)
    expect(deriveReleasesCanManage(['agent_releases.manage'], true)).toBe(true)
    expect(deriveReleasesCanManage(['sites_widgets.manage'], true)).toBe(false)
    expect(deriveReleasesCanManage(['releases.manage'], false)).toBe(false)
  })

  it('keeps optional manual override comment in the create draft payload', () => {
    expect(
      buildReleaseDraftInput({
        selectedConfigId: 'config_7',
        releaseCandidateId: '',
        evidenceStableReference: '',
        evidenceChangeKind: 'runtime_behavior',
        evidencePassed: true,
        smokeCaseId: '',
        smokeCasePassed: true,
        smokeCaseReference: '',
        smokeCaseOutcome: '',
        manualOverrideReasonCode: 'business_approved',
        manualOverrideItemsText: 'knowledge\npolicy',
        manualOverrideComment: 'Approved for limited rollout.',
      }),
    ).toMatchObject({
      selectedConfigId: 'config_7',
      manualOverride: {
        reasonCode: 'business_approved',
        relatedMissingOrFailedItems: ['knowledge', 'policy'],
        comment: 'Approved for limited rollout.',
      },
    })
  })
})
