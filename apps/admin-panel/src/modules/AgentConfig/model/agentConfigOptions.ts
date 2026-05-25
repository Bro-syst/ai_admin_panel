export type AgentConfigOption = {
  value: string
  labelKey: string
}

export const agentConfigOptionMetadata = {
  tone: [
    { value: 'clear_and_helpful', labelKey: 'agent_config.tone_value.clear_and_helpful' },
    { value: 'formal', labelKey: 'agent_config.tone_value.formal' },
    { value: 'concise', labelKey: 'agent_config.tone_value.concise' },
  ],
  language: [
    { value: 'ru', labelKey: 'agent_config.language_value.ru' },
    { value: 'en', labelKey: 'agent_config.language_value.en' },
  ],
  sensitivity: [
    { value: 'low', labelKey: 'agent_config.sensitivity_value.low' },
    { value: 'medium', labelKey: 'agent_config.sensitivity_value.medium' },
    { value: 'high', labelKey: 'agent_config.sensitivity_value.high' },
  ],
  modelFamily: [
    { value: 'general', labelKey: 'agent_config.model_family_value.general' },
  ],
  preferredCapabilities: [
    { value: 'chat', labelKey: 'agent_config.capability_value.chat' },
    { value: 'reasoning', labelKey: 'agent_config.capability_value.reasoning' },
  ],
  profileName: [
    { value: 'default', labelKey: 'agent_config.profile_value.default' },
  ],
  responseMode: [
    { value: 'balanced', labelKey: 'agent_config.response_mode_value.balanced' },
  ],
  schemaVersion: [
    { value: '1.0', labelKey: 'agent_config.schema_version_value.1_0' },
  ],
  safetyLabels: [
    { value: 'baseline', labelKey: 'agent_config.safety_label_value.baseline' },
    { value: 'public_widget', labelKey: 'agent_config.safety_label_value.public_widget' },
    { value: 'controlled_smoke', labelKey: 'agent_config.safety_label_value.controlled_smoke' },
  ],
} satisfies Record<string, AgentConfigOption[]>

export function mergeCurrentOption(options: AgentConfigOption[], value: string | null | undefined): AgentConfigOption[] {
  if (!value || options.some((option) => option.value === value)) return options
  return [...options, { value, labelKey: value }]
}

export function mergeCurrentOptions(options: AgentConfigOption[], values: string[]): AgentConfigOption[] {
  const knownValues = new Set(options.map((option) => option.value))
  const customOptions = values
    .filter((value) => value && !knownValues.has(value))
    .map((value) => ({ value, labelKey: value }))

  return [...options, ...customOptions]
}
