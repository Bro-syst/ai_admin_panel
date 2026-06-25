import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { useAgentCreateManager } from '@/modules/Agents/model/useAgentCreateManager'
import type { AgentTemplate } from '@/modules/AgentTemplates'

let authAdminUser: { role: string; permissions?: string[] } | null = {
  role: 'platform_admin',
  permissions: [],
}

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    adminUser: authAdminUser,
  }),
}))

const routerFutureConfig = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
} as const

function template(overrides: Partial<AgentTemplate>): AgentTemplate {
  return {
    templateId: 'service_faq_v1',
    archetypeId: 'faq_service_information',
    label: 'FAQ по услугам v1',
    purpose: 'FAQ по услугам',
    defaultAgentPurpose: 'FAQ default purpose',
    defaultAgentDescription: 'FAQ default description',
    defaultSetupGuidance: [],
    requiredKnowledgeModes: [],
    optionalKnowledgeModes: [],
    requiredCapabilityCategories: [],
    optionalCapabilityCategories: [],
    policyExpectations: [],
    supportedChannels: [],
    checklistRequirements: [],
    evaluationSmokeMarkers: [],
    meteringInterpretationMarkers: [],
    ...overrides,
  }
}

function Harness({ selectedTemplate }: { selectedTemplate: AgentTemplate }) {
  const manager = useAgentCreateManager('tenant_1', selectedTemplate)

  return (
    <form>
      <label>
        Purpose
        <textarea
          aria-label="Purpose"
          value={manager.form.purpose}
          onChange={(event) => manager.updateForm({ purpose: event.target.value })}
        />
      </label>
      <label>
        Description
        <textarea
          aria-label="Description"
          value={manager.form.description}
          onChange={(event) => manager.updateForm({ description: event.target.value })}
        />
      </label>
    </form>
  )
}

function renderHarness(selectedTemplate: AgentTemplate) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/new']} future={routerFutureConfig}>
        <Harness selectedTemplate={selectedTemplate} />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('useAgentCreateManager', () => {
  beforeEach(() => {
    authAdminUser = {
      role: 'platform_admin',
      permissions: [],
    }
  })

  it('replaces untouched template defaults when the selected template changes', async () => {
    const faqTemplate = template({
      templateId: 'service_faq_v1',
      defaultAgentPurpose: 'FAQ default purpose',
      defaultAgentDescription: 'FAQ default description',
    })
    const salesTemplate = template({
      templateId: 'sales_qualification_v1',
      archetypeId: 'sales_qualification',
      defaultAgentPurpose: 'Sales default purpose',
      defaultAgentDescription: 'Sales default description',
    })

    const { rerender } = renderHarness(faqTemplate)

    await waitFor(() => {
      expect(screen.getByLabelText('Purpose')).toHaveValue('FAQ default purpose')
      expect(screen.getByLabelText('Description')).toHaveValue('FAQ default description')
    })

    rerender(
      <I18nProvider>
        <MemoryRouter initialEntries={['/tenants/tenant_1/agents/new']} future={routerFutureConfig}>
          <Harness selectedTemplate={salesTemplate} />
        </MemoryRouter>
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Purpose')).toHaveValue('Sales default purpose')
      expect(screen.getByLabelText('Description')).toHaveValue('Sales default description')
    })
  })

  it('keeps operator edits when the selected template changes', async () => {
    const faqTemplate = template({
      templateId: 'service_faq_v1',
      defaultAgentPurpose: 'FAQ default purpose',
      defaultAgentDescription: 'FAQ default description',
    })
    const salesTemplate = template({
      templateId: 'sales_qualification_v1',
      archetypeId: 'sales_qualification',
      defaultAgentPurpose: 'Sales default purpose',
      defaultAgentDescription: 'Sales default description',
    })

    const { rerender } = renderHarness(faqTemplate)

    await waitFor(() => {
      expect(screen.getByLabelText('Purpose')).toHaveValue('FAQ default purpose')
      expect(screen.getByLabelText('Description')).toHaveValue('FAQ default description')
    })

    fireEvent.change(screen.getByLabelText('Purpose'), { target: { value: 'Custom purpose' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Custom description' } })

    rerender(
      <I18nProvider>
        <MemoryRouter initialEntries={['/tenants/tenant_1/agents/new']} future={routerFutureConfig}>
          <Harness selectedTemplate={salesTemplate} />
        </MemoryRouter>
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Purpose')).toHaveValue('Custom purpose')
      expect(screen.getByLabelText('Description')).toHaveValue('Custom description')
    })
  })
})
