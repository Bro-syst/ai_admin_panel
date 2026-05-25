# Prompt 02: Decompose Umbrella TZ Into Stages

## Purpose

Use this after prompt `01` produced a reviewed enough umbrella frontend `TZ`.

The goal is to decide whether the work is safe as one stage or should be split
into minimal sequential stage `TZ` files.

Do not write runtime code in this step.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_OUTPUT_DIR = {STAGE_OUTPUT_DIR}

Разбей umbrella frontend ТЗ `{FRONTEND_TZ_PATH}` на этапы или зафиксируй one-stage decision.

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Проверь, что `allowed_next_step` указывает на prompt `02`; если нет,
   остановись со статусом `Blocked`.
4. Продолжай только если prompt 01 завершён статусом `Ready for decomposition`,
   `Ready for one-stage implementation`, or a ledger-specific variant that
   clearly maps to one of those meanings, such as
   `step-01-code-grounded-ready-for-decomposition`, and no
   `blocked_findings` remain.
5. Проверь, что `FRONTEND_TZ_PATH` and `TARGET_APP` in ledger match this prompt.
6. Если статус отсутствует, stale, points to another app/TZ, or `Blocked`,
   остановись и верни статус `Blocked`.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- `BACKEND_TZ_PATH`, если указан;
- `BACKEND_SUPPORTING_DOCS`, если указаны;
- root architecture/development docs;
- docs выбранного `TARGET_APP`.

Что нужно сделать:
1. Выделить полный approved frontend scope:
   - routes/navigation;
   - API/services/DTO mapping;
   - model/hooks/state orchestration;
   - UI/pages/states;
   - i18n/theme/layout;
   - auth/session/access/security;
   - tests;
   - docs.
2. Выделить engineering/reuse constraints from umbrella `TZ`:
   - existing owners each stage must reuse;
   - new owners allowed for each stage;
   - responsibilities that must remain separated;
   - shared/package extraction that is explicitly forbidden or allowed.
3. Оценить one-shot implementation:
   - tight coupling;
   - regression risk;
   - number of runtime areas touched;
   - backend contract uncertainty;
   - ability to verify independently.
4. Если один stage достаточен:
   - создать один stage `TZ`;
   - объяснить why one-stage is safe;
   - не создавать искусственные stages.
5. Если stages нужны:
   - создать минимальное количество последовательных stages;
   - каждый stage должен иметь рабочий проверяемый результат;
   - каждый stage должен сохранять accepted baseline flows;
   - stages не должны дублировать ownership;
   - stages не должны создавать временный duplicate source of truth;
   - stage не должен оставлять dangerous partially wired runtime.
6. Stage file naming:
   - `stage_01_<short_slug>.md`
   - `stage_02_<short_slug>.md`
   - или `TZ-XXX_stage_01_<short_slug>.md`, если у umbrella есть номер.
7. Каждый stage `TZ` должен содержать:
   - цель;
   - exact scope;
   - out of scope;
   - dependencies on previous stages;
   - affected owners/files;
   - reuse/new ownership rules;
   - responsibility boundaries;
   - backend assumptions;
   - UI/i18n behavior;
   - testing requirements;
   - regression-sensitive cases;
   - acceptance criteria;
   - explicit note that future-stage UI/actions are forbidden.
8. Обновить umbrella `TZ` stage package section со ссылками на созданные stage files.
9. Обновить `PIPELINE_STATE_PATH`:
   - one-stage or staged decision;
   - stage list;
   - status of step 02;
   - `allowed_next_step = 03_stage_tz_consistency_review`;
   - optional `08_generate_adapted_execution_prompts` availability is false
     until prompt 03 passes;
   - required next step `03`.
10. В финале дай:
   - one-stage/staged decision;
   - created/updated stage files;
   - why stage count is minimal;
   - ownership/reuse boundaries;
   - verification model;
   - итоговый статус: `Stage TZ package created` / `One-stage decision recorded` / `Blocked`.

Важно:
- Runtime-код не писать.
- Не расширять umbrella scope.
- Не добавлять requirements другого app.
- Не создавать stages ради красоты.
```
