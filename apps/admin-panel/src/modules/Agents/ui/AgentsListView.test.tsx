import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { AgentsListManager } from '@/modules/Agents/model/useAgentsListManager'
import { AgentsListView } from '@/modules/Agents/ui/AgentsListView'
import type { AgentTemplateCatalogManager } from '@/modules/AgentTemplates'

function renderView(manager: Partial<AgentsListManager> = {}, catalog: Partial<AgentTemplateCatalogManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)

  const defaultManager = {
    tenantId: 'tenant_1',
    agents: [
      {
        agentId: 'agent_1',
        tenantId: 'tenant_1',
        name: 'Sales agent',
        description: 'Handles sales',
        purpose: 'Qualify leads',
        archetypeId: 'sales_qualification',
        templateId: 'sales_qualification_v1',
        lifecycleStatus: 'draft',
        status: 'inactive',
        activeConfigId: null,
        readinessStatus: 'blocked',
        releaseReady: false,
        blockingItemCount: 2,
        detailRoute: '/tenants/tenant_1/agents/agent_1',
      },
    ],
    metadata: { page: 1, pageSize: 20, totalItems: 1, returnedItems: 1, ordering: 'name' },
    isLoading: false,
    errorMessage: null,
    loadAgents: vi.fn(),
    ...manager,
  } as unknown as AgentsListManager

  const defaultCatalog = {
    catalog: {
      archetypes: [],
      templates: [
        {
          templateId: 'sales_qualification_v1',
          archetypeId: 'sales_qualification',
          label: 'Sales qualification',
          purpose: 'Support sales',
          defaultAgentPurpose: 'Help buyers',
          defaultAgentDescription: 'Default description',
          defaultSetupGuidance: [],
          requiredKnowledgeModes: ['managed_source'],
          optionalKnowledgeModes: [],
          requiredCapabilityCategories: [],
          optionalCapabilityCategories: [],
          policyExpectations: [],
          supportedChannels: ['web_widget'],
          checklistRequirements: [],
          evaluationSmokeMarkers: [],
          meteringInterpretationMarkers: [],
        },
      ],
    },
    selectedTemplateId: 'sales_qualification_v1',
    selectedTemplate: null,
    isLoading: false,
    errorMessage: null,
    loadCatalog: vi.fn(),
    setSelectedTemplateId: vi.fn(),
    ...catalog,
  } as unknown as AgentTemplateCatalogManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AgentsListView manager={defaultManager} catalogManager={defaultCatalog} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return { manager: defaultManager, catalog: defaultCatalog }
}

describe('AgentsListView', () => {
  it('renders tenant agents and implemented tenant-scoped links', () => {
    renderView()

    expect(screen.getByText('Sales agent')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create agent' })).toHaveAttribute('href', '/tenants/tenant_1/agents/new')
    expect(screen.getByRole('link', { name: 'Sales agent' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1')
    expect(screen.queryByRole('link', { name: /Config/i })).not.toBeInTheDocument()
  })

  it('renders empty state without future-stage placeholders', () => {
    renderView({ agents: [], metadata: { page: 1, pageSize: 20, totalItems: 0, returnedItems: 0, ordering: 'name' } })

    expect(screen.getByText('No agents yet')).toBeInTheDocument()
    expect(screen.queryByText('Releases')).not.toBeInTheDocument()
    expect(screen.queryByText('Knowledge')).not.toBeInTheDocument()
  })

  it('localizes agent catalog labels and hides backend setup-stage wording in Russian', () => {
    renderView(
      { agents: [], metadata: { page: 1, pageSize: 20, totalItems: 0, returnedItems: 0, ordering: 'name' } },
      {
        selectedTemplate: {
          templateId: 'service_faq_v1',
          archetypeId: 'faq_service_information',
          label: 'Service FAQ v1',
          purpose: 'First smoke template for bounded FAQ and service-information flows.',
          defaultAgentPurpose: 'Help with FAQ',
          defaultAgentDescription: null,
          defaultSetupGuidance: [],
          requiredKnowledgeModes: ['faq_source_or_no_knowledge_marker'],
          optionalKnowledgeModes: [],
          requiredCapabilityCategories: [],
          optionalCapabilityCategories: [],
          policyExpectations: [],
          supportedChannels: ['public_widget'],
          checklistRequirements: [
            {
              itemId: 'knowledge',
              ownerArea: 'knowledge',
              blocking: true,
              requiredAction: 'Configure FAQ knowledge or explicit no-knowledge mode in Stage 22.2.',
              detail: 'Internal setup detail.',
              releaseReadinessMarker: 'knowledge',
            },
          ],
          evaluationSmokeMarkers: [],
          meteringInterpretationMarkers: [],
        },
      },
      'ru',
    )

    expect(screen.getByText('Назад к тенанту')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Создать агента' })).toHaveAttribute('href', '/tenants/tenant_1/agents/new')
    expect(screen.getByText('Агентов пока нет')).toBeInTheDocument()
    expect(screen.getAllByText('FAQ по услугам v1').length).toBeGreaterThan(0)
    expect(screen.getByText('Источник FAQ')).toBeInTheDocument()
    expect(screen.getByText('Публичный виджет')).toBeInTheDocument()
    expect(screen.getByText('Подключить базу знаний, подходящую для сценария агента.')).toBeInTheDocument()
    expect(screen.queryByText(/Stage 22\.2/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/explicit no-knowledge/i)).not.toBeInTheDocument()
  })
})
