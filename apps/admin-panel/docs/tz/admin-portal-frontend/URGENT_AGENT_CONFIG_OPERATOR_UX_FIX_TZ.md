# Urgent TZ - Agent Config Operator UX And Evidence Fix

Status: `implemented-and-docs-synced`

Target app:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`

Backend/API mode:
- use existing `/api/admin/v1` contracts;
- do not add backend business logic in frontend;
- if an API response does not return correlation/request evidence, show a safe
  fallback state instead of inventing values.

## 1. Why This Fix Is Needed

The Admin Portal already allows an operator to create a tenant, create an agent,
create an AgentConfig version, validate it and activate it.

Current UX problem:
- some backend-controlled values are still typed manually as raw strings;
- this makes the setup fragile for non-developer operators;
- mutation evidence such as correlation id is easy to lose after the success
  banner disappears or the operator navigates away;
- the operator cannot confidently continue the first agent smoke without
  external instructions.

Goal:
- make the current Admin Portal usable for first-agent setup without asking the
  operator to guess technical values;
- keep all readiness, validation, policy, release and runtime decisions on the
  backend;
- preserve the current implemented portal structure and routes.

## 2. Required Frontend Changes

### 2.1 Agent Config form controls

On the Agent Config page, replace free text inputs with controlled controls for
fields that have a known set of values.

Change these fields:

- `Preferred model family`: use select.
- `Latency sensitivity`: keep/use select.
- `Quality sensitivity`: keep/use select.
- `Cost sensitivity`: keep/use select.
- `Preferred capabilities`: use multi-select or checkbox chips.
- `Profile name`: use select/default control.
- `Response mode`: use select.
- `Schema version`: use read-only/default control.
- `Safety labels`: use multi-select or checkbox chips.
- `Tone`: keep/use select.
- `Language`: keep/use select.
- `Fallback allowed`: keep/use checkbox/toggle.
- `Handoff enabled`: keep/use checkbox/toggle.
- `Integration enabled`: keep/use checkbox/toggle.

Keep these fields as free text:

- `Agent label`;
- `Persona summary`;
- `Goals`;
- `Rules`;
- `Restrictions`;
- `Handoff conditions`;
- `Compatibility notes`.

Minimum option values for the current frontend pass:

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

Important:
- UI may show Russian labels, but payload must send canonical backend values.
- Do not send localized labels to backend.
- Do not silently drop an existing backend value that is not in the minimum
  option list. Show it as a technical/custom current value and preserve it when
  possible.

### 2.2 Centralized frontend metadata

Create a small typed frontend metadata module for current controlled
AgentConfig options.

Requirements:
- option values must not be scattered as literals across page components;
- labels/help text may live in frontend i18n dictionaries;
- metadata must be easy to replace later with backend/BFF form metadata;
- metadata is a temporary UI adapter, not a business-rule source of truth.

Suggested ownership:
- `src/modules/AgentConfig/model` or `src/modules/AgentConfig/config` owns the
  typed option metadata;
- `src/modules/AgentConfig/ui` only renders controls from that metadata.

### 2.3 Mutation result/evidence block

Add a reusable operator-facing block for the last mutation result.

It should display, when returned by backend:

- action;
- resource type;
- resource id;
- status/result;
- version, if applicable;
- correlation id or request id;
- timestamp.

Add copy buttons for:

- tenant id;
- agent id;
- config id;
- version id;
- widget key, if shown on widget screens;
- correlation id or request id.

Apply this first to:

- AgentConfig `create version`;
- AgentConfig `validate`;
- AgentConfig `activate`;
- AgentConfig `rollback`, if implemented;
- tenant create/update/status/provisioning screens where mutation result is
  already available;
- agent create/update/lifecycle screens where mutation result is already
  available.

If backend does not return correlation id for a mutation:
- show `Correlation id was not returned by backend`;
- if request id is available, show request id as fallback;
- do not generate fake correlation id in the UI.

### 2.4 Agent Config page guidance

Improve operator guidance on the Agent Config page:

- explain that `Validate` checks the selected version but does not activate it;
- after successful validation, show that the next action is `Activate`;
- after activation, clearly show active config id and version;
- show copyable activation evidence;
- avoid ambiguous wording like `Safe settings: No` if it means no
  normalization/safe-default changes were applied. Prefer wording like
  `Safe defaults were not applied by backend validation`.

### 2.5 Agent Detail page guidance

Improve operator guidance on Agent Detail:

- show active config id after activation;
- show blockers as operator-actionable items where possible;
- do not push the operator to agent lifecycle activation while knowledge,
  policy, channel or release blockers remain;
- show the next recommended setup step based on backend/read-model state where
  available.

## 3. Out Of Scope

Do not implement in this fix:

- backend form metadata API;
- BFF form metadata bridge;
- new backend validation rules;
- local frontend readiness calculation;
- local frontend release gate calculation;
- model routing or policy logic;
- customer launch/sign-off flow;
- public widget runtime changes unless needed only for displaying existing
  widget evidence.

## 4. Implementation Notes

Preserve current routes and modules.

Expected touched area:
- `src/modules/AgentConfig`;
- shared UI copy/copy-button primitive only if one already exists or real reuse
  is needed;
- related tenant/agent mutation result rendering if current module responses
  already expose evidence.

Do not move broad code into shared packages unless reuse is real and immediate.

## 5. Required Tests

Add or update tests proving:

- `Response mode` is rendered as select, not free text;
- `Profile name` is rendered as controlled select/default, not free text;
- `Schema version` is rendered as read-only/default `1.0`;
- `Preferred model family` is rendered as select/default;
- `Preferred capabilities` is rendered as multi-select/chips;
- `Safety labels` is rendered as multi-select/chips;
- selected UI labels submit canonical backend values;
- unknown existing backend values are not silently dropped;
- `Create version` submits the expected payload shape;
- `Validate` result is visible and does not imply activation;
- `Activate` result shows active config evidence where backend returns it;
- copy buttons work for ids/correlation/request values;
- no access token, refresh token, secret, provider key or internal prompt is
  rendered in evidence blocks.

## 6. Acceptance Criteria

This fix is accepted when:

- an operator can configure and activate the first sales/support agent without
  typing raw enum-like values manually;
- mutation result evidence remains visible and copyable after critical actions;
- Agent Config and Agent Detail pages make the next setup step understandable;
- backend validation remains the source of truth;
- no frontend-local readiness, release, policy or model-routing logic is added.
