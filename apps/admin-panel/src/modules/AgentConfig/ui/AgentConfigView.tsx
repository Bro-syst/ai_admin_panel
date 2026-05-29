import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { createEmptyActionBinding, type AgentConfigManager } from '@/modules/AgentConfig/model/useAgentConfigManager'
import type { AgentIntegrationActionBinding } from '@/modules/AgentConfig/api/agentConfigApi'
import type { FormMetadata, FormMetadataField, FormMetadataOption } from '@/modules/FormMetadata'
import { CopyableValue, InfoGrid, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

const MISSING_TRANSLATION_EVENT = 'ai-admin:i18n-missing-key'

function linesToArray(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function arrayToLines(value: string[]) {
  return value.join('\n')
}

function Field({
  label,
  help,
  value,
  disabled,
  placeholder,
  onChange,
}: {
  label: string
  help?: string | null
  value: string
  disabled: boolean
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <input
        aria-label={label}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      />
      {help ? <span className="text-xs normal-case tracking-normal text-[var(--text-muted)]">{help}</span> : null}
    </label>
  )
}

type SelectOption = {
  value: string
  label: string
}

function SelectField({
  label,
  help,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string
  help?: string | null
  value: string
  disabled: boolean
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <span className="text-xs normal-case tracking-normal text-[var(--text-muted)]">{help}</span> : null}
    </label>
  )
}

function TextAreaField({
  label,
  help,
  value,
  disabled,
  rows = 3,
  onChange,
}: {
  label: string
  help?: string | null
  value: string
  disabled: boolean
  rows?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <textarea
        aria-label={label}
        value={value}
        rows={rows}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      />
      {help ? <span className="text-xs normal-case tracking-normal text-[var(--text-muted)]">{help}</span> : null}
    </label>
  )
}

function translatedValue(t: (key: string) => string, namespace: string, value: string | null | undefined) {
  if (!value) return t('agents.empty_value')

  const key = `${namespace}.${value}`
  const label = t(key)

  return label === key ? value : label
}

function translateListValues(t: (key: string) => string, namespace: string, values: string[]) {
  return values.map((value) => translatedValue(t, namespace, value))
}

function signalMissingTranslation(key: string, fallback: string) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
  window.dispatchEvent(new CustomEvent(MISSING_TRANSLATION_EVENT, { detail: { key, fallback } }))
}

function translateMetadataKey(t: (key: string) => string, key: string | null | undefined, fallback: string) {
  if (!key) return fallback
  const label = t(key)
  if (label === key) {
    signalMissingTranslation(key, fallback)
    return fallback
  }
  return label
}

function metadataField(metadata: FormMetadata | null, payloadPath: string): FormMetadataField | null {
  return metadata?.fields.find((field) => field.payloadPath === payloadPath) ?? null
}

function fieldLabel(t: (key: string) => string, field: FormMetadataField | null, fallbackKey: string) {
  return translateMetadataKey(t, field?.localizationKey, t(fallbackKey))
}

function fieldHelp(t: (key: string) => string, field: FormMetadataField | null) {
  return field?.helpKey ? translateMetadataKey(t, field.helpKey, field.helpKey) : null
}

function optionValue(option: FormMetadataOption) {
  return typeof option.value === 'string' ? option.value : String(option.value)
}

function optionLabel(t: (key: string) => string, option: FormMetadataOption) {
  const value = optionValue(option)
  return translateMetadataKey(t, option.localizationKey, value)
}

function metadataOptions(t: (key: string) => string, field: FormMetadataField | null): SelectOption[] {
  return (field?.options ?? [])
    .filter((option) => typeof option.value === 'string')
    .map((option) => ({
      value: optionValue(option),
      label: optionLabel(t, option),
    }))
}

function optionsWithCurrent(options: SelectOption[], value: string) {
  if (!value || options.some((option) => option.value === value)) return options

  return [...options, { value, label: value }]
}

function optionsWithCurrentValues(options: SelectOption[], values: string[]) {
  const knownValues = new Set(options.map((option) => option.value))
  const customOptions = values
    .filter((value) => value && !knownValues.has(value))
    .map((value) => ({ value, label: value }))

  return [...options, ...customOptions]
}

