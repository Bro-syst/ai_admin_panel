# Adapted Prompt 07: Admin Portal Umbrella Finalization

Use this prompt only after every Admin Portal stage is accepted and docs sync is
complete or explicitly not required.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/07_umbrella_finalization_prompt.md`

This is a final review step. Do not edit runtime code by default.

```text
Prompt '07_umbrella_finalization_prompt.md'
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

Проведи финальную приёмку Admin Portal umbrella frontend TZ.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 07_umbrella_finalization`;
   - every stage 01-13 has `Stage accepted` or
     `Stage accepted with documented deferred items`;
   - every stage 01-13 has `Stage docs synced` or `Docs sync not required`;
   - no blocked findings remain.
3. Если любой stage gate отсутствует, unclear, stale or blocked, остановись со
   статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- FUNCTIONAL_CHECKLIST_PATH
- all stage TZ files from STAGE_OUTPUT_DIR
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- /Volumes/Work/PC/ai_admin_panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/docs/recipes.md
- backend docs as read-only cross-check only

Finalization review:
1. Findings first. If no findings, say that explicitly.
2. Verify umbrella coverage:
   - every approved requirement implemented or explicitly deferred;
   - no lost requirement between stages;
   - no duplicate/conflicting implementation.
3. Verify app boundary:
   - `apps/admin-panel` only;
   - no `apps/client-panel` internals;
   - no speculative package extraction.
4. Verify architecture:
   - `core`, `modules`, `shared` boundaries;
   - module public APIs through `index.ts`;
   - API/DTO mapping at api/model boundary;
   - no direct transport calls from pages/UI;
   - no duplicate source of truth;
   - auth/session/security baseline preserved.
5. Verify runtime safety:
   - no half-wired routes/actions;
   - no placeholder flows;
   - no frontend-local readiness/policy/billing/pricing calculations;
   - no direct DB/vector/provider/internal backend calls;
   - public widget runtime identity stays separate from admin cookies.
6. Verify tests/checks:
   - stage checks recorded;
   - final admin gate run or omissions justified:
     - `npm run test:admin`
     - `npm run lint:admin`
     - `npm run build:admin`
7. Verify docs:
   - app docs describe accepted behavior only;
   - docs do not claim blocked/future scope;
   - pipeline state is complete.
8. If findings exist:
   - update PIPELINE_STATE_PATH;
   - route back to prompt 04 fix-pass for the relevant stage;
   - final status `Blocked`.
9. If no findings:
   - update PIPELINE_STATE_PATH final status;
   - set `allowed_next_step = none`;
   - record accepted/deferred scope.

Final response:
- findings first or explicit "findings нет";
- final checks;
- accepted/deferred scope;
- architecture/engineering verdict;
- final status: `Accepted`, `Accepted with documented deferred items`, or `Blocked`.
```

