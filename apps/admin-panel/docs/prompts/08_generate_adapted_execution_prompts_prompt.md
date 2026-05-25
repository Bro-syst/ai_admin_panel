# Prompt 08: Generate Adapted Execution Prompts

## Purpose

Use this after prompt `03` accepts the stage package. It creates task-specific
copies of prompts `04`, `05`, `06` and `07` with real paths, stage names, gates
and stage order already filled in.

This prompt exists to minimize manual edits when agents implement a concrete
umbrella `TZ`.

Do not write runtime code in this step.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_OUTPUT_DIR = {STAGE_OUTPUT_DIR}
PROMPT_OUTPUT_DIR = {PROMPT_OUTPUT_DIR}

Создай adapted execution prompt package для конкретного umbrella frontend ТЗ `{FRONTEND_TZ_PATH}`.

Нужно сгенерировать task-specific prompts на основе canonical prompts:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/04_stage_implementation_prompt.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/05_stage_acceptance_review_prompt.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/06_stage_docs_sync_prompt.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/07_umbrella_finalization_prompt.md`

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Продолжай только если step 03 имеет статус `Stage package ready for implementation` или `Ready with documented deferred items`.
4. Проверь, что `allowed_next_step` is prompt `04` or that pipeline state
   explicitly marks prompt `08` as optional after prompt `03`.
5. Если stage package отсутствует или inconsistent, верни `Blocked` и отправь
   задачу к prompt 03.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- all stage `TZ` files from `{STAGE_OUTPUT_DIR}`;
- `PIPELINE_STATE_PATH`;
- canonical prompts 04/05/06/07;
- target app docs.

Что нужно сделать:
1. Определить execution model:
   - one-stage;
   - staged implementation.
2. Считать stage list from pipeline state and stage files.
3. Создать files in `{PROMPT_OUTPUT_DIR}`:
   - `04_stage_implementation__<stage_slug>.md` for each stage, or one reusable stage-selected prompt with a clear stage table;
   - `05_stage_acceptance_review__<stage_slug>.md` for each stage, or one reusable stage-selected prompt;
   - `06_stage_docs_sync__<stage_slug>.md` for each stage, or one reusable stage-selected prompt;
   - `07_umbrella_finalization.md`.
4. В каждом generated prompt заполнить:
   - `TARGET_APP`;
   - `BACKEND_TZ_PATH`;
   - `BACKEND_SUPPORTING_DOCS`;
   - `FRONTEND_TZ_PATH`;
   - `PIPELINE_STATE_PATH`;
   - `STAGE_NAME`;
   - `STAGE_TZ_PATH`;
   - `STAGE_OUTPUT_DIR`, где нужно.
5. В каждом generated prompt добавить header:
   - source of truth;
   - stage order;
   - previous gate required;
   - next gate;
   - exact commands expected for target app.
6. Generated implementation prompts must say:
   - implement only selected stage;
   - no future-stage UI/actions;
   - no scope expansion;
   - return to prompt 05 after implementation.
7. Generated review prompts must say:
   - do not edit code by default;
   - findings first;
   - if blocked, return to prompt 04 fix-pass.
8. Generated docs prompts must say:
   - run only after stage accepted;
   - do not hide blockers.
9. Generated finalization prompt must say:
   - require accepted status and docs sync for every stage;
   - block if any stage gate missing.
10. Do not modify runtime code.
11. Do not reset real paths to placeholders.
12. Update `PIPELINE_STATE_PATH` with generated prompt paths, but do not change
    the required implementation gate from prompt `04`.
13. В финале дай:
    - generated prompt files;
    - stage coverage;
    - variables filled;
    - next step;
    - итоговый статус: `Adapted prompt package created` / `Blocked`.

Важно:
- This prompt generates execution prompts; it does not execute them.
- Generated prompts must not contradict canonical pipeline gates.
- Do not generate prompts that make agents repeat stage decomposition or consistency review.
```
