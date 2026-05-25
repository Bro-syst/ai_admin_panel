# Prompt 03: Stage TZ Consistency Review

## Purpose

Use this after prompt `02` creates stage `TZ` files or records one-stage mode.

The goal is to verify that stage `TZ` files fully cover umbrella scope, preserve
architecture and do not create duplicate work or unsafe gaps.

Do not write runtime code in this step.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_OUTPUT_DIR = {STAGE_OUTPUT_DIR}

Проведи consistency review stage package из `{STAGE_OUTPUT_DIR}` против umbrella frontend ТЗ `{FRONTEND_TZ_PATH}`.

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Проверь, что `allowed_next_step` указывает на prompt `03`; если нет,
   остановись со статусом `Blocked`.
4. Продолжай только если step 02 имеет статус `Stage TZ package created` или
   `One-stage decision recorded`.
5. Проверь, что stage list in ledger matches files in `{STAGE_OUTPUT_DIR}`.
6. Если gate не пройден, stage files missing, or `blocked_findings` remain,
   остановись со статусом `Blocked`.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- все stage `TZ` из `{STAGE_OUTPUT_DIR}`;
- root docs and target app docs;
- backend materials only as read-only supporting context.

Что нужно сделать:
1. Построить coverage map:
   - umbrella requirement;
   - stage that covers it;
   - affected owners/files;
   - test/regression coverage expected.
2. Проверить completeness:
   - no lost umbrella requirements;
   - open questions/deferred items preserved;
   - docs/test expectations preserved.
3. Проверить minimality:
   - no duplicate implementation responsibility;
   - no artificial split of tightly coupled work;
   - stage order follows dependencies.
4. Проверить runtime safety:
   - no stage leaves dangerous half-wired UI;
   - no future-stage UI/actions implemented or required early;
   - accepted baseline flows remain working after each stage.
5. Проверить architecture:
   - app/core/modules/shared boundaries;
   - module ownership;
   - no deep imports into other modules;
   - no business logic in shared;
   - no feature layer expansion in core;
   - no backend DTO logic in pages/UI;
   - no duplicate source of truth;
   - no unjustified app-wide providers/global state.
6. Проверить engineering principles:
   - existing code is reused where appropriate;
   - new abstractions are justified by real complexity or repetition;
   - responsibilities are cohesive and separated;
   - stage design does not force later cleanup to become safe;
   - no repeated DTO mapping, validation logic or state orchestration appears
     across stages;
   - tests are assigned to the owner closest to the behavior.
7. Проверить app boundary:
   - selected `TARGET_APP` does not receive scope of another app;
   - cross-app changes are explicit and justified;
   - shared package extraction is not speculative.
8. If findings exist:
   - update umbrella/stage `TZ` files as needed;
   - do not change runtime code;
   - update pipeline state.
9. If no blocking findings remain, update `PIPELINE_STATE_PATH`:
   - status of step 03;
   - per-stage readiness for implementation;
   - `allowed_next_step = 04_stage_implementation`;
   - optional `08_generate_adapted_execution_prompts` allowed after this point.
10. В финале дай findings first:
   - issue;
   - file/section;
   - risk;
   - fix applied or required.
11. Then summary:
   - coverage result;
   - stage order result;
   - architecture result;
   - engineering/reuse result;
   - updated files;
   - next step;
   - итоговый статус: `Stage package ready for implementation` / `Ready with documented deferred items` / `Blocked`.

Важно:
- Runtime-код не писать.
- Нельзя принимать stage package with gaps, duplicate work or scope drift.
- If one-stage mode is recorded, verify that the single stage is still explicit enough for implementation and acceptance.
```
