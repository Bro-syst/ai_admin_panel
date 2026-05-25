# Adapted Prompt 02: Admin Portal Decompose Umbrella TZ Into Stages

Use this prompt only after Admin Portal prompt 01 is complete.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/02_decompose_umbrella_tz_into_stages_prompt.md`

Do not write runtime code in this step.

```text
Prompt '02_decompose_umbrella_tz_into_stages_prompt.md'
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

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md
BACKEND_SUPPORTING_DOCS =
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

Разбей Admin Portal umbrella frontend TZ на проверяемые frontend stages.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 02_decompose_umbrella_tz_into_stages`;
   - current status maps to prompt 01 complete, for example
     `step-01-code-grounded-ready-for-decomposition`;
   - `blocked_findings` is empty or `none`;
   - TARGET_APP and FRONTEND_TZ_PATH match this prompt.
3. Если gate не проходит, остановись со статусом `Blocked`.
4. Не переходи к prompt 03, 04 или реализации.

Обязательные документы для чтения:
- FRONTEND_TZ_PATH
- PIPELINE_STATE_PATH
- FUNCTIONAL_CHECKLIST_PATH
- FRONTEND_PRODUCT_BRIEF_PATH
- UI_UX_SPEC_PATH
- FRONTEND_API_REFERENCE_PATH
- FRONTEND_IMPLEMENTATION_PLAN_PATH
- ACCEPTANCE_CHECKLIST_PATH
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

Stage decomposition rules:
1. Use FRONTEND_IMPLEMENTATION_PLAN_PATH as the primary stage-order seed.
2. Use UI_UX_SPEC_PATH and FRONTEND_API_REFERENCE_PATH to keep each stage
   frontend-facing and implementation-ready.
3. Do not copy backend stage history into frontend stage files.
4. Every stage must deliver a visible, testable frontend increment.
5. Every stage must preserve accepted baseline flows.
6. No stage may create duplicate readiness, duplicate auth state, duplicate API
   mapping, or temporary direct backend/internal provider calls.
7. Future-stage UI/actions are forbidden unless disabled and clearly marked as
   unavailable because their stage is not implemented yet.
8. Keep stage count minimal, but do not merge stages that cannot be verified
   independently.

Recommended stage seed:
1. `stage_01_security_route_shell_readiness.md`
2. `stage_02_admin_users.md`
3. `stage_03_navigation_operator_shell.md`
4. `stage_04_tenants.md`
5. `stage_05_dashboard_operations.md`
6. `stage_06_agent_templates_agents.md`
7. `stage_07_agent_config.md`
8. `stage_08_knowledge_binding.md`
9. `stage_09_capabilities_policy.md`
10. `stage_10_sites_widgets_releases.md`
11. `stage_11_conversations_support.md`
12. `stage_12_usage_metering_billing.md`
13. `stage_13_e2e_smoke_docs.md`

You may adjust this list only if the umbrella TZ and implementation plan show a
better minimal split. Explain any adjustment.

Each stage file must contain:
- title and status;
- goal;
- dependencies on previous stages;
- exact scope;
- out of scope;
- routes/navigation impact;
- module/file ownership;
- reuse rules and responsibility boundaries;
- API contracts from FRONTEND_API_REFERENCE_PATH;
- UI/UX states from UI_UX_SPEC_PATH;
- access/security requirements;
- tests and verification commands;
- docs impact;
- acceptance criteria;
- explicit future-stage forbidden actions;
- gate result expected before moving to prompt 03/04.

Update outputs:
1. Create STAGE_OUTPUT_DIR if it does not exist.
2. Create or update stage files in STAGE_OUTPUT_DIR.
3. Update FRONTEND_TZ_PATH stage package section with links to every stage.
4. Update PIPELINE_STATE_PATH:
   - record staged decision;
   - record stage list;
   - record changed files;
   - set `allowed_next_step = 03_stage_tz_consistency_review`;
   - set `optional_next_step = none`;
   - record that prompt 08 remains unavailable until prompt 03 passes.

Final response must include:
- staged or one-stage decision;
- created/updated stage files;
- why the stage count is minimal;
- ownership/reuse boundaries;
- verification model;
- final status: `Stage TZ package created`, `One-stage decision recorded`,
  or `Blocked`.
```

