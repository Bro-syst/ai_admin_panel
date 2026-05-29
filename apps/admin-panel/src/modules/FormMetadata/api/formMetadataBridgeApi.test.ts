import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import {
  FormMetadataBridgeError,
  buildFormMetadataCacheKey,
  formMetadataBridgeApi,
} from '@/modules/FormMetadata/api/formMetadataBridgeApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>

const agentConfigMetadataPayload = {
  form_id: 'agent_config',
  form_version: '1.0',
  schema_version: '1.0',
  cache_policy: {
    safe_to_cache: true,
    scope: 'tenant_agent',
    vary_by: ['tenant_id', 'agent_id', 'admin_permissions', 'model_catalog'],
  },
  fields: [
    {
      field_id: 'model_preference.preferred_model_family',
      payload_path: 'model_preference.preferred_model_family',
      control: 'select',
      required: false,
      default_value: null,
      localization_key: 'forms.agent_config.fields.model_preference.preferred_model_family',
      help_key: 'forms.agent_config.fields.model_preference.preferred_model_family.help',
      label: 'Preferred model family',
      backend_hint: 'future-safe',
      options: [
        {
          value: 'general-chat',
          localization_key:
            'forms.agent_config.fields.model_preference.preferred_model_family.options.general-chat',
          source: 'llm_gateway.system_provider_model_catalog',
          default: false,
          label: 'General chat',
        },
        {
          value: 'high-reasoning',
          localization_key:
            'forms.agent_config.fields.model_preference.preferred_model_family.options.high-reasoning',
          source: 'llm_gateway.system_provider_model_catalog',
          default: false,
        },
      ],
      constraints: { backend_policy: 'AgentConfigFoundationPolicy' },
      readonly: false,
    },
    {
      field_id: 'future_contract.date_window',
      payload_path: 'future_contract.date_window',
      control: 'date_range',
      required: false,
      default_value: [],
      localization_key: 'forms.future.fields.date_window',
      options: [],
      constraints: { max_days: 30 },
      renderer_hint: 'future-form-control',
    },
  ],
  option_sources: {
    'model_preference.preferred_model_family': 'llm_gateway.system_provider_model_catalog',
  },
  backend_validation: {
    authoritative: true,
    policy_ref: 'AgentConfigFoundationPolicy',
  },
  future_form_capability: 'passthrough',
}

