# Stage 07: Agent Config

Status: `ready-for-stage-implementation`

## Goal

Allow operators to create, validate, activate and roll back approved agent
configuration versions using the fixed frontend editable schema.

## Dependencies

- Stages 01-06 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/AgentConfig`.
- Add `/tenants/:tenantId/agents/:agentId/config`.
- Implement active config, version list/detail, draft/create version,
  validation, activation and rollback.
- Use the editable schema defined in the UI/UX spec.

## Out Of Scope

- Knowledge, capability, policy, widget or release management.
- Editing backend-internal/provider fields not in the approved schema.
- Local validation beyond client-side form shape and backend validation result
  display.

## Routes / Navigation Impact

- Add Config link only on implemented agent detail/context navigation.
- Keep future setup links absent until their stages ship.

## Module / File Ownership

- `src/modules/AgentConfig/api` owns endpoint calls and DTO mapping.
- `src/modules/AgentConfig/model` owns draft state, version selection,
  validation and mutation orchestration.
- `src/modules/AgentConfig/pages` owns route composition.
- `src/modules/AgentConfig/ui` owns forms, version cards and dialogs.

## Reuse Rules And Responsibility Boundaries

- Pages/ui do not call `apiClient`.
- Backend validation response is the authority for config validity.
- No duplicate readiness or release gating logic.
- Agent identity/context comes from route params and Agent/Tenant model reads.

## API Contracts

- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/active`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/config-drafts`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/validate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/activate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/rollback`

## UI/UX States

- Active config and version history show loading, empty, error and stale states.
- Draft form supports approved schema fields, dirty state and validation result.
- Activate and rollback require confirmation with target version summary.
- Backend validation issues are shown inline and in summary.

## Access / Security Requirements

- Protected tenant/agent-scoped route.
- Mutations are permission-aware and CSRF-protected.
- No internal prompts, secrets or provider credentials are displayed unless the
  backend returns support-safe fields.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover schema mapping, validation result display, activation/rollback
  confirmations and permission-disabled actions.

## Docs Impact

- Update Agent Config route/module docs after acceptance.

## Acceptance Criteria

- Operators can inspect active/versioned config and perform approved config
  lifecycle actions.
- Config validity comes from backend validation.
- No future knowledge/policy/release UI is exposed.

## Future-Stage Forbidden Actions

- Do not implement Knowledge, Capabilities, Policy, Sites, Widgets or Releases.
- Do not derive release readiness from config locally.
- Do not expose backend-internal/provider fields.

## Expected Gate Result

- Prompt 03 verifies config schema, routes and contracts.
- Prompt 04 may implement Stage 07 only after Stages 01-06 are accepted.
