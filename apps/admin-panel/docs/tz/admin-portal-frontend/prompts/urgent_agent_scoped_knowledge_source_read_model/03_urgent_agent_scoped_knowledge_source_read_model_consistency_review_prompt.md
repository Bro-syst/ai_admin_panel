# Prompt 03: Urgent Agent-Scoped Knowledge Source Read Model Consistency Review

Use this prompt only for the post-finalization urgent Agent-Scoped Knowledge
Source Read Model stage.

Do not write runtime code in this step.

```text
Prompt '03_urgent_agent_scoped_knowledge_source_read_model_consistency_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_SCOPED_KNOWLEDGE_SOURCE_READ_MODEL_TZ.md
URGENT_STAGE_NAME = urgent_stage_agent_scoped_knowledge_source_read_model
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md
STAGE_08_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_08_knowledge_binding.md

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-11_agent_scoped_knowledge_source_portal_read_model_closure/TZ-SVC-11-FRONTEND_agent_knowledge_screen.md
BACKEND_API_DOC_PATH = /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

Проведи consistency review urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_scoped_knowledge_source_read_model/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 03_urgent_agent_scoped_knowledge_source_read_model_consistency_review`;
   - current status maps to urgent agent-scoped knowledge stage TZ created and
     ready for consistency review;
   - Stages 01-13 are accepted and docs-synced/not required;
   - umbrella finalization is accepted;
   - urgent release evidence/retrieval packages are accepted and docs-synced;
   - blocked findings are empty or `none`;
   - TARGET_APP, URGENT_SOURCE_TZ_PATH and URGENT_STAGE_TZ_PATH match this
     prompt.
3. Если gate не проходит, остановись со статусом `Blocked`.
4. Не переходи к prompt 04 и не меняй runtime-код.

Обязательные документы:
- FRONTEND_TZ_PATH
- FUNCTIONAL_CHECKLIST_PATH
- IMPLEMENTED_CHECKLIST_PATH
- URGENT_SOURCE_TZ_PATH
- URGENT_STAGE_TZ_PATH
- STAGE_08_TZ_PATH
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- /Volumes/Work/PC/ai_admin_panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/docs/recipes.md
- BACKEND_TZ_PATH as read-only contract cross-check only
- BACKEND_API_DOC_PATH as read-only contract cross-check only

Required code-grounded context:
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Knowledge/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/i18n/messages.ts
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/router/
- no-regression boundary only:
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Releases/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Agents/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/AgentConfig/

Consistency review tasks:
1. Scope fit:
   - urgent stage is a post-finalization fix, not `stage_14`;
   - no new route/global navigation;
   - only existing `/tenants/:tenantId/agents/:agentId/knowledge` is updated;
   - Releases remains no-regression boundary, not implementation scope.
2. Coverage:
   - all requirements from URGENT_SOURCE_TZ_PATH are represented in
     URGENT_STAGE_TZ_PATH;
   - backend TZ-SVC-11 routes are represented;
   - required tests are present;
   - no Knowledge source ownership is moved to another module.
3. Runtime safety/degradation:
   - accepted auth/session/security, Stage 08 Knowledge baseline, urgent
     release evidence requirements and retrieval evidence flow are preserved;
   - no half-wired source/document/indexing UI;
   - no future-stage placeholders;
   - no stale mutation-payload source of truth.
4. Architecture:
   - Knowledge owns API/model/UI changes;
   - DTO mapping remains in Knowledge API/model boundaries;
   - pages/UI do not call transport directly;
   - no duplicate source visibility or release readiness source of truth;
   - shared UI changes are avoided unless immediately justified.
5. Frontend/backend responsibility:
   - backend agent-scoped read models are source of truth for source visibility,
     detail and readiness;
   - backend remains authority for source create, document registration and
     indexing mutations;
   - no frontend-local readiness, retrieval, release, policy, billing, metering,
     pricing or model-routing calculations;
   - no direct DB/vector/provider/internal backend calls.
6. Evidence and security:
   - mutation evidence exposes only safe ids/evidence values;
   - no tokens, secrets, provider keys, internal prompts, raw source text,
     raw chunks, vector/debug payloads or backend-internal payloads are rendered;
   - missing optional backend fields get neutral fallback, not fake ids/status.
7. If findings exist:
   - update URGENT_STAGE_TZ_PATH or docs only as needed;
   - update PIPELINE_STATE_PATH with findings and changed files;
   - do not change runtime code;
   - set blocked status when a finding remains unresolved.
8. If no blocking findings remain:
   - update PIPELINE_STATE_PATH;
   - mark urgent stage consistency accepted;
   - set `allowed_next_step = 04_urgent_agent_scoped_knowledge_source_read_model_implementation`.

Suggested validation commands:
- `sed -n '1,260p' apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md`
- `rg -n "listPortalSources|getPortalSourceDetail|getPortalReleaseReadiness|agentId|knowledge/sources|release-readiness|selectedSourceDetail|source created|no_source" apps/admin-panel/src/modules/Knowledge apps/admin-panel/src/core/i18n/messages.ts`
- `rg -n "releaseCandidate|publish|release evidence|support reconstruction|localStorage|sessionStorage|apiClient|fetch\\(|axios" apps/admin-panel/src/modules/Knowledge`
- `rg -n "api_key|secret|provider|raw chunk|debug|vector|database|pgvector|opensearch|internal prompt" apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md apps/admin-panel/src/modules/Knowledge`
- `git diff --check -- apps/admin-panel/docs/tz/admin-portal-frontend`

Final response must be findings-first:
- issue;
- file/section;
- risk;
- fix applied or required.

Then include:
- coverage result;
- architecture/reuse result;
- degradation-safety result;
- updated files;
- open questions or `none`;
- whether urgent prompt 04 is allowed;
- final status: `Urgent stage ready for implementation`,
  `Ready with documented deferred items`, or `Blocked`.
```
