# Prompt 03: Urgent Agent Config Operator UX Consistency Review

Use this prompt only for the post-finalization urgent Agent Config operator UX
and mutation evidence stage.

Do not write runtime code in this step.

```text
Prompt '03_urgent_agent_config_operator_ux_consistency_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md
URGENT_STAGE_NAME = urgent_stage_agent_config_operator_ux_fix
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md
STAGE_07_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_07_agent_config.md

BACKEND_API_DOC_PATH = /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

Проведи consistency review urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_config_operator_ux/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 03_urgent_agent_config_operator_ux_consistency_review`;
   - current status maps to urgent stage TZ created and ready for consistency
     review;
   - Stages 01-13 are accepted and docs-synced/not required;
   - umbrella finalization is accepted;
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
- STAGE_07_TZ_PATH
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- /Volumes/Work/PC/ai_admin_panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/docs/recipes.md
- BACKEND_API_DOC_PATH as read-only contract cross-check only

Required code-grounded context:
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/AgentConfig/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Agents/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Tenants/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/shared/ui/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/i18n/messages.ts

Consistency review tasks:
1. Scope fit:
   - urgent stage is a post-finalization fix, not `stage_14`;
   - no new route/global navigation;
   - no customer portal/backend-only scope;
   - no public widget runtime behavior change.
2. Coverage:
   - all requirements from URGENT_SOURCE_TZ_PATH are represented in
     URGENT_STAGE_TZ_PATH;
   - no required tests are lost;
   - AgentConfig, Agent Detail and evidence/copy responsibilities are explicit.
3. Runtime safety/degradation:
   - accepted auth/session/security, tenants, agents, AgentConfig and final
     route smoke baseline must be preserved;
   - no half-wired UI;
   - no future-stage placeholders;
   - no change that would make accepted Stage 07 less correct.
4. Architecture:
   - AgentConfig owns option metadata/form/model/API changes;
   - Agents is touched only for Agent Detail guidance;
   - Tenants is touched only where existing mutation evidence is already
     exposed;
   - shared UI changes are narrow and justified by immediate reuse;
   - no business logic in shared UI;
   - pages/UI do not call transport directly;
   - DTO mapping remains in API/model boundaries.
5. Frontend/backend responsibility:
   - backend validation remains source of truth;
   - backend read models remain source for setup blockers/next steps;
   - no local readiness, release, policy, billing, metering, pricing or
     model-routing calculations;
   - no direct DB/vector/provider/internal backend calls.
6. Evidence and security:
   - copy buttons expose only safe ids/evidence values;
   - no access token, refresh token, secret, provider key, internal prompt or
     backend-internal payload is rendered;
   - missing correlation/request evidence gets safe fallback, not fake ids.
7. Engineering principles:
   - existing components/hooks are reused where appropriate;
   - option metadata is typed and centralized;
   - unknown backend values are preserved;
   - tests are assigned to closest owners.
8. If findings exist:
   - update URGENT_STAGE_TZ_PATH or docs only as needed;
   - update PIPELINE_STATE_PATH with findings and changed files;
   - do not change runtime code;
   - set blocked status when a finding remains unresolved.
9. If no blocking findings remain:
   - update PIPELINE_STATE_PATH;
   - mark urgent stage consistency accepted;
   - set `allowed_next_step = 04_urgent_agent_config_operator_ux_implementation`.

Suggested validation commands:
- `sed -n '1,260p' apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md`
- `rg -n "createVersion|createConfigVersion|createDraft|preferred_model_family|preferred_capabilities|profile_name|response_mode|config_schema_version|safety_labels|MutationResultBlock|clipboard|copy" apps/admin-panel/src/modules/AgentConfig apps/admin-panel/src/modules/Agents apps/admin-panel/src/modules/Tenants apps/admin-panel/src/shared/ui apps/admin-panel/src/core/i18n/messages.ts`
- `rg -n "readiness|release gate|policy engine|model-routing|pricing|invoice|tax|provider key|access token|refresh token|internal prompt" apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md apps/admin-panel/src/modules/AgentConfig apps/admin-panel/src/modules/Agents apps/admin-panel/src/shared/ui`
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

