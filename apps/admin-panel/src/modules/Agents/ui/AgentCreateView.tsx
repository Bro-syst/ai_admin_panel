import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { AgentCreateManager } from '@/modules/Agents/model/useAgentCreateManager'
import { AgentTemplateCatalogPanel } from '@/modules/AgentTemplates'
import type { AgentTemplateCatalogManager } from '@/modules/AgentTemplates'
import { MutationResultBlock } from '@/shared/ui/EntityInfo'

export function AgentCreateView({
  manager,
  catalogManager,
}: {
  manager: AgentCreateManager
  catalogManager: AgentTemplateCatalogManager
}) {
  const { t } = useI18n()
  const submitDisabledReason = !manager.canMutate
    ? t('agents.permission_readonly')
    : !catalogManager.selectedTemplate
      ? t('agents.create.template_error')
      : !manager.form.name.trim()
        ? t('agents.create.name_error')
        : null

  return (
    <div className="space-y-4">
      <div>
        <Link to={`/tenants/${manager.tenantId}/agents`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
          {t('agents.back_to_agents')}
        </Link>
        <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('agents.create.title')}</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agents.create.subtitle')}</p>
      </div>

      <MutationResultBlock title={t('agents.mutation_result')} result={manager.mutationResult} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AgentTemplateCatalogPanel manager={catalogManager} />

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.create.form_title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{catalogManager.selectedTemplate?.label ?? t('agents.create.no_template')}</p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.name')}</span>
              <input
                value={manager.form.name}
                onChange={(event) => manager.updateForm({ name: event.target.value })}
                disabled={!manager.canMutate || manager.isSubmitting}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.purpose')}</span>
              <textarea
                value={manager.form.purpose}
                onChange={(event) => manager.updateForm({ purpose: event.target.value })}
                disabled={!manager.canMutate || manager.isSubmitting}
                rows={3}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.description')}</span>
              <textarea
                value={manager.form.description}
                onChange={(event) => manager.updateForm({ description: event.target.value })}
                disabled={!manager.canMutate || manager.isSubmitting}
                rows={3}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
              />
            </label>
          </div>

          {manager.formError ? <p className="mt-3 text-sm font-medium text-rose-600">{manager.formError}</p> : null}
          {!manager.canMutate ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agents.permission_readonly')}</p> : null}

          <button
            type="button"
            onClick={() => void manager.createAgent()}
            disabled={!manager.canSubmit}
            aria-describedby={submitDisabledReason ? 'agent-create-submit-disabled-reason' : undefined}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
          >
            {manager.isSubmitting ? t('agents.create.submitting') : t('agents.create.submit')}
          </button>
          {!manager.canSubmit && submitDisabledReason ? (
            <p id="agent-create-submit-disabled-reason" className="mt-2 text-sm text-[var(--text-muted)]">
              {submitDisabledReason}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}
