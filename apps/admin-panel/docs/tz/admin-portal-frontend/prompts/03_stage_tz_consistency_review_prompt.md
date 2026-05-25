# Adapted Prompt 03: Admin Portal Stage TZ Consistency Review

Use this prompt only after Admin Portal prompt 02 has created the stage TZ
package.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/03_stage_tz_consistency_review_prompt.md`

Do not write runtime code in this step.

```text
Prompt '03_stage_tz_consistency_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md

FRONTEND_PRODUCT_BRIEF_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FRONTEND_PRODUCT_BRIEF.md
UI_UX_SPEC_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_UI_UX_SPEC.md
FRONTEND_API_REFERENCE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_API_REFERENCE.md
FRONTEND_IMPLEMENTATION_PLAN_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_PLAN.md
ACCEPTANCE_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_ACCEPTANCE_CHECKLIST.md

STAGE_OUTPUT_DIR = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages
STAGE_FILES =
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_01_security_route_shell_readiness.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_02_admin_users.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_03_navigation_operator_shell.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_04_tenants.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_05_dashboard_operations.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_06_agent_templates_agents.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_07_agent_config.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_08_knowledge_binding.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_09_capabilities_policy.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_10_sites_widgets_releases.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_11_conversations_support.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_12_usage_metering_billing.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_13_e2e_smoke_docs.md

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md
BACKEND_SUPPORTING_DOCS =
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

Проведи consistency review stage package из STAGE_OUTPUT_DIR против umbrella
frontend TZ и архитектурных принципов Admin Portal.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - PIPELINE_STATE_PATH
2. Normal first-run mode: продолжай только если:
   - `allowed_next_step = 03_stage_tz_consistency_review`;
   - current status maps to prompt 02 complete, for example
     `step-02-stage-tz-package-created`;
   - step 02 status is complete and output is `stages/*.md`;
   - `blocked_findings` is empty or `none`;
   - TARGET_APP, FRONTEND_TZ_PATH and STAGE_OUTPUT_DIR match this prompt.
3. Explicit repeat-audit mode: если пользователь явно просит повторить prompt
   03 after it already passed, продолжай только если:
   - current status maps to prompt 03 accepted, for example
     `step-03-stage-package-ready-for-implementation`;
   - `allowed_next_step = 04_stage_implementation`;
   - `optional_next_step = 08_generate_adapted_execution_prompts`;
   - step 02 and step 03 statuses are complete;
   - `blocked_findings` is empty or `none`;
   - TARGET_APP, FRONTEND_TZ_PATH and STAGE_OUTPUT_DIR match this prompt.
4. In repeat-audit mode:
   - do not reset `allowed_next_step` back to prompt 03;
   - do not start prompt 04 or prompt 08;
   - update the consistency review and ledger with re-audit findings only.
5. Verify that ledger stage list matches STAGE_FILES and actual files in
   STAGE_OUTPUT_DIR.
6. Если gate не проходит, stage files are missing, or blocked findings remain,
   остановись со статусом `Blocked`.
7. Не переходи к prompt 04, prompt 08 или runtime implementation.

Обязательные frontend документы для чтения:
- FRONTEND_TZ_PATH
- PIPELINE_STATE_PATH
- FUNCTIONAL_CHECKLIST_PATH
- FRONTEND_PRODUCT_BRIEF_PATH
- UI_UX_SPEC_PATH
- FRONTEND_API_REFERENCE_PATH
- FRONTEND_IMPLEMENTATION_PLAN_PATH
- ACCEPTANCE_CHECKLIST_PATH
- every file in STAGE_FILES
- /Volumes/Work/PC/ai_admin_panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/docs/recipes.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md

Backend/product materials are read-only contract cross-check only:
- BACKEND_TZ_PATH
- every file in BACKEND_SUPPORTING_DOCS that exists locally

Required code-grounded context:
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/router/routes.tsx
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/auth/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/api/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/shared/ui/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/

Consistency review tasks:
1. Build a coverage map:
   - umbrella requirement;
   - stage that covers it;
   - affected module/file ownership;
   - expected route/navigation impact;
   - expected tests/regression coverage.
2. Check completeness:
   - no lost umbrella requirements;
   - no lost functional checklist requirements;
   - no lost UI/UX states or API contracts;
   - open questions/deferred items preserved instead of guessed.
