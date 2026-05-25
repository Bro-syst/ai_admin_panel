import { useI18n } from '@/core/i18n/useI18n'
import {
  resolveAgentKnowledgeRetrievalModes,
  type AgentKnowledgeBindingManager,
  type AgentKnowledgeBindingForm,
} from '@/modules/AgentKnowledgeBinding/model/useAgentKnowledgeBindingManager'
import { InfoGrid, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'

type TFunction = (key: string) => string

type SelectOption = {
  value: string
  label: string
}

function translateCode(t: TFunction, key: string, fallback: string) {
  const translated = t(key)
  return translated === key ? fallback : translated
}

function formatKnowledgeCode(t: TFunction, group: string, value: string | null | undefined, emptyValue = t('agents.empty_value')) {
  if (!value) return emptyValue
  return translateCode(t, `knowledge.${group}.${value}`, value)
}

function formatRequiredMode(t: TFunction, value: string) {
  const templateMode = t(`agents.templates.knowledge_mode.${value}`)
  if (templateMode !== `agents.templates.knowledge_mode.${value}`) return templateMode
  return formatKnowledgeCode(t, 'required_mode', value, value)
}

function formatSourceLabel(t: TFunction, source: { sourceId: string; label: string }) {
  return translateCode(t, `knowledge.source_label.${source.sourceId}`, source.label)
}

function formatSourceSetLabel(t: TFunction, sourceSet: { sourceSetId: string; purposeMarker: string; label: string }) {
  const byId = translateCode(t, `knowledge.source_set_label.${sourceSet.sourceSetId}`, sourceSet.label)
  if (byId !== sourceSet.label) return byId
  return translateCode(t, `knowledge.source_set_label.${sourceSet.purposeMarker}`, sourceSet.label)
}

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, value]) => result.split(`{${key}}`).join(String(value)), template)
}

function SelectField({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function ListBlock({
  title,
  values,
  formatValue,
}: {
  title: string
  values: string[]
  formatValue?: (value: string) => string
}) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm text-[var(--text-muted)]">
          {values.map((value) => <li key={value}>{formatValue ? formatValue(value) : value}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('common.none')}</p>
      )}
    </div>
  )
}

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

function withNormalizedRetrievalMode(form: AgentKnowledgeBindingForm, catalog: AgentKnowledgeBindingManager['catalog']) {
  const modes = resolveAgentKnowledgeRetrievalModes(catalog, form)
  return {
    ...form,
    retrievalMode: form.retrievalMode && modes.includes(form.retrievalMode)
      ? form.retrievalMode
      : modes[0] ?? null,
  }
}