function toSelectOptions(t: (key: string) => string, field: FormMetadataField | null, currentValue: string | null | undefined, includeEmpty = true) {
  const mappedOptions = optionsWithCurrent(metadataOptions(t, field), currentValue ?? '')

  return includeEmpty ? [{ value: '', label: t('agents.empty_value') }, ...mappedOptions] : mappedOptions
}

function updateStringList(values: string[], value: string, checked: boolean) {
  if (checked) {
    return values.includes(value) ? values : [...values, value]
  }

  return values.filter((item) => item !== value)
}

function configStatusLabel(t: (key: string) => string, status: string) {
  const statusLabel = translatedValue(t, 'agents.status', status)
  if (statusLabel !== status) return statusLabel

  return translatedValue(t, 'agents.lifecycle_status', status)
}

function ToggleField({
  label,
  help,
  checked,
  disabled,
  onChange,
}: {
  label: string
  help?: string | null
  checked: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="grid gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)]">
      <span className="flex items-center gap-2">
        <input
          aria-label={label}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        {label}
      </span>
      {help ? <span className="text-xs font-normal text-[var(--text-muted)]">{help}</span> : null}
    </label>
  )
}

function MultiSelectField({
  label,
  help,
  values,
  disabled,
  options,
  onChange,
}: {
  label: string
  help?: string | null
  values: string[]
  disabled: boolean
  options: SelectOption[]
  onChange: (values: string[]) => void
}) {
  const { t } = useI18n()
  const mergedOptions = optionsWithCurrentValues(options, values)

  return (
    <fieldset className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</legend>
      {help ? <p className="text-xs text-[var(--text-muted)]">{help}</p> : null}
      <div className="flex flex-wrap gap-2">
        {mergedOptions.map((option) => (
          <label
            key={option.value}
            className={[
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold',
              values.includes(option.value)
                ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)]',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              disabled={disabled}
              onChange={(event) => onChange(updateStringList(values, option.value, event.target.checked))}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)]">{t('agent_config.option_metadata_note')}</p>
    </fieldset>
  )
}

function ValidationResult({ manager }: { manager: AgentConfigManager }) {
  const { t } = useI18n()
  const validation = manager.validationState?.result
  if (!validation) return null

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_config.validation_result')}</h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={validation.validationStatus} label={translatedValue(t, 'agents.validation_status', validation.validationStatus)} />
          <StatusBadge status={validation.compatibilityStatus} label={translatedValue(t, 'agents.compatibility_status', validation.compatibilityStatus)} />
        </div>
      </div>
      <div className="mt-3">
        <InfoGrid
          items={[
            { label: t('agents.processing_path'), value: translatedValue(t, 'agents.processing_path_value', validation.processingPath) },
            {
              label: t('agents.safe_defaults'),
              value: validation.safeDefaultsApplied ? t('common.yes') : t('agent_config.safe_defaults_not_applied'),
            },
            { label: t('agent_config.normalized'), value: validation.normalized ? t('common.yes') : t('common.no') },
            { label: t('agent_config.fallback_eligible'), value: validation.fallbackEligible ? t('common.yes') : t('common.no') },
            { label: t('agent_config.provenance'), value: validation.provenanceMarker || t('agents.empty_value') },
          ]}
        />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <ListBlock title={t('agents.issues')} values={translateListValues(t, 'agents.issue', validation.issues)} />
        <ListBlock title={t('agent_config.compatibility_notes')} values={validation.compatibilityNotes} />
      </div>
    </section>
  )
}

function ListBlock({ title, values }: { title: string; values: string[] }) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm text-[var(--text-muted)]">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('agents.empty_value')}</p>
      )}
    </div>
  )
}

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

