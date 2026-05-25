import { useI18n } from '@/core/i18n/useI18n'
import type { AgentTemplate, AgentTemplateChecklistRequirement } from '@/modules/AgentTemplates/api/agentTemplatesApi'
import type { AgentTemplateCatalogManager } from '@/modules/AgentTemplates/model/useAgentTemplateCatalog'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function translatedValue(t: (key: string) => string, namespace: string, value: string) {
  const key = `${namespace}.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

function translatedTemplateLabel(t: (key: string) => string, template: AgentTemplate) {
  const byTemplateId = t(`agents.templates.template_label.${template.templateId}`)
  if (byTemplateId !== `agents.templates.template_label.${template.templateId}`) return byTemplateId

  return translatedValue(t, 'agents.templates.archetype', template.archetypeId)
}

function translatedTemplatePurpose(t: (key: string) => string, template: AgentTemplate) {
  const byTemplateId = t(`agents.templates.template_purpose.${template.templateId}`)
  if (byTemplateId !== `agents.templates.template_purpose.${template.templateId}`) return byTemplateId

  const byArchetype = t(`agents.templates.archetype_purpose.${template.archetypeId}`)
  if (byArchetype !== `agents.templates.archetype_purpose.${template.archetypeId}`) return byArchetype

  return template.purpose
}

function translatedRequirementAction(t: (key: string) => string, requirement: AgentTemplateChecklistRequirement) {
  const byItemId = t(`agents.templates.requirement.${requirement.itemId}`)
  if (byItemId !== `agents.templates.requirement.${requirement.itemId}`) return byItemId

  const byOwnerArea = t(`agents.templates.requirement_area_action.${requirement.ownerArea}`)
  if (byOwnerArea !== `agents.templates.requirement_area_action.${requirement.ownerArea}`) return byOwnerArea

  return t('agents.templates.requirement.default')
}

function TokenList({ values, namespace }: { values: string[]; namespace: string }) {
  const { t } = useI18n()

  if (values.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span key={value} className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
          {translatedValue(t, namespace, value)}
        </span>
      ))}
    </div>
  )
}

export function AgentTemplateCatalogPanel({ manager }: { manager: AgentTemplateCatalogManager }) {
  const { t } = useI18n()
  const selected = manager.selectedTemplate

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.templates.title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agents.templates.subtitle')}</p>
        </div>
        <RefreshButton className="h-9 w-9" onClick={() => void manager.loadCatalog()} />
      </div>

      {manager.errorMessage ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {manager.errorMessage}
        </div>
      ) : null}

      {manager.isLoading ? (
        <div className="mt-4 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : manager.catalog && manager.catalog.templates.length === 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-[var(--text)]">{t('agents.templates.empty_title')}</h4>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agents.templates.empty_subtitle')}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="grid gap-2">
            {manager.catalog?.templates.map((template) => (
              <button
                type="button"
                key={template.templateId}
                onClick={() => manager.setSelectedTemplateId(template.templateId)}
                className={[
                  'rounded-xl border px-3 py-2 text-left text-sm transition',
                  template.templateId === manager.selectedTemplateId
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--text)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
                ].join(' ')}
              >
                <span className="block font-bold">{translatedTemplateLabel(t, template)}</span>
                <span className="mt-1 block truncate text-xs">{translatedValue(t, 'agents.templates.archetype', template.archetypeId)}</span>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text)]">{translatedTemplateLabel(t, selected)}</h4>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{translatedTemplatePurpose(t, selected)}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.templates.channels')}</div>
                  <div className="mt-2"><TokenList values={selected.supportedChannels} namespace="agents.templates.channel" /></div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.templates.knowledge')}</div>
                  <div className="mt-2"><TokenList values={selected.requiredKnowledgeModes} namespace="agents.templates.knowledge_mode" /></div>
                </div>
              </div>
              {selected.checklistRequirements.length > 0 ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.templates.requirements')}</div>
                  <ul className="mt-2 grid gap-2">
                    {selected.checklistRequirements.slice(0, 4).map((requirement) => (
                      <li key={requirement.itemId} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--text)]">{translatedValue(t, 'agents.templates.owner_area', requirement.ownerArea)}</span>
                        <span className="block">{translatedRequirementAction(t, requirement)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
