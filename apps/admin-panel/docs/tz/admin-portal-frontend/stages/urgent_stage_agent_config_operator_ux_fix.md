# Urgent Stage: Agent Config Operator UX And Evidence Fix

Status: `implemented-accepted-and-docs-synced`

## Goal

Make the already implemented tenant -> agent -> Agent Config setup flow usable
for non-developer operators by replacing raw enum-like inputs with controlled
controls, keeping mutation evidence visible/copyable, and making the next setup
step clear without adding backend-owned business logic to the frontend.

## Dependencies

- Umbrella Admin Portal frontend TZ is accepted.
- Stages 01-13 are implemented, accepted and docs-synced.
- Stage 07 Agent Config is the primary owning stage and remains the baseline
  for route/module/API ownership.
- Source urgent TZ:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md`.
- Prompt 03 must accept this urgent stage before runtime implementation starts.

## Exact Scope

- Keep existing routes and modules.
- Improve `/tenants/:tenantId/agents/:agentId/config`.
- Improve the existing Agent Detail guidance where it helps the operator
  continue setup after config activation.
- Add typed frontend metadata for current controlled AgentConfig option values.
- Replace raw text inputs with controlled controls for enum-like AgentConfig
  fields:
  - `preferred_model_family`;
  - `latency_sensitivity`;
  - `quality_sensitivity`;
  - `cost_sensitivity`;
  - `preferred_capabilities`;
  - `profile_name`;
  - `response_mode`;
  - `config_schema_version`;
  - `safety_labels`;
  - `tone`;
  - `language`;
  - `fallback_allowed`;
  - `handoff_enabled`;
  - `integration_enabled`.
- Preserve free-text controls for:
  - `agent_label`;
  - `persona_summary`;
  - `goals`;
  - `rules`;
  - `restrictions`;
  - `handoff_conditions`;
  - `compatibility_notes`.
- Fix the AgentConfig create-version flow if needed so `Create version` uses
  `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`, not the
  draft endpoint.
- Improve mutation evidence display for AgentConfig critical actions:
  - create version;
  - validate;
  - activate;
  - rollback.
- Mutation evidence must show safe backend-returned values where present:
  - action;
  - resource type;
  - resource id;
  - result/status;
  - config version, when applicable;
  - correlation id or request id;
  - timestamp.
- Reuse/improve the existing mutation result display for tenant and agent
  mutation evidence where current responses already expose safe result fields.
- Add copy buttons for safe operator ids/evidence values where they are shown:
  - tenant id;
  - agent id;
  - config id;
  - version id;
  - correlation id or request id;
  - widget key only if an existing widget screen already shows it.

## Out Of Scope

- Backend form metadata API.
- BFF form metadata bridge.
- New backend validation rules.
- Frontend-local readiness calculation.
- Frontend-local release gate calculation.
- Frontend-local policy, model-routing or safety engine.
- Customer launch/sign-off flow.
- Public widget runtime behavior changes.
- New routes or global navigation entries.
- Broad shared package extraction.

## Routes / Navigation Impact

- No new route.
- `/tenants/:tenantId/agents/:agentId/config` remains the Agent Config route.
- `/tenants/:tenantId/agents/:agentId` may show improved setup guidance and
  active config evidence.
- No new global AppShell navigation item.
- No future-stage placeholder route/action may be introduced.

## Module / File Ownership

- `src/modules/AgentConfig/api` owns endpoint calls and DTO/result mapping.
- `src/modules/AgentConfig/model` owns draft state, controlled option metadata
  or metadata handoff, selected config state, validation state, mutation
  orchestration and create-version endpoint choice.
- `src/modules/AgentConfig/ui` owns form controls, chips/select rendering,
  validation guidance and evidence presentation.
- `src/modules/Agents/model` and `src/modules/Agents/ui` may be touched only
  for Agent Detail guidance and safe active-config/setup next-step display.
- `src/shared/ui` may be touched only for reusable copy/evidence primitives
  with real immediate reuse across AgentConfig, Agents and/or Tenants.
- App docs under `apps/admin-panel/docs` must be synced after acceptance.

## Reuse Rules And Responsibility Boundaries

- Reuse existing `MutationResultBlock`, `InfoGrid`, `StatusBadge` or evolve
  them narrowly instead of creating duplicate evidence components.
- Option metadata is a temporary frontend UI adapter, not a business-rule
  source of truth.
- Labels may be localized; submitted payload values must stay canonical backend
  values.
- Unknown backend values that are not in the minimum option set must remain
  visible and preserved where possible.
- Pages/UI do not call `apiClient`, `fetch` or `axios` directly for admin
  backend traffic.
- Backend validation remains the authority for config validity.
- Backend read models remain the authority for setup blockers and next-step
  state.
- Do not calculate readiness, release, policy, billing, metering, model routing
  or launch state locally.
- Do not render access tokens, refresh tokens, secrets, provider keys,
  internal prompts or backend-internal payloads in evidence blocks.

## Controlled Option Values

Minimum values for this urgent pass:

- `tone`: `clear_and_helpful`, `formal`, `concise`;
- `language`: `ru`, `en`;
- `preferred_model_family`: empty/default, `general`;
- `latency_sensitivity`: empty/default, `low`, `medium`, `high`;
- `quality_sensitivity`: empty/default, `low`, `medium`, `high`;
- `cost_sensitivity`: empty/default, `low`, `medium`, `high`;
- `preferred_capabilities`: `chat`, `reasoning`;
- `profile_name`: empty/default, `default`;
- `response_mode`: empty/default, `balanced`;
- `config_schema_version`: `1.0`;
- `safety_labels`: `baseline`, `public_widget`, `controlled_smoke`.

Implementation note:
- If existing backend data returns a schema version such as `v1`, show it as a
  custom/current value and preserve it unless the operator explicitly changes
  the controlled default. Do not silently rewrite it to `1.0`.

## API Contracts

Existing contracts only:

- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/active`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/config-drafts`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/validate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/activate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/rollback`
- existing tenant and agent mutation endpoints only where their current
  responses already expose safe mutation evidence.

