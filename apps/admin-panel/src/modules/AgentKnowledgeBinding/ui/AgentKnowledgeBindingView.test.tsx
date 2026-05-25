import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { I18nContext, type Locale } from '@/core/i18n/I18nContext'
import { messages } from '@/core/i18n/messages'
import type { AgentKnowledgeBindingManager } from '@/modules/AgentKnowledgeBinding/model/useAgentKnowledgeBindingManager'
import { AgentKnowledgeBindingView } from '@/modules/AgentKnowledgeBinding/ui/AgentKnowledgeBindingView'

function renderView(manager: Partial<AgentKnowledgeBindingManager> = {}, locale: Locale = 'en') {
  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: { name: 'Sales agent', supportedMutationActions: ['knowledge.manage'] },
    portalStatus: {
      agentId: 'agent_1',
      relationToTemplate: 'required',
      readinessStatus: 'blocked',
      bindingMode: 'sources',
      sourceSetId: null,
      retrievalMode: 'grounded',
      requiredModes: ['sources'],
      optionalModes: [],
      issues: ['missing retrieval evidence'],
      sources: [{ sourceId: 'source_1', label: 'FAQ', sourceClass: 'faq', selected: true, retrievalModeAllowed: true }],
    },
    catalog: {
      relationToTemplate: 'required',
      requiredModes: ['sources'],
      optionalModes: [],
      sources: [{ sourceId: 'source_1', sourceVersion: 'v1', label: 'FAQ', sourceClass: 'faq', accessTier: 'tenant', storageClass: 'managed', allowedRetrievalModes: ['grounded'], explainabilityTags: [] }],
      sourceSets: [{ sourceSetId: 'set_1', label: 'Required pack', purposeMarker: 'source_pack.aml_kyc_domain_knowledge_v1', sourceIds: ['source_1'], sourceClassConstraints: ['faq'] }],
    },
    binding: {
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      bindingMode: 'sources',
      status: 'active',
      relationToTemplate: 'required',
      readinessStatus: 'blocked',
      requiredModes: [],
      optionalModes: [],
      sourceSetId: null,
      sourceIds: ['source_1'],
      sourceMarkers: ['source_pack.aml_kyc_domain_knowledge_v1'],
      sourceClasses: ['faq'],
      retrievalMode: 'grounded',
      issues: [],
    },
    bindingForm: { bindingMode: 'sources', sourceSetId: null, sourceIds: ['source_1'], retrievalMode: 'grounded' },
    mutationResult: null,
    canManageKnowledge: true,
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadBinding: vi.fn(),
    setBindingForm: vi.fn(),
    updateBinding: vi.fn(),
    disableBinding: vi.fn(),
    ...manager,
  } as unknown as AgentKnowledgeBindingManager

  render(
    <I18nContext.Provider value={{
      locale,
      setLocale: vi.fn(),
      t: (key) => messages[locale][key] ?? key,
    }}>
      <AgentKnowledgeBindingView manager={defaultManager} />
    </I18nContext.Provider>,
  )

  return defaultManager
}

