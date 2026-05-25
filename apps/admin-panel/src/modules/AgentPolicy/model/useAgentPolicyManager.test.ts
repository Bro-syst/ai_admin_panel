import { describe, expect, it } from 'vitest'
import { deriveAgentPolicyCanManage } from '@/modules/AgentPolicy/model/useAgentPolicyManager'

describe('deriveAgentPolicyCanManage', () => {
  it('allows policy mutations only when role and backend action refs both allow them', () => {
    expect(deriveAgentPolicyCanManage(['agent_policy.manage'], true)).toBe(true)
    expect(deriveAgentPolicyCanManage(['policy.binding.manage'], true)).toBe(true)
    expect(deriveAgentPolicyCanManage(['agent_capabilities.manage'], true)).toBe(false)
    expect(deriveAgentPolicyCanManage(['agent_policy.manage'], false)).toBe(false)
  })
})