describe('formMetadataBridgeApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    window.dispatchEvent = vi.fn()
  })

  it('requests agent_config metadata through the canonical admin route and preserves backend values', async () => {
    getMock.mockResolvedValue({ data: agentConfigMetadataPayload })

    const metadata = await formMetadataBridgeApi.getFormMetadata({
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      formId: 'agent_config',
    })

    expect(getMock).toHaveBeenCalledWith(
      '/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/forms/agent-config/metadata',
    )
    expect(metadata).toMatchObject({
      formId: 'agent_config',
      formVersion: '1.0',
      schemaVersion: '1.0',
      cachePolicy: {
        safeToCache: true,
        scope: 'tenant_agent',
        varyBy: ['tenant_id', 'agent_id', 'admin_permissions', 'model_catalog'],
      },
      backendValidation: {
        authoritative: true,
        policy_ref: 'AgentConfigFoundationPolicy',
      },
    })
    expect(metadata.fields[0].options.map((option) => option.value)).toEqual([
      'general-chat',
      'high-reasoning',
    ])
    expect(metadata.fields[0].options.map((option) => option.localizationKey)).toEqual([
      'forms.agent_config.fields.model_preference.preferred_model_family.options.general-chat',
      'forms.agent_config.fields.model_preference.preferred_model_family.options.high-reasoning',
    ])
    expect(metadata.fields[0].extensions).toEqual({ backend_hint: 'future-safe' })
    expect(metadata.fields[0].options[0].extensions).toEqual({})
    expect(metadata.extensions).toEqual({ future_form_capability: 'passthrough' })
  })

  it('does not pass translated labels through the bridge contract', async () => {
    getMock.mockResolvedValue({ data: agentConfigMetadataPayload })

    const metadata = await formMetadataBridgeApi.getFormMetadata({
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      formId: 'agent_config',
    })

    expect('label' in metadata.fields[0]).toBe(false)
    expect(metadata.fields[0].extensions).not.toHaveProperty('label')
    expect('label' in metadata.fields[0].options[0]).toBe(false)
    expect(metadata.fields[0].options[0].extensions).not.toHaveProperty('label')
  })

  it('keeps future fields representable without a schema rewrite', async () => {
    getMock.mockResolvedValue({ data: agentConfigMetadataPayload })

    const metadata = await formMetadataBridgeApi.getFormMetadata({
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      formId: 'agent_config',
    })

    expect(metadata.fields[1]).toMatchObject({
      fieldId: 'future_contract.date_window',
      payloadPath: 'future_contract.date_window',
      control: 'date_range',
      constraints: { max_days: 30 },
      extensions: { renderer_hint: 'future-form-control' },
    })
  })

  it('builds cache keys from tenant, agent, form id and backend versions', async () => {
    getMock.mockResolvedValue({ data: agentConfigMetadataPayload })

    const scope = { tenantId: 'tenant_1', agentId: 'agent_1', formId: 'agent_config' }
    const metadata = await formMetadataBridgeApi.getFormMetadata(scope)

    expect(buildFormMetadataCacheKey(scope, metadata)).toBe(
      'form-metadata:tenant_1:agent_1:agent_config:1.0:1.0',
    )
  })

  it('normalizes backend rejections for admin UI support tracing without hiding status', async () => {
    getMock.mockRejectedValue({
      kind: 'forbidden',
      status: 403,
      code: 'tenant_access_denied',
      message: 'Forbidden tenant',
      requestId: 'corr_1',
      details: { detail: 'Forbidden tenant' },
    })

    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_forbidden',
        agentId: 'agent_1',
        formId: 'agent_config',
      }),
    ).rejects.toMatchObject({
      kind: 'forbidden',
      status: 403,
      code: 'tenant_access_denied',
      message: 'Forbidden tenant',
      requestId: 'corr_1',
    })
  })

  it('uses a generic support message when backend error has no message', async () => {
    getMock.mockRejectedValue({
      kind: 'server',
      status: 500,
      code: 'metadata_upstream_failure',
      requestId: 'corr_500',
    })

    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        formId: 'agent_config',
      }),
    ).rejects.toMatchObject({
      kind: 'server',
      status: 500,
      code: 'metadata_upstream_failure',
      message: 'Form metadata request failed',
      requestId: 'corr_500',
    })
  })

  it('passes through already-normalized bridge errors', async () => {
    getMock.mockRejectedValue(
      new FormMetadataBridgeError({
        kind: 'validation',
        status: 400,
        code: 'contract_failure',
        message: 'Bridge contract failure',
      }),
    )

    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        formId: 'agent_config',
      }),
    ).rejects.toMatchObject({
      kind: 'validation',
      status: 400,
      code: 'contract_failure',
      message: 'Bridge contract failure',
    })
  })

  it('normalizes non-api transport failures into a safe bridge error', async () => {
    getMock.mockRejectedValue(new Error('socket closed'))

    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        formId: 'agent_config',
      }),
    ).rejects.toMatchObject({
      kind: 'unknown',
      message: 'Form metadata request failed',
    })
  })

  it('uses safe defaults for malformed but present metadata fragments', async () => {
    getMock.mockResolvedValue({
      data: {
        form_id: 'agent_config',
        cache_policy: { safe_to_cache: 'yes', scope: 123, vary_by: [false, 'tenant_id'] },
        fields: [
          {
            field_id: 'compatibility_and_safety.config_schema_version',
            payload_path: 'compatibility_and_safety.config_schema_version',
            control: 'read_only_default',
            default_value: 1,
            options: [{ value: false, localization_key: null, source: null, default: 'yes' }],
            constraints: null,
          },
        ],
        option_sources: null,
        backend_validation: null,
      },
    })

    const metadata = await formMetadataBridgeApi.getFormMetadata({
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      formId: 'agent_config',
    })

    expect(metadata.cachePolicy).toEqual({ safeToCache: false, scope: '', varyBy: ['tenant_id'] })
    expect(metadata.optionSources).toEqual({})
    expect(metadata.backendValidation).toEqual({})
    expect(metadata.fields[0].defaultValue).toEqual([])
    expect(metadata.fields[0].constraints).toEqual({})
    expect(metadata.fields[0].options[0]).toMatchObject({
      value: false,
      localizationKey: '',
      source: '',
      default: false,
    })
  })

  it('rejects unknown form ids safely before inventing bridge routes', async () => {
    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        formId: 'unknown_future_form',
      }),
    ).rejects.toBeInstanceOf(FormMetadataBridgeError)

    expect(getMock).not.toHaveBeenCalled()
  })

  it('does not require browser event support for metadata fetches', async () => {
    getMock.mockResolvedValue({ data: agentConfigMetadataPayload })
    Object.defineProperty(window, 'dispatchEvent', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        formId: 'agent_config',
      }),
    ).resolves.toMatchObject({ formId: 'agent_config' })
  })

  it('emits safe success and failure observability events without credentials', async () => {
    getMock.mockResolvedValueOnce({ data: agentConfigMetadataPayload })
    await formMetadataBridgeApi.getFormMetadata({
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      formId: 'agent_config',
    })

    getMock.mockRejectedValueOnce({
      kind: 'unauthorized',
      status: 401,
      code: 'auth_required',
      message: 'Authentication required',
      requestId: 'corr_2',
    })
    await expect(
      formMetadataBridgeApi.getFormMetadata({
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        formId: 'agent_config',
      }),
    ).rejects.toMatchObject({ status: 401 })

    expect(window.dispatchEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: 'ai-admin:form-metadata-bridge',
        detail: {
          result: 'success',
          formId: 'agent_config',
          tenantId: 'tenant_1',
          agentId: 'agent_1',
          formVersion: '1.0',
          schemaVersion: '1.0',
        },
      }),
    )
    expect(window.dispatchEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'ai-admin:form-metadata-bridge',
        detail: {
          result: 'failure',
          formId: 'agent_config',
          tenantId: 'tenant_1',
          agentId: 'agent_1',
          status: 401,
          code: 'auth_required',
          requestId: 'corr_2',
        },
      }),
    )
  })
})
