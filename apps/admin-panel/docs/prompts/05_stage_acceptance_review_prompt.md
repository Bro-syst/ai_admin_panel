# Prompt 05: Stage Acceptance Review

## Purpose

Use this after prompt `04` to review the implemented stage against its stage
`TZ`, umbrella `TZ`, current code, tests and project architecture.

This is a review step. Do not edit code by default.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_NAME = {STAGE_NAME}
STAGE_TZ_PATH = {STAGE_TZ_PATH}

Проведи acceptance review реализованного stage `{STAGE_NAME}` против `{STAGE_TZ_PATH}` и umbrella ТЗ `{FRONTEND_TZ_PATH}`.

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Проверь, что `allowed_next_step` указывает на prompt `05` for this
   `STAGE_NAME`; если нет, остановись со статусом `Blocked`.
4. Продолжай только если selected stage имеет статус `Stage ready for
   acceptance review` или `Ready with documented deferred items`.
5. Проверь, что `STAGE_NAME`, `STAGE_TZ_PATH`, changed files and commands run
   are recorded for this stage in `PIPELINE_STATE_PATH`.
6. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- `{STAGE_TZ_PATH}`;
- target app architecture/development docs;
- pipeline state;
- backend docs only as supporting cross-check.

Что нужно проверить:
1. Scope fit:
   - selected stage fully implemented;
   - no future-stage scope implemented early;
   - no another-app scope added;
   - no backend-only requirement treated as frontend scope.
2. Runtime behavior:
   - main scenarios from stage `TZ`;
   - loading/empty/error/success states;
   - auth/session/security states if touched;
   - i18n/theme responsiveness if touched;
   - no half-wired actions/routes.
3. Architecture:
   - app/core/modules/shared boundaries;
   - module ownership;
   - no deep imports;
   - API/DTO mapping stays in API/model boundary;
   - UI does not call transport directly;
   - no duplicate source of truth;
   - no speculative package/shared extraction.
4. Engineering quality:
   - existing code was reused or intentionally extended;
   - new abstractions have a clear reason and stable owner;
   - components/hooks/services are cohesive;
   - no avoidable duplication of mapping, validation, state or UI patterns;
   - implementation stays simple enough for the stage and does not create
     cleanup debt for safety.
5. Tests:
   - stage regression-sensitive cases are covered;
   - important API mapping/guard behavior covered;
   - test names and assertions match actual behavior.
6. Docs:
   - docs changed only where needed;
   - docs do not claim future-stage or blocked functionality.
7. Run relevant checks unless already run and recorded in `PIPELINE_STATE_PATH`.
8. Findings first:
   - severity;
   - file/section;
   - issue;
   - risk;
   - required fix.
9. If findings exist, do not fix them here unless user explicitly asks; update
   `PIPELINE_STATE_PATH` with blocked findings and set
   `allowed_next_step = 04_stage_implementation_fix_pass` for this stage.
10. If no findings, update `PIPELINE_STATE_PATH` with stage acceptance result
    and set `allowed_next_step = 06_stage_docs_sync` for this stage.
11. В финале дай:
    - findings first or explicit "findings нет";
    - checks run;
    - architecture/engineering verdict;
    - stage status;
    - next step `06_stage_docs_sync_prompt.md` or prompt 04 fix-pass;
    - итоговый статус: `Stage accepted` / `Stage accepted with documented deferred items` / `Blocked`.

Важно:
- Working screen is not enough if architecture boundaries are broken.
- Do not accept undocumented deferred behavior.
- Do not close umbrella from this prompt.
```