export function AgentKnowledgeBindingView({ manager }: { manager: AgentKnowledgeBindingManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageKnowledge || manager.isMutating
  const form = manager.bindingForm
  const catalog = manager.catalog
  const bindingModeOptions = ['no_knowledge', 'source_set', 'sources'].map((value) => ({
    value,
    label: formatKnowledgeCode(t, 'binding_mode_value', value, value),
  }))
  const sourceSetOptions = [
    { value: '', label: t('agents.empty_value') },
    ...(catalog?.sourceSets.map((sourceSet) => ({
      value: sourceSet.sourceSetId,
      label: formatSourceSetLabel(t, sourceSet),
    })) ?? []),
  ]
  const retrievalModeValues = resolveAgentKnowledgeRetrievalModes(catalog, form)
  const retrievalModeOptions = retrievalModeValues.length > 0
    ? retrievalModeValues.map((value) => ({
      value,
      label: formatKnowledgeCode(t, 'retrieval_mode_value', value, value),
    }))
    : [{ value: '', label: t('agents.empty_value') }]
  const selectedRetrievalMode = form.retrievalMode && retrievalModeValues.includes(form.retrievalMode)
    ? form.retrievalMode
    : retrievalModeValues[0] ?? ''
  const summaryBindingMode = manager.binding?.bindingMode ?? manager.portalStatus?.bindingMode ?? form.bindingMode
  const selectedSourceIds = manager.notice && manager.binding?.sourceIds.length ? manager.binding.sourceIds : form.sourceIds
  const selectedSources = selectedSourceIds
    .map((sourceId) => catalog?.sources.find((source) => source.sourceId === sourceId))
    .filter((source): source is NonNullable<typeof catalog>['sources'][number] => Boolean(source))
  const selectedSourceNames = selectedSources.map((source) => formatSourceLabel(t, source))
  const hasReferenceProductCatalog = selectedSourceIds.includes('source.catalog.reference_product_catalog')
  const sourceCountSummary = interpolate(t('knowledge.source_count_summary'), {
    available: catalog?.sources.length ?? manager.portalStatus?.sources.length ?? 0,
    selected: selectedSourceIds.length,
  })
  const sourceSetSummary = summaryBindingMode === 'sources'
    ? t('knowledge.source_set_not_used_for_selected_sources')
    : manager.portalStatus?.sourceSetId
      ? formatSourceSetLabel(
        t,
        catalog?.sourceSets.find((sourceSet) => sourceSet.sourceSetId === manager.portalStatus?.sourceSetId) ?? {
          sourceSetId: manager.portalStatus.sourceSetId,
          purposeMarker: manager.portalStatus.sourceSetId,
          label: manager.portalStatus.sourceSetId,
        },
      )
      : t('agents.empty_value')
  const isKnowledgeReady = (manager.binding?.readinessStatus ?? manager.portalStatus?.readinessStatus) === 'ready'

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.binding_title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {formatKnowledgeCode(t, 'readiness_status', manager.binding?.readinessStatus ?? manager.portalStatus?.readinessStatus)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {manager.binding?.status ? <StatusBadge status={manager.binding.status} /> : null}
          <button type="button" disabled={disabled} onClick={() => void manager.updateBinding()} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.update_binding')}
          </button>
          <button type="button" disabled={disabled} onClick={() => confirmAction(t('knowledge.confirm_disable_binding'), () => void manager.disableBinding())} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.disable_binding')}
          </button>
        </div>
      </div>

      {manager.notice ? <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{manager.notice}</div> : null}
      {manager.notice && isKnowledgeReady ? (
        <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
          {t('knowledge.next_step_ready')}{' '}
          <a className="font-bold text-[var(--primary)] hover:underline" href={`/tenants/${manager.tenantId}/agents/${manager.agentId}/capabilities`}>
            {t('knowledge.next_step_capabilities')}
          </a>
        </div>
      ) : null}
      {manager.errorMessage ? <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="mt-3 text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <div className="mt-3">
        <MutationResultBlock title={t('knowledge.mutation_result')} result={manager.mutationResult} hideMissingOptionalFields />
      </div>

      {manager.isLoading ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <>
          <div className="mt-4">
            <InfoGrid
              items={[
                { label: t('knowledge.relation_to_template'), value: formatKnowledgeCode(t, 'template_relation', manager.portalStatus?.relationToTemplate) },
                { label: t('agents.readiness'), value: formatKnowledgeCode(t, 'readiness_status', manager.portalStatus?.readinessStatus) },
                { label: t('knowledge.binding_mode'), value: formatKnowledgeCode(t, 'binding_mode_value', manager.portalStatus?.bindingMode) },
                { label: t('knowledge.source_set'), value: sourceSetSummary },
                { label: t('knowledge.retrieval_mode'), value: formatKnowledgeCode(t, 'retrieval_mode_value', manager.portalStatus?.retrievalMode) },
                { label: t('knowledge.sources_title'), value: sourceCountSummary },
                { label: t('knowledge.selected_sources'), value: selectedSourceNames.length > 0 ? interpolate(t('knowledge.selected_sources_summary'), { sources: selectedSourceNames.join(', ') }) : t('agents.empty_value') },
              ]}
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <SelectField
              label={t('knowledge.binding_mode')}
              value={form.bindingMode}
              disabled={disabled}
              options={bindingModeOptions}
              onChange={(value) => manager.setBindingForm((current) => withNormalizedRetrievalMode({
                ...current,
                bindingMode: value,
                sourceSetId: value === 'source_set' ? current.sourceSetId : null,
                sourceIds: value === 'sources' ? current.sourceIds : [],
                retrievalMode: value === 'no_knowledge' ? null : current.retrievalMode,
              }, catalog))}
            />
            {form.bindingMode === 'source_set' ? (
              <SelectField
                label={t('knowledge.source_set')}
                value={form.sourceSetId ?? ''}
                disabled={disabled}
                options={sourceSetOptions}
                onChange={(value) => manager.setBindingForm((current) => withNormalizedRetrievalMode({
                  ...current,
                  sourceSetId: value || null,
                }, catalog))}
              />
            ) : null}
            <SelectField
              label={t('knowledge.retrieval_mode')}
              value={selectedRetrievalMode}
              disabled={disabled || form.bindingMode === 'no_knowledge' || retrievalModeValues.length === 0}
              options={retrievalModeOptions}
              onChange={(value) => manager.setBindingForm((current) => ({ ...current, retrievalMode: value || null }))}
            />
            <p className="text-xs text-[var(--text-muted)] lg:col-span-3">{t('knowledge.retrieval_mode_hint')}</p>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {catalog?.sources.map((source) => (
              <label key={source.sourceId} className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={form.sourceIds.includes(source.sourceId)}
                  disabled={disabled || form.bindingMode !== 'sources'}
                  onChange={(event) => manager.setBindingForm((current) => withNormalizedRetrievalMode({
                    ...current,
                    sourceIds: event.target.checked
                      ? [...current.sourceIds, source.sourceId]
                      : current.sourceIds.filter((sourceId) => sourceId !== source.sourceId),
                  }, catalog))}
                  className="mt-1 h-4 w-4 rounded border-[var(--border)]"
                />
                <span>
                  <span className="block font-semibold">{formatSourceLabel(t, source)}</span>
                  <span className="block break-all text-xs text-[var(--text-muted)]">
                    {t('knowledge.source_id')}: {source.sourceId} · {t('knowledge.source_class_label')}: {formatKnowledgeCode(t, 'source_class', source.sourceClass)}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {hasReferenceProductCatalog ? (
            <p className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
              {t('knowledge.reference_product_catalog_covers_required_mode')}
            </p>
          ) : null}

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <ListBlock title={t('knowledge.required_modes')} values={manager.portalStatus?.requiredModes ?? []} formatValue={(value) => formatRequiredMode(t, value)} />
            <ListBlock title={t('knowledge.issues')} values={manager.portalStatus?.issues ?? []} />
          </div>
          {!manager.canManageKnowledge ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('knowledge.permission_readonly')}</p> : null}
        </>
      )}
    </section>
  )
}
