# Prompt 04: Urgent Agent-Scoped Knowledge Source Read Model Implementation

Use this prompt only after urgent prompt 03 accepts the urgent stage.

```text
Prompt '04_urgent_agent_scoped_knowledge_source_read_model_implementation_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_SCOPED_KNOWLEDGE_SOURCE_READ_MODEL_TZ.md
URGENT_STAGE_NAME = urgent_stage_agent_scoped_knowledge_source_read_model
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md
BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-11_agent_scoped_knowledge_source_portal_read_model_closure/TZ-SVC-11-FRONTEND_agent_knowledge_screen.md

Реализуй urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_scoped_knowledge_source_read_model/README.md
   - PIPELINE_STATE_PATH
   - URGENT_SOURCE_TZ_PATH
   - URGENT_STAGE_TZ_PATH
   - BACKEND_TZ_PATH as read-only contract context
2. Продолжай только если:
   - `allowed_next_step = 04_urgent_agent_scoped_knowledge_source_read_model_implementation`;
   - urgent prompt 03 consistency review is complete and accepted;
   - blocked findings are empty or `none`;
   - Stages 01-13 remain accepted/finalized;
   - urgent release evidence requirements and retrieval evidence packages remain accepted/docs-synced.
3. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- IMPLEMENTED_CHECKLIST_PATH
- URGENT_SOURCE_TZ_PATH
- URGENT_STAGE_TZ_PATH
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md

Allowed runtime write scope:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Knowledge/**`;
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/i18n/messages.ts`;
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/router/routes.test.tsx`
  only to prove no new knowledge route/regression;
- focused tests in the same owner areas;
- PIPELINE_STATE_PATH.

Implementation requirements:
1. API contract:
   - `listPortalSources(tenantId, agentId)` calls the agent-scoped source list route;
   - `getPortalSourceDetail(tenantId, agentId, sourceId)` calls the agent-scoped detail route;
   - `getPortalReleaseReadiness(tenantId, agentId)` calls the agent-scoped readiness route;
   - keep DTO mapping in Knowledge API/model boundaries.
2. Loading and selection:
   - load agent-scoped source list and release readiness on initial page load;
   - preserve current selected source only if returned by backend;
   - otherwise select the first backend-returned source;
   - load selected detail through the agent-scoped detail route;
   - preserve unknown backend reasons safely.
3. Source creation:
   - keep existing create-source mutation contract;
   - store mutation evidence/result;
   - prefer created source id from `response.resource.id` or `response.result.resourceId`;
   - reload agent-scoped list/readiness;
   - auto-select and load detail only if the source is returned by backend;
   - show actionable warning if create succeeds but source is not visible.
4. Documents and indexing:
   - document/indexing controls stay disabled until selected source detail is loaded from backend;
   - after document registration/update/disable and indexing run/retry, refresh list/detail/readiness;
   - do not calculate release readiness locally.
5. UI requirements:
   - current-agent empty/no-selection copy;
   - source-created next-step success notice;
   - no misleading "backend did not return documents" copy when no source is selected;
   - safe mutation evidence display only.
6. Localization:
   - RU/EN messages for new expected states;
   - preserve unknown backend values through safe fallback;
   - localized labels must never be submitted as backend values.
7. Preserve boundaries:
   - no new route/global nav;
   - no release evidence/publish logic changes;
   - no backend endpoint implementation;
   - no frontend-local visibility/readiness/release/policy/billing/model-routing logic;
   - no direct DB/vector/provider/internal backend calls;
   - no direct transport calls in pages/UI.
8. Add/update focused tests from urgent stage TZ.
9. Run checks:
   - `npm run test:admin -- Knowledge`
   - `npm run test:admin`
   - `npm run lint:admin`
   - `npm run build:admin`
   - boundary searches from URGENT_STAGE_TZ_PATH.
10. Update PIPELINE_STATE_PATH:
   - implementation summary;
   - changed files;
   - reuse/new ownership decisions;
   - commands run;
   - blockers/deferred items;
   - set `allowed_next_step = 05_urgent_agent_scoped_knowledge_source_read_model_acceptance_review`.

Final response:
- what was implemented;
- boundaries preserved;
- reuse/new ownership decisions;
- tests/checks run;
- blockers/deferred items;
- final status: `Urgent stage ready for acceptance review`,
  `Ready with documented deferred items`, or `Blocked`.
```
