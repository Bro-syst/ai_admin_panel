# Urgent Stage: Agent-Scoped Knowledge Source Read Model

Status: `accepted-docs-synced`

Stage name:

- `urgent_stage_agent_scoped_knowledge_source_read_model`

Source TZ:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_SCOPED_KNOWLEDGE_SOURCE_READ_MODEL_TZ.md`

Backend source TZ, read-only:

- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-11_agent_scoped_knowledge_source_portal_read_model_closure/TZ-SVC-11-FRONTEND_agent_knowledge_screen.md`

Target route:

- `/tenants/:tenantId/agents/:agentId/knowledge`

## Scope

This urgent stage updates the existing Knowledge screen to use backend
agent-scoped read models for the current agent's knowledge sources, source
detail and release readiness.

It is a post-finalization fix and must not create `stage_14`, new navigation or
new routes.

## Dependencies

- Stages 01-13 accepted and docs-synced/not required.
- Umbrella finalization accepted.
- Urgent Agent Config Operator UX accepted and docs-synced.
- Urgent Release Evidence Requirements UI accepted and docs-synced.
- Urgent Release Retrieval Evidence Operator Flow accepted and docs-synced.
- Backend TZ-SVC-11 agent-scoped portal read model is available.

## Required Implementation

### API Owner

In `src/modules/Knowledge/api/knowledgeApi.ts`:

- `listPortalSources(tenantId, agentId)` calls
  `/api/admin/v1/portal/tenants/{tenantId}/agents/{agentId}/knowledge/sources`.
- `getPortalSourceDetail(tenantId, agentId, sourceId)` calls
  `/api/admin/v1/portal/tenants/{tenantId}/agents/{agentId}/knowledge/sources/{sourceId}`.
- `getPortalReleaseReadiness(tenantId, agentId)` calls
  `/api/admin/v1/portal/tenants/{tenantId}/agents/{agentId}/knowledge/release-readiness`.
- DTO mapping remains inside `Knowledge/api`.
- Tenant-scoped portal read routes are not used by the agent Knowledge screen
  after this change.

### Model Owner

In `src/modules/Knowledge/model/useKnowledgeManager.ts`:

- pass both `tenantId` and `agentId` to the three read methods;
- initial load selects a source only from the backend agent-scoped list;
- load detail through the agent-scoped detail route;
- preserve the existing retrieval run load filtered by current `agentId`;
- after create source, record mutation evidence, reload agent-scoped data,
  select created source only if it is returned by backend, and show actionable
  warning if it is absent;
- after document and indexing mutations, reload list/detail/release readiness
  from backend.

### UI Owner

In `src/modules/Knowledge/ui/KnowledgeView.tsx`:

- source list reflects current-agent backend visibility after reload;
- empty/no-selection states use current-agent localized copy;
- document and indexing controls are disabled only until selected backend detail
  exists;
- source creation success gives the next operator action;
- readiness stays backend-owned;
- no raw debug/vector/provider/chunk content is exposed beyond existing
  backend-approved safe fields.

### I18n

In `src/core/i18n/messages.ts`:

- add RU/EN messages for current-agent empty state, no-source guidance, create
  success and created-but-not-visible warning.
- Localized labels must not be submitted as backend values.

## Out Of Scope

- Backend code changes.
- New route/global nav.
- Release evidence, release candidate or publish gate changes.
- Source, document and indexing mutation contract changes unless backend
  explicitly rejects the current payload shape.
- Local source visibility/readiness calculations.
- Local source/document/indexing id fabrication.
- Direct DB/vector/provider/internal backend calls.
- Browser storage as source of truth for created sources.
- Cross-module ownership moves.

## Required Tests

- API route tests for agent-scoped source list/detail/readiness.
- Manager initial-load test for agent-scoped list/readiness/detail.
- Create-source reload/auto-select test with mutation evidence and backend
  source-list confirmation.
- Created-source-not-visible warning test.
- Reload/back-forward style fresh-load test.
- Empty/no-selection copy test.
- Document/indexing disabled-state test.
- Backend-readiness-only rendering test.
- RU/EN i18n coverage for new messages.

## Required Checks

- `npm run test:admin -- Knowledge`
- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Boundary searches from the implementation prompt.

## Acceptance Criteria

- A source restricted to the current agent remains visible after reload when
  backend returns it through the agent-scoped list.
- Source detail is loaded from the agent-scoped detail route.
- Document/indexing controls become available only after backend detail loads.
- Release readiness is rendered from backend response only.
- The UI does not keep stale mutation payload as source truth.
- No accepted auth/session/security, Knowledge, Releases or prior urgent
  release evidence behaviour regresses.
