# Adapted Prompt 05: Admin Portal Stage Acceptance Review

Use this prompt after prompt 04 implements exactly one Admin Portal stage.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/05_stage_acceptance_review_prompt.md`

This is a review step. Do not edit runtime code by default.

```text
Prompt '05_stage_acceptance_review_prompt.md'
TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md
STAGE_OUTPUT_DIR = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md
BACKEND_SUPPORTING_DOCS =
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

SELECT THE IMPLEMENTED STAGE:
- stage_01_security_route_shell_readiness -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_01_security_route_shell_readiness.md
- stage_02_admin_users -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_02_admin_users.md
- stage_03_navigation_operator_shell -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_03_navigation_operator_shell.md
- stage_04_tenants -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_04_tenants.md
- stage_05_dashboard_operations -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_05_dashboard_operations.md
- stage_06_agent_templates_agents -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_06_agent_templates_agents.md
- stage_07_agent_config -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_07_agent_config.md
- stage_08_knowledge_binding -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_08_knowledge_binding.md
- stage_09_capabilities_policy -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_09_capabilities_policy.md
- stage_10_sites_widgets_releases -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_10_sites_widgets_releases.md
- stage_11_conversations_support -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_11_conversations_support.md
- stage_12_usage_metering_billing -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_12_usage_metering_billing.md
- stage_13_e2e_smoke_docs -> /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_13_e2e_smoke_docs.md

STAGE_NAME = stage_13_e2e_smoke_docs
STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_13_e2e_smoke_docs.md

Проведи acceptance review реализованного stage `STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 05_stage_acceptance_review` for selected stage;
   - selected stage is recorded as `Stage ready for acceptance review` or
     `Ready with documented deferred items`;
   - changed files, commands run and implementation notes are recorded for the
     selected stage.
3. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- STAGE_TZ_PATH
- PIPELINE_STATE_PATH
- FUNCTIONAL_CHECKLIST_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- backend docs as read-only cross-check only

Review tasks:
1. Findings first. If no findings, say that explicitly.
2. Check scope fit:
   - selected stage fully implemented;
   - no future-stage UI/actions;
   - no another-app or backend-only scope.
3. Check runtime behavior:
   - routes/pages/actions from stage TZ;
   - loading, empty, error, success states;
   - confirmations and permission-disabled states;
   - auth/security/session behavior if touched;
   - no half-wired routes/actions.
4. Check architecture:
   - `core`, `modules`, `shared` boundaries;
   - module public exports through `index.ts`;
   - DTO mapping in api/model, not pages/UI;
   - pages/UI do not call `apiClient`;
   - no duplicate source of truth;
   - no speculative shared extraction.
5. Check frontend/backend responsibility:
   - portal read models primary where required;
   - no local readiness/policy/billing calculations;
   - no direct DB/vector/provider/internal backend calls;
   - public widget smoke never uses admin cookies.
6. Check tests and commands:
   - stage-sensitive cases covered;
   - `npm run test:admin`, `npm run lint:admin`, `npm run build:admin` run or
     omissions justified.
7. If findings exist:
   - do not fix by default;
   - update PIPELINE_STATE_PATH with findings;
   - set `allowed_next_step = 04_stage_implementation_fix_pass` for selected
     stage.
8. If no findings:
   - update PIPELINE_STATE_PATH with stage acceptance;
   - set `allowed_next_step = 06_stage_docs_sync` for selected stage.

Final response:
- findings first or explicit "findings нет";
- checks run;
- architecture/engineering verdict;
- stage status;
- next step: prompt 06 docs sync or prompt 04 fix-pass;
- final status: `Stage accepted`, `Stage accepted with documented deferred items`, or `Blocked`.
```

