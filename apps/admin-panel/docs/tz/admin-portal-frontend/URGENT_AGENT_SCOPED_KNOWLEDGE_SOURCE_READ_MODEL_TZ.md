# Urgent Agent-Scoped Knowledge Source Read Model TZ

Status: `accepted-docs-synced`

Source backend/frontend task:

- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-11_agent_scoped_knowledge_source_portal_read_model_closure/TZ-SVC-11-FRONTEND_agent_knowledge_screen.md`

Target app:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`

Target route:

- `/tenants/:tenantId/agents/:agentId/knowledge`

Urgent stage:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md`

Prompt package:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_scoped_knowledge_source_read_model`

## Purpose

The Knowledge screen must read knowledge sources through the backend
agent-scoped portal read model. A source created for the current agent must stay
visible after reload/back-forward and must enable the document/indexing flow
only when backend source detail has been loaded for the current agent.

This is a post-finalization urgent frontend fix. It does not reopen the
accepted 13-stage umbrella and must not create `stage_14`.

## Problem

The operator can create a managed knowledge source restricted to the current
agent, but after page reload or navigation back to the Knowledge screen the
source disappears from the source list. The frontend currently reads tenant
portal knowledge routes for an agent-specific screen, so the UI can lose the
source visibility that backend now exposes through the agent-scoped read model.

When the source disappears, document registration and indexing remain disabled,
which blocks retrieval readiness and the later release retrieval evidence flow.

## Backend Contract

Use these read endpoints for the existing Knowledge screen:

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge/sources`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge/sources/{source_id}`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge/release-readiness`

Existing mutation contracts stay unchanged unless backend explicitly rejects
the current payload shape:

- create source;
- update source metadata;
- disable source;
- register/update/disable document;
- run/retry indexing.

Mutation results are evidence and reload hints only; source visibility,
documents, jobs and readiness must be confirmed by the backend read model.

## Frontend Scope

Expected owner files:

- `src/modules/Knowledge/api/knowledgeApi.ts`
- `src/modules/Knowledge/model/useKnowledgeManager.ts`
- `src/modules/Knowledge/ui/KnowledgeView.tsx`
- `src/core/i18n/messages.ts`
- focused tests under `src/modules/Knowledge/**`

Route integration:

- `src/modules/Knowledge/pages/KnowledgePage.tsx` already receives `tenantId`
  and `agentId`; keep the route as-is.
- `useKnowledgeManager` should be the single place that passes both ids into
  Knowledge API read methods.

## Required Behaviour

### Initial Load

1. Load the agent-scoped source list and agent-scoped release readiness.
2. Keep existing retrieval run loading filtered by `agentId`.
3. If sources exist:
   - preserve the previous selected source if still present;
   - otherwise select the first backend-returned source;
   - load source detail through the agent-scoped detail route.
4. If sources are empty:
   - clear selected source/detail;
   - show current-agent empty copy;
   - keep document/indexing controls disabled with current-agent guidance.

### Create Source

1. Send the existing create-source mutation.
2. Store and render the mutation result/evidence.
3. Prefer created source id from `response.resource.id` or
   `response.result.resourceId`.
4. Reload the agent-scoped source list and release readiness.
5. If the created source appears in the reloaded list, select it and load detail
   through the agent-scoped detail route.
6. If it does not appear, show an actionable warning instead of keeping stale
   mutation payload as UI truth.

### Documents And Indexing

1. Document and indexing sections are enabled only when selected source detail
   has been loaded from backend.
2. After document registration/update/disable and indexing run/retry, reload:
   - source list;
   - selected source detail;
   - release readiness.
3. Do not mark release readiness ready from local form state.

## UI Copy

Add localized operator copy for expected states:

- Empty source list:
  `Для этого агента пока нет доступных управляемых источников. Создайте источник или проверьте привязку.`
- No selected source:
  `Сначала выберите или создайте источник для текущего агента.`
- Source created and visible:
  `Источник создан и доступен текущему агенту. Зарегистрируйте документ и запустите индексацию.`
- Source created but not visible after reload:
  `Источник создан, но не виден текущему агенту. Обновите экран или проверьте agent visibility на backend.`

Avoid misleading copy such as `Backend не вернул документы` when no source is
selected.

## Out Of Scope

- New route or global navigation.
- Backend endpoint implementation.
- Release publish, release candidate or release evidence logic.
- Local source visibility/readiness calculations.
- LocalStorage/sessionStorage as source of truth.
- Direct DB/vector/provider/internal backend calls.
- Raw query/chunk/debug/provider payload exposure.
- Frontend-managed source/document/job ids or fake correlation/request ids.

## Tests

Required focused tests:

- API methods call the three agent-scoped read routes with both `tenantId` and
  `agentId`.
- Manager initial load uses agent-scoped list/readiness/detail.
- Create source success records mutation evidence, reloads the agent-scoped
  list, auto-selects the created source when backend returns it, and does not
  use stale mutation payload as source of truth.
- Fresh load/reload keeps current-agent source visible when backend returns it.
- Empty state shows current-agent copy.
- Document/indexing controls are disabled only until backend source detail is
  loaded.
- Release readiness is rendered from backend response, not calculated locally.
- RU/EN i18n covers new copy and known expected states.

## Checks

Implementation prompt must run:

- `npm run test:admin -- Knowledge`
- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`

## Acceptance

Manual acceptance should verify:

1. Open the Knowledge screen for a manual smoke agent.
2. Create a source restricted to the current agent.
3. Reload the page.
4. Confirm the source remains visible in the source list.
5. Select the source and confirm details load.
6. Register a document.
7. Run indexing.
8. Confirm readiness updates from backend.
9. Return to Releases and continue the retrieval evidence flow.
