# Adapted Prompt 04: Admin Portal Stage Implementation / Fix Pass

Use this prompt to implement exactly one accepted Admin Portal stage, or to run
a focused fix-pass after prompt 05 or 07 records findings.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/04_stage_implementation_prompt.md`

Do not use this prompt to implement more than one stage.

```text
Prompt '04_stage_implementation_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md

FRONTEND_PRODUCT_BRIEF_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FRONTEND_PRODUCT_BRIEF.md
UI_UX_SPEC_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_UI_UX_SPEC.md
FRONTEND_API_REFERENCE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_API_REFERENCE.md
FRONTEND_IMPLEMENTATION_PLAN_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_PLAN.md
ACCEPTANCE_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_ACCEPTANCE_CHECKLIST.md
STAGE_CONSISTENCY_REVIEW_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_STAGE_TZ_CONSISTENCY_REVIEW.md

STAGE_OUTPUT_DIR = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md
BACKEND_SUPPORTING_DOCS =
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

SELECT ONE STAGE BEFORE RUNNING:

| Stage name | Stage TZ path | Dependencies |
| --- | --- | --- |
| stage_01_security_route_shell_readiness | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_01_security_route_shell_readiness.md | Prompt 03 accepted package |
| stage_02_admin_users | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_02_admin_users.md | Stage 01 accepted and docs synced/not required |
| stage_03_navigation_operator_shell | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_03_navigation_operator_shell.md | Stages 01-02 accepted and docs synced/not required |
| stage_04_tenants | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_04_tenants.md | Stages 01-03 accepted and docs synced/not required |
| stage_05_dashboard_operations | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_05_dashboard_operations.md | Stages 01-04 accepted and docs synced/not required |
| stage_06_agent_templates_agents | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_06_agent_templates_agents.md | Stages 01-05 accepted and docs synced/not required |
| stage_07_agent_config | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_07_agent_config.md | Stages 01-06 accepted and docs synced/not required |
| stage_08_knowledge_binding | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_08_knowledge_binding.md | Stages 01-07 accepted and docs synced/not required |
| stage_09_capabilities_policy | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_09_capabilities_policy.md | Stages 01-08 accepted and docs synced/not required |
| stage_10_sites_widgets_releases | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_10_sites_widgets_releases.md | Stages 01-09 accepted and docs synced/not required |
| stage_11_conversations_support | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_11_conversations_support.md | Stages 01-10 accepted and docs synced/not required |
| stage_12_usage_metering_billing | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_12_usage_metering_billing.md | Stages 01-11 accepted and docs synced/not required |
| stage_13_e2e_smoke_docs | /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_13_e2e_smoke_docs.md | Stages 01-12 accepted and docs synced/not required |

STAGE_NAME = stage_13_e2e_smoke_docs
STAGE_TZ_PATH = <matching absolute stage TZ path from the table>

Реализуй только выбранный stage `STAGE_NAME` по `STAGE_TZ_PATH`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - PIPELINE_STATE_PATH
   - STAGE_CONSISTENCY_REVIEW_PATH
2. Продолжай только если:
   - `allowed_next_step = 04_stage_implementation`, or this is an explicit
     prompt 04 fix-pass after prompt 05/07 findings;
   - step 03 is complete and accepted;
   - selected `STAGE_NAME` and `STAGE_TZ_PATH` match the stage table;
   - dependency stages are accepted and docs synced/not required, unless this
     is stage 01.
3. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- STAGE_TZ_PATH
- PIPELINE_STATE_PATH
- FUNCTIONAL_CHECKLIST_PATH
- FRONTEND_PRODUCT_BRIEF_PATH
- UI_UX_SPEC_PATH
- FRONTEND_API_REFERENCE_PATH
- FRONTEND_IMPLEMENTATION_PLAN_PATH
- ACCEPTANCE_CHECKLIST_PATH
- STAGE_CONSISTENCY_REVIEW_PATH
- /Volumes/Work/PC/ai_admin_panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/docs/recipes.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- backend docs as read-only supporting context only

Implementation rules:
1. Inspect current owners before editing:
   - `src/core/router/routes.tsx`
   - `src/core/auth`
   - `src/core/api`
   - `src/shared/ui/AppShell`
   - `src/modules`
2. Reuse existing owners/components/hooks where they fit.
3. Create new modules only under `src/modules/<Domain>/{api,model,pages,ui}`
   with public exports through `index.ts`.
4. Implement only selected stage:
   - no future-stage screens/actions;
   - no placeholders that look functional;
   - no frontend-local readiness, policy, billing or pricing calculation;
   - no direct DB/vector/provider/internal backend calls;
   - no direct `apiClient` or DTO mapping in pages/presentational UI;
   - no speculative shared package extraction.
5. Preserve existing auth/security baseline:
   - keep current admin bootstrap on `/api/admin/v1/users/me`;
   - no token storage in browser storage;
   - keep `/` on `/settings` until Stage 05 delivers real dashboard;
   - `/security` must be real, not redirect-only.
6. If backend contract ambiguity appears, record blocker/open question instead
   of inventing product behavior.
7. Add/update focused tests for route behavior, API mapping, guards,
   permissions, confirmations and regression-sensitive states from selected
   stage TZ.
8. Run relevant checks from repo root:
   - `npm run test:admin`
   - `npm run lint:admin`
   - `npm run build:admin`
   Narrower checks require justification in PIPELINE_STATE_PATH.
9. Update PIPELINE_STATE_PATH:
   - selected stage implemented/fix-pass result;
   - changed files;
   - reuse/new ownership decisions;
   - commands run;
   - blockers/deferred items;
   - set `allowed_next_step = 05_stage_acceptance_review` for selected stage.

Final response:
- what was implemented;
- selected stage/fix-pass scope;
- boundaries preserved;
- reuse/new ownership decisions;
- tests/checks run;
- blockers/deferred items;
- final status: `Stage ready for acceptance review`, `Ready with documented deferred items`, or `Blocked`.
```

