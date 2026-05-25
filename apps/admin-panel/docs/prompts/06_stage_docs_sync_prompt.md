# Prompt 06: Stage Docs Sync

## Purpose

Use this after prompt `05` accepts a stage. It updates documentation to reflect
the accepted stage result.

Do not use this to hide blocked findings.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_NAME = {STAGE_NAME}
STAGE_TZ_PATH = {STAGE_TZ_PATH}

Проведи documentation sync после acceptance stage `{STAGE_NAME}`.

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Проверь, что `allowed_next_step` указывает на prompt `06` for this
   `STAGE_NAME`; если нет, остановись со статусом `Blocked`.
4. Продолжай только если selected stage имеет статус `Stage accepted` или
   `Stage accepted with documented deferred items`.
5. Если stage blocked or has unresolved findings, остановись. Нельзя закрывать
   blocker через docs sync.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- `{STAGE_TZ_PATH}`;
- target app docs;
- root docs if workspace/package/multi-app rules changed;
- last prompt 05 acceptance result from pipeline state.

Что нужно сделать:
1. Перечитать accepted stage `TZ` and acceptance notes.
2. Determine docs impact:
   - app overview routes/features;
   - app architecture module map/boundaries;
   - development guide rules;
   - recipes if repeatable pattern appeared;
   - root docs only for multi-app/workspace/package changes.
3. Update docs to reflect only accepted stage behavior.
4. Preserve deferred items explicitly if accepted with documented deferred items.
5. Do not document future-stage functionality as implemented.
6. Do not change runtime code.
7. Run docs-relevant checks if docs examples/scripts changed; otherwise at least ensure lint/test status from previous step is recorded.
8. Update `PIPELINE_STATE_PATH`:
   - docs synced or not required;
   - docs changed;
   - deferred items;
   - next stage or finalization readiness;
   - `allowed_next_step = 04_stage_implementation` for the next stage, or
     `allowed_next_step = 07_umbrella_finalization` when all stages are
     accepted and docs synced/not required.
9. В финале дай:
   - docs updated;
   - what was recorded;
   - whether docs sync was not required;
   - next pipeline step;
   - итоговый статус: `Stage docs synced` / `Docs sync not required` / `Blocked`.

Важно:
- Docs sync follows accepted implementation; it does not create acceptance.
- Do not update backend docs.
- Do not update another app's docs unless target scope explicitly includes it.
```
