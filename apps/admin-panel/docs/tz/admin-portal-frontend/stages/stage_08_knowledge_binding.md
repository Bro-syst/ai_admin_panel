# Stage 08: Knowledge And Binding

Status: `ready-for-stage-implementation`

## Goal

Provide managed knowledge source, indexing, readiness and agent binding UX
without turning the portal into a generic file-upload tool.

## Dependencies

- Stages 01-07 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/Knowledge` and `src/modules/AgentKnowledgeBinding`.
- Add `/tenants/:tenantId/agents/:agentId/knowledge`.
- Implement tenant source catalog/detail, agent knowledge summary, managed
  source/document registration, indexing state, release-readiness display and
  agent binding.
- Show template-driven source-pack/category progress where returned.

## Out Of Scope

- Generic upload UX not backed by the product contract.
- Direct vector DB operations.
- Capability/policy binding, releases or widget publication.
- Frontend-local knowledge readiness calculation.

## Routes / Navigation Impact

- Add Knowledge link only inside implemented agent context.
- Keep Capabilities, Policy, Sites, Widgets and Releases absent.

## Module / File Ownership

- `src/modules/Knowledge/api` owns source/readiness endpoint calls and mapping.
- `src/modules/Knowledge/model` owns filters, registration and indexing state.
- `src/modules/Knowledge/pages` owns route composition.
- `src/modules/Knowledge/ui` owns source and readiness components.
- `src/modules/AgentKnowledgeBinding/{api,model,pages,ui}` owns
  agent-specific binding calls, orchestration and UX where binding behavior is
  not naturally owned by `src/modules/Knowledge`.

## Reuse Rules And Responsibility Boundaries

- Portal read models are primary for summary screens.
- Pages/ui do not call `apiClient`.
- Backend indexing/readiness status is authoritative.
- No direct provider, crawler, storage or vector calls.

## API Contracts

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources/{source_id}`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/release-readiness`
- Management groups allowed only as documented:
  `/api/admin/v1/tenants/{tenant_id}/knowledge/*`
  and `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/knowledge/*`.

## UI/UX States

- Source catalog/detail: loading, empty, filtered-empty, error and stale states.
- Registration/indexing actions show progress, correlation/result and failure
  reasons.
- Readiness displays backend issues and support-safe drill-downs where returned.
- Binding UI shows current binding and allowed changes only.

## Access / Security Requirements

- Protected tenant/agent-scoped route.
- Mutations are permission-aware and CSRF-protected.
- Do not display internal documents/prompts/secrets unless backend marks them
  support-safe.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover read model mapping, registration/indexing mutation states,
  binding behavior, permissions and absence of local readiness calculation.

## Docs Impact

- Update knowledge/module docs after acceptance.

## Acceptance Criteria

- Operators can inspect and manage approved knowledge sources and agent binding.
- Readiness and indexing state come from backend contracts.
- No generic upload or direct vector/provider behavior exists.

## Future-Stage Forbidden Actions

- Do not implement Capabilities, Policy, Sites, Widgets, Releases or Billing.
- Do not calculate knowledge or release readiness locally.
- Do not call storage/vector/provider services directly.

## Expected Gate Result

- Prompt 03 verifies knowledge scope and contracts.
- Prompt 04 may implement Stage 08 only after Stages 01-07 are accepted.