describe('AgentKnowledgeBindingView', () => {
  it('renders only agent binding controls and backend status evidence', () => {
    renderView()

    expect(screen.getByText('Agent binding')).toBeInTheDocument()
    expect(screen.getByText('missing retrieval evidence')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update binding' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Create source' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry job' })).not.toBeInTheDocument()
  })

  it('confirms disable binding', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Disable binding' }))

    expect(confirmSpy).toHaveBeenCalledWith('Disable this agent knowledge binding?')
    expect(manager.disableBinding).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('disables binding mutations when backend action refs do not allow knowledge management', () => {
    renderView({ canManageKnowledge: false })

    expect(screen.getByRole('button', { name: 'Update binding' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Disable binding' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect knowledge but cannot change it.')).toBeInTheDocument()
  })

  it('limits retrieval mode choices to modes allowed by selected sources', () => {
    renderView({
      catalog: {
        relationToTemplate: 'required',
        requiredModes: ['sources'],
        optionalModes: [],
        sources: [
          {
            sourceId: 'source.faq.public_support_faq',
            sourceVersion: 'v1',
            label: 'FAQ',
            sourceClass: 'faq',
            accessTier: 'global',
            storageClass: 'structured',
            allowedRetrievalModes: ['keyword_grounded', 'structured_lookup'],
            explainabilityTags: [],
          },
          {
            sourceId: 'source.catalog.reference_product_catalog',
            sourceVersion: 'v1',
            label: 'Catalog',
            sourceClass: 'product_catalog',
            accessTier: 'global',
            storageClass: 'structured',
            allowedRetrievalModes: ['hybrid_curated', 'structured_lookup'],
            explainabilityTags: [],
          },
        ],
        sourceSets: [],
      },
      bindingForm: {
        bindingMode: 'sources',
        sourceSetId: null,
        sourceIds: ['source.faq.public_support_faq'],
        retrievalMode: 'hybrid_curated',
      },
    })

    expect(screen.getByLabelText('Retrieval mode')).toHaveValue('keyword_grounded')
    expect(screen.getByRole('option', { name: 'Keyword search with source grounding' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Hybrid search across curated sources' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'keyword_grounded' })).not.toBeInTheDocument()
  })

  it('localizes backend knowledge binding codes and known catalog labels in Russian', () => {
    renderView({
      portalStatus: {
        agentId: 'agent_1',
        relationToTemplate: 'required',
        readinessStatus: 'pending',
        bindingMode: 'sources',
        sourceSetId: null,
        retrievalMode: 'grounded',
        requiredModes: ['product_knowledge_source'],
        optionalModes: [],
        issues: [],
        sources: [],
      },
      catalog: {
        relationToTemplate: 'required',
        requiredModes: ['product_knowledge_source'],
        optionalModes: [],
        sources: [
          {
            sourceId: 'source.approved_internal_collection.tenant_ops_notes',
            sourceVersion: 'v1',
            label: 'Tenant operations notes',
            sourceClass: 'approved_internal_collection',
            accessTier: 'tenant',
            storageClass: 'managed',
            allowedRetrievalModes: ['hybrid_curated'],
            explainabilityTags: [],
          },
        ],
        sourceSets: [{
          sourceSetId: 'knowledge_set.public_grounding_default',
          label: 'Public grounding default',
          purposeMarker: 'public_grounding',
          sourceIds: ['source.approved_internal_collection.tenant_ops_notes'],
          sourceClassConstraints: [],
        }],
      },
      binding: null,
      bindingForm: {
        bindingMode: 'sources',
        sourceSetId: null,
        sourceIds: ['source.approved_internal_collection.tenant_ops_notes'],
        retrievalMode: 'hybrid_curated',
      },
    }, 'ru')

    expect(screen.getByText('Обязательна')).toBeInTheDocument()
    expect(screen.getAllByText('Ожидает настройки').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Выбранные источники').length).toBeGreaterThan(0)
    expect(screen.getByText('Операционные заметки тенанта')).toBeInTheDocument()
    expect(screen.getByText(/Утверждённая внутренняя коллекция/)).toBeInTheDocument()
    expect(screen.getByText('База знаний о продукте')).toBeInTheDocument()
    expect(screen.getByText('Доступно: 1 / Выбрано: 1')).toBeInTheDocument()
    expect(screen.getByText('Выбрано: Операционные заметки тенанта')).toBeInTheDocument()
    expect(screen.getByText('Не используется для выбранных источников')).toBeInTheDocument()
    expect(screen.getByText('Доступные режимы поиска зависят от выбранных источников.')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Гибридный поиск по проверенным источникам' })).toBeInTheDocument()
    expect(screen.getByText('Нет данных')).toBeInTheDocument()
    expect(screen.queryByText('required')).not.toBeInTheDocument()
    expect(screen.queryByText('pending')).not.toBeInTheDocument()
    expect(screen.queryByText('Tenant operations notes')).not.toBeInTheDocument()
    expect(screen.queryByText('hybrid_curated')).not.toBeInTheDocument()
    expect(screen.queryByText('Public grounding default')).not.toBeInTheDocument()
    expect(screen.queryByText('None')).not.toBeInTheDocument()
  })

  it('localizes source-set options and summary labels in Russian', () => {
    renderView({
      portalStatus: {
        agentId: 'agent_1',
        relationToTemplate: 'required',
        readinessStatus: 'ready',
        bindingMode: 'source_set',
        sourceSetId: 'knowledge_set.public_grounding_default',
        retrievalMode: 'structured_lookup',
        requiredModes: ['source_set'],
        optionalModes: [],
        issues: [],
        sources: [],
      },
      catalog: {
        relationToTemplate: 'required',
        requiredModes: ['source_set'],
        optionalModes: [],
        sources: [
          {
            sourceId: 'source.faq.public_support_faq',
            sourceVersion: 'v1',
            label: 'Public support FAQ',
            sourceClass: 'faq',
            accessTier: 'global',
            storageClass: 'structured',
            allowedRetrievalModes: ['keyword_grounded', 'structured_lookup'],
            explainabilityTags: [],
          },
        ],
        sourceSets: [{
          sourceSetId: 'knowledge_set.public_grounding_default',
          label: 'Public grounding default',
          purposeMarker: 'public_grounding',
          sourceIds: ['source.faq.public_support_faq'],
          sourceClassConstraints: [],
        }],
      },
      bindingForm: {
        bindingMode: 'source_set',
        sourceSetId: 'knowledge_set.public_grounding_default',
        sourceIds: [],
        retrievalMode: 'structured_lookup',
      },
    }, 'ru')

    expect(screen.getByLabelText('Набор источников')).toHaveValue('knowledge_set.public_grounding_default')
    expect(screen.getByRole('option', { name: 'Публичная база по умолчанию' })).toBeInTheDocument()
    expect(screen.getAllByText('Публичная база по умолчанию').length).toBeGreaterThan(0)
    expect(screen.getByRole('option', { name: 'Структурированный поиск по каталогу' })).toBeInTheDocument()
    expect(screen.queryByText('Public grounding default')).not.toBeInTheDocument()
    expect(screen.queryByText('structured_lookup')).not.toBeInTheDocument()
  })

  it('explains when the reference product catalog covers the required product knowledge mode', () => {
    renderView({
      portalStatus: {
        agentId: 'agent_1',
        relationToTemplate: 'required',
        readinessStatus: 'ready',
        bindingMode: 'sources',
        sourceSetId: null,
        retrievalMode: 'hybrid_curated',
        requiredModes: ['product_knowledge_source'],
        optionalModes: [],
        issues: [],
        sources: [],
      },
      catalog: {
        relationToTemplate: 'required',
        requiredModes: ['product_knowledge_source'],
        optionalModes: [],
        sources: [
          {
            sourceId: 'source.catalog.reference_product_catalog',
            sourceVersion: 'v1',
            label: 'Reference product catalog',
            sourceClass: 'catalog',
            accessTier: 'global',
            storageClass: 'structured',
            allowedRetrievalModes: ['hybrid_curated'],
            explainabilityTags: [],
          },
        ],
        sourceSets: [],
      },
      bindingForm: {
        bindingMode: 'sources',
        sourceSetId: null,
        sourceIds: ['source.catalog.reference_product_catalog'],
        retrievalMode: 'hybrid_curated',
      },
    }, 'ru')

    expect(screen.getByText('Справочный каталог продуктов')).toBeInTheDocument()
    expect(screen.getByText('Этот источник закрывает обязательный режим "База знаний о продукте".')).toBeInTheDocument()
  })

  it('shows the next-step banner after a ready binding and hides missing optional mutation fields', () => {
    renderView({
      notice: 'Agent knowledge binding was updated.',
      portalStatus: {
        agentId: 'agent_1',
        relationToTemplate: 'required',
        readinessStatus: 'ready',
        bindingMode: 'sources',
        sourceSetId: null,
        retrievalMode: 'grounded',
        requiredModes: [],
        optionalModes: [],
        issues: [],
        sources: [{ sourceId: 'source_1', label: 'FAQ', sourceClass: 'faq', selected: true, retrievalModeAllowed: true }],
      },
      binding: {
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        bindingMode: 'sources',
        status: 'active',
        relationToTemplate: 'required',
        readinessStatus: 'ready',
        requiredModes: [],
        optionalModes: [],
        sourceSetId: null,
        sourceIds: ['source_1'],
        sourceMarkers: [],
        sourceClasses: ['faq'],
        retrievalMode: 'grounded',
        issues: [],
      },
      mutationResult: {
        action: 'upsert_knowledge_binding',
        resourceType: 'agent_knowledge_binding',
        resourceId: 'agent_1',
        actorId: null,
        actorType: null,
        tenantId: 'tenant_1',
        correlationId: 'corr_1',
        mutationTimestamp: '2026-05-21T10:17:45.645090Z',
        changedStateSummary: {},
      },
    })

    expect(screen.getByText('Knowledge is ready.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Next step: Configure capabilities' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/capabilities')
    expect(screen.queryByText('Status / result')).not.toBeInTheDocument()
    expect(screen.queryByText('Version')).not.toBeInTheDocument()
    expect(screen.getByText('corr_1')).toBeInTheDocument()
  })
})
