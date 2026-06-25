import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { AgentCreateManager } from '@/modules/Agents/model/useAgentCreateManager'
import { AgentCreateView } from '@/modules/Agents/ui/AgentCreateView'
import type { AgentTemplate, AgentTemplateCatalogManager } from '@/modules/AgentTemplates'

const routerFutureConfig = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
} as const

function template(overrides: Partial<AgentTemplate> = {}): AgentTemplate {
  return {
    templateId: 'sales_qualification_v1',
    archetypeId: 'sales_qualification',
    label: 'Sales Qualification v1',
    purpose: 'Qualify sales leads',
    defaultAgentPurpose: 'Sales default purpose',
    defaultAgentDescription: 'Sales default description',
    defaultSetupGuidance: [],
    requiredKnowledgeModes: ['product_knowledge'],
    optionalKnowledgeModes: [],
    requiredCapabilityCategories: [],
    optionalCapabilityCategories: [],
    policyExpectations: [],
    supportedChannels: ['public_widget'],
    checklistRequirements: [],
    evaluationSmokeMarkers: [],
    meteringInterpretationMarkers: [],
    ...overrides,
  }
}

function renderView({
  manager = {},
  catalogManager = {},
  locale = 'ru',
}: {
  manager?: Partial<AgentCreateManager>
  catalogManager?: Partial<AgentTemplateCatalogManager>
  locale?: string
} = {}) {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)
  const selectedTemplate = template()
  const defaultManager = {
    tenantId: 'tenant_1',
    form: { name: '', purpose: 'Sales default purpose', description: 'Sales default description' },
    canMutate: true,
    canSubmit: false,
    isSubmitting: false,
    formError: null,
    mutationResult: null,
    updateForm: vi.fn(),
    createAgent: vi.fn(),
    ...manager,
  } as unknown as AgentCreateManager
  const defaultCatalogManager = {
    catalog: { archetypes: [], templates: [selectedTemplate] },
    selectedTemplateId: selectedTemplate.templateId,
    selectedTemplate,
    isLoading: false,
    errorMessage: null,
    loadCatalog: vi.fn(),
    setSelectedTemplateId: vi.fn(),
    ...catalogManager,
  } as unknown as AgentTemplateCatalogManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/new']} future={routerFutureConfig}>
        <AgentCreateView manager={defaultManager} catalogManager={defaultCatalogManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return { manager: defaultManager, catalogManager: defaultCatalogManager }
}

describe('AgentCreateView', () => {
  it('shows the disabled submit reason when the required name is empty', () => {
    renderView()

    const submit = screen.getByRole('button', { name: 'Создать агента' })

    expect(submit).toBeDisabled()
    expect(submit).toHaveAttribute('aria-describedby', 'agent-create-submit-disabled-reason')
    expect(screen.getByText('Введите название агента.')).toBeInTheDocument()
  })

  it('does not show a disabled reason when the form can submit', () => {
    renderView({
      manager: {
        form: { name: 'Sales Support Manual Smoke Agent', purpose: 'Sales default purpose', description: 'Sales default description' },
        canSubmit: true,
      },
    })

    expect(screen.getByRole('button', { name: 'Создать агента' })).toBeEnabled()
    expect(screen.queryByText('Введите название агента.')).not.toBeInTheDocument()
  })
})