export function AgentConfigView({ manager }: { manager: AgentConfigManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageConfig || manager.isMutating
  const draft = manager.draftPayload
  const metadata = manager.formMetadata
  const agentLabelField = metadataField(metadata, 'identity.agent_label')
  const personaField = metadataField(metadata, 'identity.persona_summary')
  const toneField = metadataField(metadata, 'tone_and_language.tone')
  const languageField = metadataField(metadata, 'tone_and_language.language')
  const handoffEnabledField = metadataField(metadata, 'handoff_policy.handoff_enabled')
  const handoffConditionsField = metadataField(metadata, 'handoff_policy.handoff_conditions')
  const integrationEnabledField = metadataField(metadata, 'integration_policy.integration_enabled')
  const modelFamilyField = metadataField(metadata, 'model_preference.preferred_model_family')
  const latencyField = metadataField(metadata, 'model_preference.latency_sensitivity')
  const qualityField = metadataField(metadata, 'model_preference.quality_sensitivity')
  const costField = metadataField(metadata, 'model_preference.cost_sensitivity')
  const capabilitiesField = metadataField(metadata, 'model_selection_hints.preferred_capabilities')
  const fallbackAllowedField = metadataField(metadata, 'model_selection_hints.fallback_allowed')
  const profileField = metadataField(metadata, 'execution_profile_hints.profile_name')
  const responseModeField = metadataField(metadata, 'execution_profile_hints.response_mode')
  const schemaVersionField = metadataField(metadata, 'compatibility_and_safety.config_schema_version')
  const safetyLabelsField = metadataField(metadata, 'compatibility_and_safety.safety_labels')
  const compatibilityNotesField = metadataField(metadata, 'compatibility_and_safety.compatibility_notes')
  const toneOptions = toSelectOptions(t, toneField, draft.toneAndLanguage.tone, false)
  const languageOptions = toSelectOptions(t, languageField, draft.toneAndLanguage.language, false)
  const modelFamilyOptions = toSelectOptions(t, modelFamilyField, draft.modelPreference.preferredModelFamily, true)
  const latencyOptions = toSelectOptions(t, latencyField, draft.modelPreference.latencySensitivity, true)
  const qualityOptions = toSelectOptions(t, qualityField, draft.modelPreference.qualitySensitivity, true)
  const costOptions = toSelectOptions(t, costField, draft.modelPreference.costSensitivity, true)
  const profileOptions = toSelectOptions(t, profileField, draft.executionProfileHints.profileName, true)
  const responseModeOptions = toSelectOptions(t, responseModeField, draft.executionProfileHints.responseMode, true)
  const schemaVersionOptions = toSelectOptions(t, schemaVersionField, draft.compatibilityAndSafety.configSchemaVersion, false)
  const capabilityOptions = metadataOptions(t, capabilitiesField)
  const safetyLabelOptions = metadataOptions(t, safetyLabelsField)

  const updateBinding = (index: number, patch: Partial<AgentIntegrationActionBinding>) => {
    manager.updateDraftPayload((current) => ({
      ...current,
      integrationPolicy: {
        ...current.integrationPolicy,
        actionBindings: current.integrationPolicy.actionBindings.map((binding, bindingIndex) =>
          bindingIndex === index ? { ...binding, ...patch } : binding,
        ),
      },
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}/agents/${manager.agentId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agent_config.back_to_agent')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('agent_config.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.agentDetail?.name ?? manager.agentId}</p>
        </div>
        <RefreshButton onClick={() => void manager.loadConfig()} />
      </div>

      {manager.notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {manager.notice}
        </div>
      ) : null}
      {manager.errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {manager.errorMessage}
        </div>
      ) : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <MutationResultBlock title={t('agent_config.mutation_result')} result={manager.mutationResult} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
          {t('common.loading')}
        </div>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_config.active_title')}</h3>
              {manager.activeConfig ? (
                <div className="mt-3">
                  <InfoGrid
                    items={[
                      { label: t('agent_config.version'), value: manager.activeConfig.version },
                      { label: t('common.status'), value: <StatusBadge status={manager.activeConfig.status} label={configStatusLabel(t, manager.activeConfig.status)} /> },
                      { label: t('agents.active_config'), value: <CopyableValue value={manager.activeConfig.id} /> },
                      { label: t('agent_config.activated_at'), value: manager.activeConfig.activatedAt ?? t('agents.empty_value') },
                    ]}
                  />
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{t('agent_config.no_active_config')}</p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_config.version_history')}</h3>
              <div className="mt-3 grid gap-2">
                {manager.versions.length > 0 ? manager.versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => void manager.selectConfig(version.id)}
                    className={[
                      'rounded-xl border px-3 py-2 text-left text-sm hover:bg-[var(--surface-muted)]',
                      manager.selectedConfig?.id === version.id ? 'border-[var(--primary)] bg-[var(--surface-muted)]' : 'border-[var(--border)]',
                    ].join(' ')}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[var(--text)]">v{version.version}</span>
                      <StatusBadge status={version.status} label={configStatusLabel(t, version.status)} />
                    </span>
                    <span className="mt-1 block break-all text-xs text-[var(--text-muted)]">{version.id}</span>
                  </button>
                )) : <p className="text-sm text-[var(--text-muted)]">{t('agent_config.no_versions')}</p>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_config.selected_title')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {manager.selectedConfig ? `v${manager.selectedConfig.version} / ${manager.selectedConfig.id}` : t('agent_config.no_selected_config')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void manager.validateSelected()}
                  disabled={disabled || !manager.selectedConfig}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agent_config.validate')}
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(t('agent_config.confirm_activate'), () => void manager.activateSelected())}
                  disabled={disabled || !manager.selectedConfig || !manager.canActivateSelected}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agent_config.activate')}
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(`${t('agent_config.confirm_rollback')} v${manager.selectedConfig?.version ?? ''}`, () => void manager.rollbackSelected())}
                  disabled={disabled || !manager.selectedConfig || manager.selectedConfig.status === 'active'}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agent_config.rollback')}
                </button>
              </div>
            </div>
            {manager.selectedConfig && !manager.canActivateSelected ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agent_config.validation.validate_before_activate')}</p>
            ) : null}
            {manager.canActivateSelected ? (
              <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-200">{t('agent_config.validation.activate_next_step')}</p>
            ) : (
              <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agent_config.validation.validate_explainer')}</p>
            )}
          </section>

          <ValidationResult manager={manager} />

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_config.draft_title')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agent_config.draft_subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => manager.resetDraftFromSelected()}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
                >
                  {t('agent_config.reset_from_selected')}
                </button>
                <button
                  type="button"
                  onClick={() => void manager.createDraft()}
                  disabled={disabled}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agent_config.create_draft')}
                </button>
              </div>
            </div>

            {!manager.canManageConfig ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agent_config.permission_readonly')}</p> : null}

            <div className="mt-4 grid gap-4">
              <div className="grid gap-3 lg:grid-cols-2">
                <Field
                  label={fieldLabel(t, agentLabelField, 'agent_config.identity.agent_label')}
                  help={fieldHelp(t, agentLabelField)}
                  value={draft.identity.agentLabel}
                  disabled={disabled}
                  onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, identity: { ...current.identity, agentLabel: value } }))}
                />
                <Field
                  label={fieldLabel(t, personaField, 'agent_config.identity.persona_summary')}
                  help={fieldHelp(t, personaField)}
                  value={draft.identity.personaSummary ?? ''}
                  disabled={disabled}
                  onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, identity: { ...current.identity, personaSummary: value } }))}
                />
                <SelectField
                  label={fieldLabel(t, toneField, 'agent_config.tone')}
                  help={fieldHelp(t, toneField)}
                  value={draft.toneAndLanguage.tone}
                  disabled={disabled}
                  options={toneOptions}
                  onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, toneAndLanguage: { ...current.toneAndLanguage, tone: value } }))}
                />
                <SelectField
                  label={fieldLabel(t, languageField, 'agent_config.language')}
                  help={fieldHelp(t, languageField)}
                  value={draft.toneAndLanguage.language}
                  disabled={disabled}
                  options={languageOptions}
                  onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, toneAndLanguage: { ...current.toneAndLanguage, language: value } }))}
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <TextAreaField label={t('agent_config.goals')} value={arrayToLines(draft.goals)} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, goals: linesToArray(value) }))} />
                <TextAreaField label={t('agent_config.rules')} value={arrayToLines(draft.rules)} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, rules: linesToArray(value) }))} />
                <TextAreaField label={t('agent_config.restrictions')} value={arrayToLines(draft.restrictions)} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, restrictions: linesToArray(value) }))} />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <ToggleField label={fieldLabel(t, handoffEnabledField, 'agent_config.handoff_enabled')} help={fieldHelp(t, handoffEnabledField)} checked={draft.handoffPolicy.handoffEnabled} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, handoffPolicy: { ...current.handoffPolicy, handoffEnabled: value } }))} />
                  <TextAreaField label={fieldLabel(t, handoffConditionsField, 'agent_config.handoff_conditions')} help={fieldHelp(t, handoffConditionsField)} value={arrayToLines(draft.handoffPolicy.handoffConditions)} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, handoffPolicy: { ...current.handoffPolicy, handoffConditions: linesToArray(value) } }))} />
                </div>
                <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <ToggleField label={fieldLabel(t, integrationEnabledField, 'agent_config.integration_enabled')} help={fieldHelp(t, integrationEnabledField)} checked={draft.integrationPolicy.integrationEnabled} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, integrationPolicy: { ...current.integrationPolicy, integrationEnabled: value } }))} />
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => manager.updateDraftPayload((current) => ({
                      ...current,
                      integrationPolicy: {
                        ...current.integrationPolicy,
                        actionBindings: [...current.integrationPolicy.actionBindings, createEmptyActionBinding()],
                      },
                    }))}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                  >
                    {t('agent_config.add_action_binding')}
                  </button>
                </div>
              </div>

              {draft.integrationPolicy.actionBindings.map((binding, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-[var(--text)]">{t('agent_config.action_binding')} {index + 1}</h4>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => manager.updateDraftPayload((current) => ({
                        ...current,
                        integrationPolicy: {
                          ...current.integrationPolicy,
                          actionBindings: current.integrationPolicy.actionBindings.filter((_, bindingIndex) => bindingIndex !== index),
                        },
                      }))}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Field label={t('agent_config.action_class')} value={binding.actionClass} disabled={disabled} onChange={(value) => updateBinding(index, { actionClass: value })} />
                    <Field label={t('agent_config.connector_key')} value={binding.connectorKey} disabled={disabled} onChange={(value) => updateBinding(index, { connectorKey: value })} />
                    <Field label={t('agent_config.operation_key')} value={binding.operationKey} disabled={disabled} onChange={(value) => updateBinding(index, { operationKey: value })} />
                    <Field label={t('agent_config.interface_type')} value={binding.interfaceType} disabled={disabled} onChange={(value) => updateBinding(index, { interfaceType: value })} />
                    <Field label={t('agent_config.side_effect_mode')} value={binding.sideEffectMode} disabled={disabled} onChange={(value) => updateBinding(index, { sideEffectMode: value })} />
                    <Field label={t('agent_config.reference_scope')} value={binding.referenceScope} disabled={disabled} onChange={(value) => updateBinding(index, { referenceScope: value })} />
                    <Field label={t('agent_config.reference_key')} value={binding.referenceKey} disabled={disabled} onChange={(value) => updateBinding(index, { referenceKey: value })} />
                    <Field label={t('agent_config.endpoint_url')} value={binding.endpointUrl} disabled={disabled} onChange={(value) => updateBinding(index, { endpointUrl: value })} />
                    <Field label={t('agent_config.timeout_class')} value={binding.timeoutClass ?? ''} disabled={disabled} onChange={(value) => updateBinding(index, { timeoutClass: value })} />
                    <Field label={t('agent_config.retry_policy_class')} value={binding.retryPolicyClass ?? ''} disabled={disabled} onChange={(value) => updateBinding(index, { retryPolicyClass: value })} />
                    <Field label={t('agent_config.compensation_mode')} value={binding.compensationMode ?? ''} disabled={disabled} onChange={(value) => updateBinding(index, { compensationMode: value })} />
                  </div>
                </div>
              ))}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SelectField label={fieldLabel(t, modelFamilyField, 'agent_config.preferred_model_family')} help={fieldHelp(t, modelFamilyField)} value={draft.modelPreference.preferredModelFamily ?? ''} disabled={disabled} options={modelFamilyOptions} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, modelPreference: { ...current.modelPreference, preferredModelFamily: value || null } }))} />
                <SelectField label={fieldLabel(t, latencyField, 'agent_config.latency_sensitivity')} help={fieldHelp(t, latencyField)} value={draft.modelPreference.latencySensitivity ?? ''} disabled={disabled} options={latencyOptions} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, modelPreference: { ...current.modelPreference, latencySensitivity: value || null } }))} />
                <SelectField label={fieldLabel(t, qualityField, 'agent_config.quality_sensitivity')} help={fieldHelp(t, qualityField)} value={draft.modelPreference.qualitySensitivity ?? ''} disabled={disabled} options={qualityOptions} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, modelPreference: { ...current.modelPreference, qualitySensitivity: value || null } }))} />
                <SelectField label={fieldLabel(t, costField, 'agent_config.cost_sensitivity')} help={fieldHelp(t, costField)} value={draft.modelPreference.costSensitivity ?? ''} disabled={disabled} options={costOptions} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, modelPreference: { ...current.modelPreference, costSensitivity: value || null } }))} />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <MultiSelectField label={fieldLabel(t, capabilitiesField, 'agent_config.preferred_capabilities')} help={fieldHelp(t, capabilitiesField)} values={draft.modelSelectionHints.preferredCapabilities} disabled={disabled} options={capabilityOptions} onChange={(values) => manager.updateDraftPayload((current) => ({ ...current, modelSelectionHints: { ...current.modelSelectionHints, preferredCapabilities: values } }))} />
                  <ToggleField label={fieldLabel(t, fallbackAllowedField, 'agent_config.fallback_allowed')} help={fieldHelp(t, fallbackAllowedField)} checked={draft.modelSelectionHints.fallbackAllowed} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, modelSelectionHints: { ...current.modelSelectionHints, fallbackAllowed: value } }))} />
                </div>
                <div className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <SelectField label={fieldLabel(t, profileField, 'agent_config.profile_name')} help={fieldHelp(t, profileField)} value={draft.executionProfileHints.profileName ?? ''} disabled={disabled} options={profileOptions} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, executionProfileHints: { ...current.executionProfileHints, profileName: value || null } }))} />
                  <SelectField label={fieldLabel(t, responseModeField, 'agent_config.response_mode')} help={fieldHelp(t, responseModeField)} value={draft.executionProfileHints.responseMode ?? ''} disabled={disabled} options={responseModeOptions} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, executionProfileHints: { ...current.executionProfileHints, responseMode: value || null } }))} />
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <SelectField label={fieldLabel(t, schemaVersionField, 'agent_config.schema_version')} help={fieldHelp(t, schemaVersionField)} value={draft.compatibilityAndSafety.configSchemaVersion} disabled={schemaVersionField?.readonly ?? true} options={schemaVersionOptions} onChange={() => undefined} />
                <MultiSelectField label={fieldLabel(t, safetyLabelsField, 'agent_config.safety_labels')} help={fieldHelp(t, safetyLabelsField)} values={draft.compatibilityAndSafety.safetyLabels} disabled={disabled} options={safetyLabelOptions} onChange={(values) => manager.updateDraftPayload((current) => ({ ...current, compatibilityAndSafety: { ...current.compatibilityAndSafety, safetyLabels: values } }))} />
                <TextAreaField label={fieldLabel(t, compatibilityNotesField, 'agent_config.compatibility_notes')} help={fieldHelp(t, compatibilityNotesField)} value={arrayToLines(draft.compatibilityAndSafety.compatibilityNotes)} disabled={disabled} onChange={(value) => manager.updateDraftPayload((current) => ({ ...current, compatibilityAndSafety: { ...current.compatibilityAndSafety, compatibilityNotes: linesToArray(value) } }))} />
              </div>

              <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-end">
                <p className="text-sm text-[var(--text-muted)] sm:mr-auto">{t('agent_config.create_version_hint')}</p>
                <button
                  type="button"
                  onClick={() => confirmAction(t('agent_config.confirm_create_version'), () => void manager.createVersion())}
                  disabled={disabled}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agent_config.create_version')}
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
