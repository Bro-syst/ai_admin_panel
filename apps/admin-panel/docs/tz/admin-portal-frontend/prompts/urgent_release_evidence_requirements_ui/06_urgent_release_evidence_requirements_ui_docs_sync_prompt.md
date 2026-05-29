# Prompt 06: Urgent Release Evidence Requirements UI Docs Sync

Use this prompt only after urgent prompt 05 accepts the urgent stage.

Do not edit runtime code in this step.

```text
Prompt '06_urgent_release_evidence_requirements_ui_docs_sync_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_EVIDENCE_REQUIREMENTS_UI_TZ.md
URGENT_STAGE_NAME = urgent_stage_release_evidence_requirements_ui
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_evidence_requirements_ui.md

Проведи documentation sync после accepted urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_release_evidence_requirements_ui/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 06_urgent_release_evidence_requirements_ui_docs_sync`;
   - urgent stage has `Urgent stage accepted` or
     `Urgent stage accepted with documented deferred items`;
   - there are no unresolved blockers for urgent stage.
3. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- IMPLEMENTED_CHECKLIST_PATH
- URGENT_SOURCE_TZ_PATH
- URGENT_STAGE_TZ_PATH
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- root docs only if workspace/package/multi-app rules changed

Docs sync rules:
1. Reflect only accepted urgent behavior.
2. Do not document future-stage functionality as implemented.
3. Do not edit backend docs.
4. Do not edit runtime code.
5. Update:
   - IMPLEMENTED_CHECKLIST_PATH;
   - app overview/architecture/development-guide/recipes where behavior,
     module map, route ownership or repeatable recipes changed;
   - URGENT_SOURCE_TZ_PATH status;
   - PIPELINE_STATE_PATH.
6. Preserve umbrella as accepted; do not reopen the 13-stage umbrella and do
   not create `stage_14`.
7. Run docs-relevant checks if examples/scripts changed; otherwise record the
   accepted prompt 05 checks.
8. Update PIPELINE_STATE_PATH:
   - urgent docs synced or not required;
   - docs changed;
   - deferred items;
   - blocked findings or `none`;
   - set `allowed_next_step = none`;
   - keep final status accepted unless deferred items remain.

Final response:
- docs updated;
- what was recorded;
- whether docs sync was not required;
- final pipeline step;
- final status: `Urgent stage docs synced`,
  `Docs sync not required`, or `Blocked`.
```