If a response does not return correlation/request evidence:
- show a safe fallback such as `Correlation id was not returned by backend`;
- show request id if the current API/error/result object exposes it;
- do not generate a fake correlation id.

If a response does not return status/result/version evidence:
- show an explicit safe fallback such as `Not returned by backend`;
- do not infer success state, readiness or activation state locally from a
  missing evidence field.

## UI/UX States

- Controlled selects/chips show known options and preserve unknown current
  backend values.
- Multi-select/chips support add/remove without turning canonical values into
  localized labels.
- Schema version is read-only/default controlled UI, not a free text field.
- Validation result explains that `Validate` checks the selected version and
  does not activate it.
- After successful validation, the next operator action is clearly `Activate`.
- After activation, active config id/version and activation evidence are
  visible and copyable.
- Ambiguous safe-default wording is replaced. Prefer:
  `Safe defaults were not applied by backend validation` when the backend
  returns a false/empty safe-default marker.
- Agent Detail shows active config id and actionable blockers/next setup step
  from backend/read-model state where available.
- Agent Detail must not push lifecycle activation when knowledge, policy,
  channel or release blockers remain.

## Access / Security Requirements

- Existing protected tenant/agent-scoped routes remain protected.
- Existing permission/action-ref gating remains authoritative for enabled
  mutations.
- Mutations stay CSRF-protected through the existing API layer.
- Evidence blocks must not display secrets, tokens, provider keys or internal
  prompts.
- Public widget smoke identity remains separate from Admin Portal cookies.

## Tests And Verification Commands

Required tests:

- `Response mode` is rendered as select, not free text.
- `Profile name` is rendered as controlled select/default, not free text.
- `Schema version` is rendered as read-only/default `1.0`.
- `Preferred model family` is rendered as select/default.
- `Preferred capabilities` is rendered as multi-select/chips.
- `Safety labels` is rendered as multi-select/chips.
- Selected UI labels submit canonical backend values.
- Unknown existing backend values are not silently dropped.
- `Create version` submits through the expected `createConfigVersion` flow.
- `Validate` result is visible and does not imply activation.
- `Activate` result shows active config evidence where backend returns it.
- Mutation evidence shows resource id, result/status, version when returned,
  timestamp and correlation/request fallback states.
- Copy buttons work for ids/correlation/request values.
- Evidence blocks do not render access tokens, refresh tokens, secrets,
  provider keys or internal prompts.

Verification commands:

- `npm run test:admin -- AgentConfig AgentDetailView TenantDetailView`
- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- boundary searches for direct `apiClient`, `fetch(` and `axios` calls outside
  accepted API owners.

## Docs Impact

After acceptance, update:

- `apps/admin-panel/docs/implemented-functionality-checklist.md`;
- `apps/admin-panel/docs/overview.md`;
- `apps/admin-panel/docs/architecture.md`;
- `apps/admin-panel/docs/development-guide.md`;
- `apps/admin-panel/docs/recipes.md`;
- `apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md`;
- `apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`.

Update root docs only if workspace/package/multi-app rules change.

## Acceptance Criteria

- Operators can configure and activate the first sales/support agent without
  typing raw enum-like values manually.
- Critical mutation evidence remains visible and copyable after actions.
- Agent Config explains validate vs activate and shows active config evidence
  after activation.
- Agent Detail makes the next setup step understandable from backend/read-model
  state.
- Backend validation remains the source of truth.
- No frontend-local readiness, release, policy, billing, metering or
  model-routing logic is added.

## Future-Stage Forbidden Actions

- Do not reopen the accepted 13-stage umbrella scope as `stage_14`.
- Do not add customer portal scope.
- Do not add backend endpoint implementation.
- Do not add public widget runtime behavior changes.
- Do not add local readiness/release/policy/model-routing calculations.
- Do not introduce broad shared package extraction.

## Expected Gate Result

- Prompt 03 verifies this urgent stage against accepted umbrella scope, Stage
  07 ownership and architecture boundaries.
- Prompt 04 may implement this urgent stage only after prompt 03 accepts it.
- Prompt 05 must review the urgent implementation before docs sync.
- Prompt 06 must sync app docs and mark the urgent stage accepted or blocked.
