import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { agentTemplatesApi } from '@/modules/AgentTemplates/api/agentTemplatesApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>

describe('agentTemplatesApi', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('maps the tenant agent catalog from backend fields', async () => {
    getMock.mockResolvedValue({
      data: {
        archetypes: [
          {
            archetype_id: 'sales_qualification',
            label: 'Sales qualification',
            purpose: 'Qualify leads',
            supported_channels: ['web_widget'],
            default_setup_guidance: ['Connect knowledge'],
          },
        ],
        templates: [
          {
            template_id: 'sales_qualification_v1',
            archetype_id: 'sales_qualification',
            label: 'Sales agent',
            purpose: 'Sales support',
            default_agent_purpose: 'Help buyers',
            default_agent_description: 'Default description',
            default_setup_guidance: ['Review setup'],
            required_knowledge_modes: ['managed_source'],
            optional_knowledge_modes: ['faq'],
            required_capability_categories: ['handoff'],
            optional_capability_categories: ['crm'],
            policy_expectations: ['safe_support'],
            supported_channels: ['web_widget'],
            checklist_requirements: [
              {
                item_id: 'knowledge',
                owner_area: 'knowledge',
                blocking: true,
                required_action: 'Bind approved knowledge',
                detail: 'Knowledge is required',
                release_readiness_marker: 'knowledge_ready',
              },
            ],
            evaluation_smoke_markers: ['sales_smoke'],
            metering_interpretation_markers: ['chat_turns'],
          },
        ],
      },
    })

    await expect(agentTemplatesApi.getCatalog('tenant_1')).resolves.toMatchObject({
      archetypes: [{ archetypeId: 'sales_qualification', supportedChannels: ['web_widget'] }],
      templates: [
        {
          templateId: 'sales_qualification_v1',
          archetypeId: 'sales_qualification',
          checklistRequirements: [{ itemId: 'knowledge', blocking: true }],
        },
      ],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agent-catalog')
  })
})
