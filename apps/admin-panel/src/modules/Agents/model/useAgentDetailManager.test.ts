import { describe, expect, it } from 'vitest'
import { deriveAgentAllowedMutationActions } from '@/modules/Agents/model/useAgentDetailManager'

describe('deriveAgentAllowedMutationActions', () => {
  it('allows only Stage 06-safe backend action refs for mutating admins', () => {
    expect(
      deriveAgentAllowedMutationActions(
        ['agents.update_metadata', 'agents.change_status', 'agents.change_lifecycle', 'agent_config.manage'],
        true,
      ),
    ).toEqual({
      updateMetadata: true,
      changeStatus: true,
      changeLifecycle: true,
    })
  })

  it('does not allow future-stage refs or read-only admins', () => {
    expect(deriveAgentAllowedMutationActions(['agent_config.manage', 'knowledge.binding.manage', 'policy.binding.manage'], true)).toEqual({
      updateMetadata: false,
      changeStatus: false,
      changeLifecycle: false,
    })

    expect(deriveAgentAllowedMutationActions(['agents.update_metadata', 'agents.change_status', 'agents.change_lifecycle'], false)).toEqual({
      updateMetadata: false,
      changeStatus: false,
      changeLifecycle: false,
    })
  })
})
