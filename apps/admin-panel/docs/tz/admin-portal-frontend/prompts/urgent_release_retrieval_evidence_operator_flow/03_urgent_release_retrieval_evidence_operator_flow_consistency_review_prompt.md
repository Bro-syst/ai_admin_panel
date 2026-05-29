# Prompt 03: Urgent Release Retrieval Evidence Operator Flow Consistency Review

Use this prompt only for the post-finalization urgent Release Retrieval
Evidence Operator Flow stage.

Do not write runtime code in this step.

```text
Prompt '03_urgent_release_retrieval_evidence_operator_flow_consistency_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md
URGENT_STAGE_NAME = urgent_stage_release_retrieval_evidence_operator_flow
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md
STAGE_10_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_10_sites_widgets_releases.md

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-10_release_retrieval_evidence_operator_flow/FRONTEND_RELEASE_SCREEN_RETRIEVAL_EVIDENCE_TZ.md
BACKEND_API_DOC_PATH = /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

Проведи consistency review urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_release_retrieval_evidence_operator_flow/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 03_urgent_release_retrieval_evidence_operator_flow_consistency_review`;
   - current status maps to urgent release retrieval evidence stage TZ created
     and ready for consistency review;
   - Stages 01-13 are accepted and docs-synced/not required;
   - umbrella finalization is accepted;
   - urgent Release Evidence Requirements UI is accepted and docs-synced;
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
- STAGE_10_TZ_PATH
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
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Releases/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/i18n/messages.ts
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/router/
- no-regression boundary only:
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Agents/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/AgentPolicy/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/SitesWidgets/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Knowledge/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/AgentCapabilities/
  - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/AgentConfig/

Consistency review tasks:
1. Scope fit:
   - urgent stage is a post-finalization fix, not `stage_14`;
   - no new route/global navigation;
   - only existing `/tenants/:tenantId/agents/:agentId/releases` is updated;
   - adjacent modules remain no-regression boundary, not implementation scope.
2. Coverage:
   - all requirements from URGENT_SOURCE_TZ_PATH are represented in
     URGENT_STAGE_TZ_PATH;
   - backend TZ-SVC-10 contracts are represented;
   - required tests are present;
   - no retrieval evidence responsibility is moved to another module.
3. Runtime safety/degradation:
   - accepted auth/session/security, Stage 10 release baseline, urgent Release
     Evidence Requirements UI, runtime provider preflight and runtime usage
     candidate flow are preserved;
   - no half-wired release create/publish state;
   - no future-stage placeholders;
   - historical failed releases cannot become publishable through fake refs.
4. Architecture:
   - Releases owns API/model/UI changes;
   - DTO mapping remains in Releases API/model boundaries;
   - pages/UI do not call transport directly;
   - no duplicate release readiness or release gate source of truth;
   - shared UI changes are narrow and justified by immediate reuse.
5. Frontend/backend responsibility:
   - backend retrieval evidence candidates are source of truth for managed
     retrieval/support references;
   - backend remains authority for candidate eligibility, create and publish;
   - no frontend-local retrieval/vector/debug source of truth;
   - no local release readiness, release gate, policy, billing, metering,
     pricing or model-routing calculations;
   - no direct DB/vector/provider/internal backend calls.
6. Evidence and security:
   - candidate cards expose only safe ids/evidence values;
   - no tokens, secrets, provider keys, internal prompts, raw chunks, source
     text, transcripts, provider payloads or backend-internal debug payloads
     are rendered;
   - missing optional backend fields get neutral fallback, not fake ids/status.
7. If findings exist:
   - update URGENT_STAGE_TZ_PATH or docs only as needed;
   - update PIPELINE_STATE_PATH with findings and changed files;
   - do not change runtime code;
   - set blocked status when a finding remains unresolved.
8. If no blocking findings remain:
   - update PIPELINE_STATE_PATH;
   - mark urgent stage consistency accepted;
   - set `allowed_next_step = 04_urgent_release_retrieval_evidence_operator_flow_implementation`.

Suggested validation commands:
- `sed -n '1,320p' apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md`
- `rg -n "release-retrieval-evidence|retrievalEvidence|supportReconstruction|releaseCandidateId|evidenceStableReference|usageEvidenceCandidates" apps/admin-panel/src/modules/Releases apps/admin-panel/src/core/i18n/messages.ts`
- `rg -n "release-retrieval-evidence|retrieval evidence|support_reconstruction" apps/admin-panel/src/modules/Agents apps/admin-panel/src/modules/AgentPolicy apps/admin-panel/src/modules/SitesWidgets apps/admin-panel/src/modules/Knowledge apps/admin-panel/src/modules/AgentCapabilities apps/admin-panel/src/modules/AgentConfig`
- `rg -n "api_key|secret|credential|OPENAI|provider payload|transcript|raw chunk|debug|vector|database|pgvector|opensearch" apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md apps/admin-panel/src/modules/Releases`
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
