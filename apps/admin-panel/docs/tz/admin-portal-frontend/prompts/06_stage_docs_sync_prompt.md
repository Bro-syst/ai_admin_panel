# Adapted Prompt 06: Admin Portal Stage Docs Sync

Use this prompt only after prompt 05 accepts a selected Admin Portal stage.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/06_stage_docs_sync_prompt.md`

Do not use docs sync to hide blockers.

```text
Prompt '06_stage_docs_sync_prompt.md'
TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
STAGE_OUTPUT_DIR = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md
BACKEND_SUPPORTING_DOCS =
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

STAGE_NAME = stage_13_e2e_smoke_docs
STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_13_e2e_smoke_docs.md


Проведи documentation sync после accepted stage `STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 06_stage_docs_sync` for selected stage;
   - selected stage has `Stage accepted` or
     `Stage accepted with documented deferred items`;
   - there are no unresolved blockers for selected stage.
3. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- STAGE_TZ_PATH
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- root docs only if workspace/package/multi-app rules changed
- last prompt 05 acceptance result from PIPELINE_STATE_PATH

Docs sync rules:
1. Reflect only accepted behavior from selected stage.
2. Do not document future-stage functionality as implemented.
3. Preserve accepted deferred items explicitly.
4. Do not edit backend docs.
5. Do not edit runtime code.
6. Update app docs only where behavior, route ownership, module map or
   repeatable recipes changed.
7. Run docs-relevant checks if examples/scripts changed; otherwise record the
   prompt 05 checks already accepted.
8. Update PIPELINE_STATE_PATH:
   - docs synced or not required for selected stage;
   - docs changed;
   - deferred items;
   - next stage readiness;
   - set `allowed_next_step = 04_stage_implementation` for the next stage, or
     `allowed_next_step = 07_umbrella_finalization` when all stages are
     accepted and docs synced/not required.

Final response:
- docs updated;
- what was recorded;
- whether docs sync was not required;
- next pipeline step;
- final status: `Stage docs synced`, `Docs sync not required`, or `Blocked`.
```

