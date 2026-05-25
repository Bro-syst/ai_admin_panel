import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { AgentCapabilityCatalogItem } from '@/modules/AgentCapabilities/api/agentCapabilitiesApi'
import type { AgentCapabilitiesManager } from '@/modules/AgentCapabilities/model/useAgentCapabilitiesManager'
import { CopyableValue, InfoGrid, ListBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

function translatedValue(t: (key: string) => string, namespace: string, value: string | null | undefined, emptyValue = t('agents.empty_value')) {
  if (!value) return emptyValue
  const key = `${namespace}.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

function translatedValues(t: (key: string) => string, namespace: string, values: string[] | null | undefined) {
  return (values ?? []).map((value) => translatedValue(t, namespace, value))
}

function translatedCapabilityLabel(t: (key: string) => string, capabilityId: string, fallback: string) {
  const key = `agent_capabilities.catalog_label.${capabilityId}`
  const translated = t(key)
  return translated === key ? fallback : translated
}

function isRecommendedSmokeCapability(item: AgentCapabilityCatalogItem | undefined) {
  if (!item) return false
  return (
    item.capabilityId === 'cap_search' ||
    item.capabilityId.includes('retrieval.fetch_grounding') ||
    item.downstreamExecutionKind === 'retrieval' ||
    item.sideEffectClass === 'read'
  )
}

function isHighRiskSmokeCapability(item: AgentCapabilityCatalogItem | undefined) {
  if (!item) return false
  return (
    item.riskClass === 'high' ||
    item.sideEffectClass === 'external_side_effect' ||
    item.sideEffectClass === 'execution_environment_effect' ||
    item.downstreamExecutionKind === 'integration' ||
    item.downstreamExecutionKind === 'execution_environment' ||
    item.downstreamExecutionKind === 'workflow' ||
    item.category === 'workflow_trigger' ||
    item.capabilityId.includes('human_handoff')
  )
}

function isExternalSideEffectCapability(item: AgentCapabilityCatalogItem | undefined) {
  if (!item) return false
  return (
    item.sideEffectClass === 'external_side_effect' ||
    item.sideEffectClass === 'execution_environment_effect' ||
    item.downstreamExecutionKind === 'integration' ||
    item.downstreamExecutionKind === 'execution_environment' ||
    item.downstreamExecutionKind === 'workflow' ||
    item.category === 'workflow_trigger' ||
    item.capabilityId.includes('human_handoff')
  )
}

function capabilityCardClass(item: AgentCapabilityCatalogItem, explicitNoExternalActions: boolean) {
  const dimmedByNoExternalActions = explicitNoExternalActions && isExternalSideEffectCapability(item)
  const tone = isRecommendedSmokeCapability(item)
    ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
    : isHighRiskSmokeCapability(item)
      ? 'border-amber-300 bg-amber-50/50 dark:border-amber-500/40 dark:bg-amber-500/10'
      : 'border-[var(--border)] bg-[var(--surface)]'

  return [
    'rounded-2xl border p-4 shadow-[var(--shadow-soft)] transition',
    tone,
    dimmedByNoExternalActions ? 'opacity-60 saturate-50' : '',
  ].join(' ')
}

function externalActionsSummaryValue(t: (key: string) => string, explicitNoExternalActions: boolean) {
  if (explicitNoExternalActions) return t('agent_capabilities.external_actions_blocked')

  return (
    <span className="grid gap-1">
      <span>{t('agent_capabilities.external_actions_allowed')}</span>
      <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        {t('agent_capabilities.first_smoke_block_recommended')}
      </span>
    </span>
  )
}

function CapabilityMutationEvidenceBlock({ manager }: { manager: AgentCapabilitiesManager }) {
  const { t } = useI18n()
  const result = manager.mutationResult

  if (!result) return null

  const enabledCount = manager.profile?.assignments.filter((assignment) => assignment.enabled).length ?? manager.form.assignments.filter((assignment) => assignment.enabled).length
  const noExternalActions = manager.profile?.explicitNoExternalActions ?? manager.form.explicitNoExternalActions
  const readiness = manager.profile?.readinessStatus ?? null
  const correlationOrRequest = result.correlationId ?? result.requestId ?? null

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
      <h3 className="font-bold">{t('agent_capabilities.evidence_title')}</h3>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.action')}</dt>
          <dd className="break-all font-semibold">{result.action || t('agents.empty_value')}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agent_capabilities.agent_id')}</dt>
          <dd className="break-all font-semibold"><CopyableValue value={manager.agentId} /></dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agent_capabilities.enabled_count')}</dt>
          <dd className="font-semibold">{enabledCount}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agent_capabilities.no_external_actions_flag')}</dt>
          <dd className="font-semibold">{noExternalActions ? t('agent_capabilities.external_actions_blocked') : t('agent_capabilities.external_actions_allowed')}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agents.readiness')}</dt>
          <dd className="font-semibold">{translatedValue(t, 'agent_capabilities.readiness_status', readiness)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.correlation_or_request')}</dt>
          <dd className="break-all font-semibold">
            {correlationOrRequest ? <CopyableValue value={correlationOrRequest} /> : t('mutation_result.not_returned')}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function AgentCapabilitiesView({ manager }: { manager: AgentCapabilitiesManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageCapabilities || manager.isMutating
  const mutationDisabled = disabled || !manager.isDirty
  const assignments = new Map(manager.profile?.assignments.map((assignment) => [assignment.capabilityId, assignment]) ?? [])
  const catalogItemsById = new Map(manager.catalog?.items.map((item) => [item.capabilityId, item]) ?? [])
  const showRecommendedPreview = manager.form.explicitNoExternalActions &&
    manager.form.assignments.some((assignment) => assignment.enabled && isRecommendedSmokeCapability(catalogItemsById.get(assignment.capabilityId))) &&
    !manager.form.assignments.some((assignment) => assignment.enabled && isExternalSideEffectCapability(catalogItemsById.get(assignment.capabilityId)))
  const recommendedSetApplied = showRecommendedPreview

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}/agents/${manager.agentId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agent_config.back_to_agent')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('agent_capabilities.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.agentDetail?.name ?? manager.agentId}</p>
        </div>
        <RefreshButton onClick={() => void manager.loadCapabilities()} />
      </div>

      {manager.notice ? (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{manager.notice}</span>
          <Link
            to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/policy`}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-emerald-300 bg-white/80 px-3 py-1.5 text-sm font-bold text-emerald-800 hover:bg-white dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-100"
          >
            {t('agent_capabilities.go_to_policy')}
          </Link>
        </div>
      ) : null}
      {manager.errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <CapabilityMutationEvidenceBlock manager={manager} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
            <p className="font-bold">{t('agent_capabilities.smoke_hint')}</p>
            <p className="mt-1">{t('agent_capabilities.safety_hint')}</p>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex items-center gap-2 rounded-xl border border-sky-200 bg-white/70 px-3 py-2 font-semibold text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-50">
                <input
                  type="checkbox"
                  checked={manager.form.explicitNoExternalActions}
                  disabled={disabled}
                  onChange={(event) => manager.setExplicitNoExternalActions(event.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                {t('agent_capabilities.explicit_no_external_actions')}
              </label>
              <button
                type="button"
                disabled={disabled}
                onClick={manager.applyRecommendedSmokeSet}
                className={[
                  'inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]',
                  recommendedSetApplied
                    ? 'border-sky-300 bg-white/80 text-sky-900 hover:bg-white dark:border-sky-500/40 dark:bg-sky-950/30 dark:text-sky-50'
                    : 'border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
                ].join(' ')}
              >
                {recommendedSetApplied ? t('agent_capabilities.recommended_smoke_applied') : t('agent_capabilities.apply_recommended_smoke')}
              </button>
            </div>
            {showRecommendedPreview ? (
              <div className="mt-3 rounded-xl border border-sky-200 bg-white/70 px-3 py-2 text-sm font-semibold text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-50">
                <p>{t('agent_capabilities.recommended_preview_enabled')}</p>
                <p className="mt-1">{t('agent_capabilities.recommended_preview_blocked')}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_capabilities.summary_title')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agent_capabilities.summary_subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {manager.profile?.readinessStatus ? (
                  <StatusBadge status={manager.profile.readinessStatus} label={translatedValue(t, 'agent_capabilities.readiness_status', manager.profile.readinessStatus)} />
                ) : null}
                <span title={!disabled && !manager.isDirty ? t('agent_capabilities.no_unsaved_changes') : undefined}>
                  <button type="button" disabled={mutationDisabled} onClick={() => confirmAction(t('agent_capabilities.confirm_update'), () => void manager.updateAssignments())} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                    {t('agent_capabilities.update')}
                  </button>
                </span>
              </div>
            </div>
            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: t('agent_capabilities.relation_to_template'), value: translatedValue(t, 'agent_capabilities.template_relation', manager.profile?.relationToTemplate ?? manager.catalog?.relationToTemplate) },
                  { label: t('agents.readiness'), value: translatedValue(t, 'agent_capabilities.readiness_status', manager.profile?.readinessStatus) },
                  { label: t('agent_capabilities.enabled_assignments'), value: manager.form.assignments.filter((assignment) => assignment.enabled).length },
                  { label: t('agent_capabilities.explicit_no_external_actions'), value: externalActionsSummaryValue(t, manager.form.explicitNoExternalActions) },
                ]}
              />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <ListBlock
                title={t('agent_capabilities.required_categories')}
                values={translatedValues(t, 'agent_capabilities.assignment_category', manager.catalog?.requiredCategories)}
                emptyLabel={t('agent_capabilities.required_categories_empty')}
              />
              <ListBlock title={t('agent_capabilities.optional_categories')} values={translatedValues(t, 'agent_capabilities.assignment_category', manager.catalog?.optionalCategories)} />
              <ListBlock title={t('agent_capabilities.issues')} values={translatedValues(t, 'agent_capabilities.issue', manager.profile?.issues)} />
            </div>
            {!manager.canManageCapabilities ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agent_capabilities.permission_readonly')}</p> : null}
          </section>

          <section className="grid gap-3 xl:grid-cols-2">
            {manager.catalog?.items.length ? manager.catalog.items.map((item) => {
              const assignment = assignments.get(item.capabilityId)
              const enabled = manager.form.assignments.find((candidate) => candidate.capabilityId === item.capabilityId)?.enabled ?? false
              const recommended = isRecommendedSmokeCapability(item)
              const highRiskForSmoke = isHighRiskSmokeCapability(item)
              const blockedByNoExternalActions = manager.form.explicitNoExternalActions && isExternalSideEffectCapability(item)
              return (
                <article key={item.capabilityId} className={capabilityCardClass(item, manager.form.explicitNoExternalActions)}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">{translatedCapabilityLabel(t, item.capabilityId, item.label)}</h3>
                      <p className="mt-1 break-all text-xs text-[var(--text-muted)]">{item.capabilityId} / {item.capabilityVersion}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {recommended ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100">
                            {t('agent_capabilities.recommended_badge')}
                          </span>
                        ) : null}
                        {highRiskForSmoke ? (
                          <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-100">
                            {t('agent_capabilities.do_not_enable_smoke_badge')}
                          </span>
                        ) : null}
                        {blockedByNoExternalActions ? (
                          <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:border-slate-500/40 dark:bg-slate-500/20 dark:text-slate-100">
                            {t('agent_capabilities.blocked_by_recommended_mode_badge')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                      <input
                        type="checkbox"
                        checked={enabled}
                        disabled={disabled || blockedByNoExternalActions}
                        title={blockedByNoExternalActions ? t('agent_capabilities.no_external_actions_warning') : undefined}
                        onChange={(event) => {
                          if (event.target.checked && highRiskForSmoke) {
                            confirmAction(t('agent_capabilities.confirm_high_risk_smoke'), () => manager.setCapabilityEnabled(item.capabilityId, true))
                            return
                          }
                          manager.setCapabilityEnabled(item.capabilityId, event.target.checked)
                        }}
                        className="h-4 w-4 rounded border-[var(--border)]"
                      />
                      {t('agent_capabilities.enabled')}
                    </label>
                  </div>
                  {blockedByNoExternalActions ? (
                    <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                      {t('agent_capabilities.no_external_actions_warning')}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={item.category} label={translatedValue(t, 'agent_capabilities.capability_category', item.category)} />
                    <StatusBadge status={item.riskClass} label={translatedValue(t, 'agent_capabilities.risk_class', item.riskClass)} />
                    <StatusBadge status={item.sideEffectClass} label={translatedValue(t, 'agent_capabilities.side_effect_class', item.sideEffectClass)} />
                    <StatusBadge status={item.policyRequirement} label={translatedValue(t, 'agent_capabilities.policy_requirement', item.policyRequirement)} />
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <ListBlock title={t('agent_capabilities.assignment_categories')} values={translatedValues(t, 'agent_capabilities.assignment_category', item.assignmentCategories)} />
                    <ListBlock title={t('agent_capabilities.explainability_tags')} values={translatedValues(t, 'agent_capabilities.explainability_tag', item.explainabilityTags)} />
                  </div>
                  <div className="mt-3">
                    <InfoGrid
                      items={[
                        { label: t('agent_capabilities.downstream_execution_kind'), value: translatedValue(t, 'agent_capabilities.downstream_execution_kind_value', item.downstreamExecutionKind) },
                        { label: t('agent_capabilities.invocation_semantics'), value: translatedValue(t, 'agent_capabilities.invocation_semantics_value', item.invocationSemantics) },
                        { label: t('agent_capabilities.metering_classification'), value: translatedValue(t, 'agent_capabilities.metering_classification_value', item.meteringClassification) },
                        { label: t('agent_capabilities.current_assignment'), value: assignment?.enabled ? t('common.yes') : t('common.no') },
                      ]}
                    />
                  </div>
                </article>
              )
            }) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('agent_capabilities.empty_catalog')}</div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
