import { describe, expect, it } from 'vitest'
import {
  applyAgentConfigMetadataDefaults,
  createDefaultAgentConfigPayload,
  deriveAgentConfigAllowedActionRefs,
} from '@/modules/AgentConfig/model/useAgentConfigManager'
import type { FormMetadata } from '@/modules/FormMetadata'

describe('deriveAgentConfigAllowedActionRefs', () => {
  it('allows config management only when role and backend action ref both allow it', () => {
    expect(deriveAgentConfigAllowedActionRefs(['agent_config.manage'], true)).toBe(true)
    expect(deriveAgentConfigAllowedActionRefs(['agents.update_metadata', 'agents.change_status'], true)).toBe(false)
    expect(deriveAgentConfigAllowedActionRefs(['agent_config.manage'], false)).toBe(false)
  })
})

describe('applyAgentConfigMetadataDefaults', () => {
  it('keeps existing payload values when metadata defaults are absent or invalid', () => {
    const payload = createDefaultAgentConfigPayload('Sales assistant')
    payload.modelSelectionHints.preferredCapabilities = ['chat']
    payload.compatibilityAndSafety.safetyLabels = ['baseline']
    const metadata = {
      formId: 'agent_config',
      formVersion: '1.0',
      schemaVersion: '1.0',
      cachePolicy: { safeToCache: true, scope: 'tenant_agent', varyBy: ['tenant_id', 'agent_id'] },
      optionSources: {},
      backendValidation: { authoritative: true },
      extensions: {},
      fields: [
        metadataField('model_selection_hints.preferred_capabilities', 'chat'),
        metadataField('compatibility_and_safety.safety_labels', null),
      ],
    } satisfies FormMetadata

    const unchangedWithoutMetadata = applyAgentConfigMetadataDefaults(payload, null)
    const unchangedWithInvalidArrayDefaults = applyAgentConfigMetadataDefaults(payload, metadata)

    expect(unchangedWithoutMetadata).toBe(payload)
    expect(unchangedWithInvalidArrayDefaults.modelSelectionHints.preferredCapabilities).toEqual(['chat'])
    expect(unchangedWithInvalidArrayDefaults.compatibilityAndSafety.safetyLabels).toEqual(['baseline'])
  })
})

function metadataField(payloadPath: string, defaultValue: string | boolean | string[] | null): FormMetadata['fields'][number] {
  return {
    fieldId: payloadPath,
    payloadPath,
    control: 'multi_select',
    required: false,
    defaultValue,
    localizationKey: `forms.agent_config.fields.${payloadPath}`,
    helpKey: null,
    options: [],
    constraints: {},
    readonly: false,
    extensions: {},
  }
}
