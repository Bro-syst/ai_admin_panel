import { describe, expect, it } from 'vitest'
import { deriveAgentCapabilitiesCanManage } from '@/modules/AgentCapabilities/model/useAgentCapabilitiesManager'

describe('deriveAgentCapabilitiesCanManage', () => {
  it('allows capability mutations only when role and backend action refs both allow them', () => {
    expect(deriveAgentCapabilitiesCanManage(['agent_capabilities.manage'], true)).toBe(true)
    expect(deriveAgentCapabilitiesCanManage(['capability.assignments.manage'], true)).toBe(true)
    expect(deriveAgentCapabilitiesCanManage(['agents.update_metadata'], true)).toBe(false)
    expect(deriveAgentCapabilitiesCanManage(['agent_capabilities.manage'], false)).toBe(false)
  })
})
