import { describe, expect, it } from 'vitest'
import { deriveAgentConfigAllowedActionRefs } from '@/modules/AgentConfig/model/useAgentConfigManager'

describe('deriveAgentConfigAllowedActionRefs', () => {
  it('allows config management only when role and backend action ref both allow it', () => {
    expect(deriveAgentConfigAllowedActionRefs(['agent_config.manage'], true)).toBe(true)
    expect(deriveAgentConfigAllowedActionRefs(['agents.update_metadata', 'agents.change_status'], true)).toBe(false)
    expect(deriveAgentConfigAllowedActionRefs(['agent_config.manage'], false)).toBe(false)
  })
})
