# Stage 09: Capabilities And Policy

Status: `ready-for-stage-implementation`

## Goal

Allow operators to assign agent capabilities and bind/validate policy profiles
using backend-owned catalogs and validation results.

## Dependencies

- Stages 01-08 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/AgentCapabilities` and `src/modules/AgentPolicy`.
- Add:
  - `/tenants/:tenantId/agents/:agentId/capabilities`
  - `/tenants/:tenantId/agents/:agentId/policy`
- Implement capability catalog, current assignments, assignment update, policy
  catalog, current binding, binding update and binding validation.
- Display readiness issues returned by backend.

## Out Of Scope

- Authoring new capability definitions or policy engines.
- Release publication, widget setup and public smoke.
- Frontend-local policy validation or safety scoring.

## Routes / Navigation Impact

- Add Capabilities and Policy links only in implemented agent context.
- Keep Sites, Widgets and Releases absent until Stage 10.

## Module / File Ownership

- `src/modules/AgentCapabilities/{api,model,pages,ui}` owns capability UX.
- `src/modules/AgentPolicy/{api,model,pages,ui}` owns policy binding UX.
- Router/AppShell add implemented route entries only.

## Reuse Rules And Responsibility Boundaries

- Pages/ui do not call `apiClient`.
- Backend catalog/binding/validation responses are authoritative.
- No frontend-local duplicate policy engine.
- Agent context comes from route params and existing tenant/agent models.

## API Contracts

- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/catalog`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments`
- `PUT /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy-profiles/catalog`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding`
- `PUT /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding/validate`

## UI/UX States

- Catalog and current assignment/binding states support loading, empty, error
  and refresh.
- Updates require clear confirmation when they affect production behavior.
- Policy validation shows pass/fail/issues from backend.
- Disabled actions explain missing permission or missing prerequisite state.

## Access / Security Requirements

- Protected tenant/agent-scoped routes.
- Mutations are permission-aware and CSRF-protected.
- Do not expose internal policy implementation details unless backend returns
  support-safe fields.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover catalog mapping, assignment/binding forms, validation result
  display, confirmations and permission-disabled states.

## Docs Impact

- Update capabilities/policy docs after acceptance.

## Acceptance Criteria

- Operators can view and update approved capability and policy bindings.
- Validation results come from backend.
- Future release/widget UI is absent.

## Future-Stage Forbidden Actions

- Do not implement Sites, Widgets, Releases, Conversations, Usage or Billing.
- Do not implement policy logic in the frontend.
- Do not calculate release readiness locally.

## Expected Gate Result

- Prompt 03 verifies capability/policy scope and contracts.
- Prompt 04 may implement Stage 09 only after Stages 01-08 are accepted.