3. Check stage minimality and order:
   - 13-stage decision is still minimal;
   - no duplicate implementation responsibility;
   - no artificial split of tightly coupled work;
   - dependencies are explicit and ordered;
   - every stage delivers a visible, testable frontend increment.
4. Check runtime safety:
   - each stage preserves accepted baseline flows;
   - no stage leaves dangerous half-wired UI;
   - no future-stage UI/actions are required early;
   - future-stage entries are absent unless explicitly disabled and safe;
   - authenticated `/` remains `/settings` until real Dashboard stage.
5. Check architecture:
   - app/core/modules/shared boundaries;
   - new modules use `src/modules/<Domain>/{api,model,pages,ui}`;
   - public exports through module `index.ts`;
   - no deep imports into other feature modules;
   - no business logic in shared UI;
   - no feature-layer expansion in core;
   - no backend DTO mapping in pages/UI;
   - no duplicate source of truth;
   - no speculative shared package extraction;
   - no unjustified app-wide providers/global state.
6. Check Admin Portal hard boundaries:
   - internal operator console only;
   - not customer portal;
   - not generic CRUD admin;
   - main flow remains tenant -> agent -> knowledge/capability/policy ->
     widget -> release -> support/usage/billing;
   - existing login/session/logout, `/users/me`, settings/security/TOTP,
     password setup/reset, AppShell/theme/locale/providers, CSRF and backend
     error fallback handling remain accepted baseline.
7. Check frontend/backend responsibility:
   - portal read models are primary source for summary screens;
   - no frontend-local readiness calculation;
   - no frontend-local billing/pricing calculation;
   - no direct DB/vector/provider/internal backend calls;
   - public widget smoke never uses admin cookies as visitor identity.
8. Check engineering principles:
   - existing code is reused where appropriate;
   - new abstractions are justified by real complexity or local pattern;
   - responsibilities are cohesive and separated;
   - stage design does not force later cleanup to become safe;
   - no repeated DTO mapping, validation logic or state orchestration appears
     across stages;
   - tests are assigned to the owner closest to the behavior.
9. If findings exist:
   - update umbrella/stage TZ files as needed;
   - update frontend-facing package docs only if they drift from the accepted
     consistency correction;
   - do not change runtime code;
   - update PIPELINE_STATE_PATH with findings, fixes and changed files.
10. If no blocking findings remain, update PIPELINE_STATE_PATH:
   - status of step 03;
   - per-stage readiness for implementation;
   - changed files;
   - blocked findings or `none`;
   - set `allowed_next_step = 04_stage_implementation`;
   - set `optional_next_step = 08_generate_adapted_execution_prompts`.
11. In repeat-audit mode, preserve the already accepted next-step fields:
    - keep `allowed_next_step = 04_stage_implementation`;
    - keep `optional_next_step = 08_generate_adapted_execution_prompts`;
    - append a dated repeat-audit note instead of rewriting prompt 03 history.

Suggested validation commands:
- `rg --files apps/admin-panel/docs/tz/admin-portal-frontend/stages`
- `rg -n "apiClient|readiness|billing calculation|direct DB|vector|provider|placeholder|future-stage|/settings\\?tab=security|/api/admin/v1/users/me|/api/admin/v1/auth/me" apps/admin-panel/docs/tz/admin-portal-frontend`
- `rg -n "apiClient" apps/admin-panel/src/modules apps/admin-panel/src/shared/ui apps/admin-panel/src/core`
- `git diff --check -- apps/admin-panel/docs/tz/admin-portal-frontend`

Final response must be findings-first:
- issue;
- file/section;
- risk;
- fix applied or required.

Then include:
- coverage result;
- stage order/minimality result;
- architecture result;
- engineering/reuse result;
- updated files;
- open questions or `none`;
- whether prompt 04 is allowed;
- whether optional prompt 08 is now allowed;
- final status: `Stage package ready for implementation`,
  `Ready with documented deferred items`, or `Blocked`.

Важно:
- Runtime-код не писать.
- Нельзя принимать stage package with gaps, duplicate work or scope drift.
- Нельзя начинать prompt 04 или prompt 08 в этом шаге.
```
