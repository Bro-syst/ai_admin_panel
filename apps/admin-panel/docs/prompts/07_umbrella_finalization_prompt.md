# Prompt 07: Umbrella TZ Finalization

## Purpose

Use this after every stage is accepted and docs sync is complete or explicitly
not required. It performs final acceptance for the whole umbrella frontend `TZ`.

This is a review/finalization step. Do not edit code by default.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_OUTPUT_DIR = {STAGE_OUTPUT_DIR}

Проведи финальную приёмку umbrella frontend ТЗ `{FRONTEND_TZ_PATH}`.

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Проверь, что `allowed_next_step` указывает на prompt `07`; если нет,
   остановись со статусом `Blocked`.
4. Для staged task проверь, что каждый stage имеет:
   - `Stage accepted` или `Stage accepted with documented deferred items`;
   - `Stage docs synced` или `Docs sync not required`.
5. Для one-stage task проверь, что one-stage acceptance and docs sync recorded.
6. Если хотя бы один gate отсутствует, unclear, stale или blocked, остановись
   со статусом `Blocked`.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- all stage `TZ` files from `{STAGE_OUTPUT_DIR}`;
- pipeline state;
- target app docs;
- root docs;
- backend docs only as supporting cross-check.

Что нужно проверить:
1. Umbrella coverage:
   - every approved requirement implemented or explicitly deferred;
   - no lost requirement between stages;
   - no duplicate/conflicting implementation.
2. App boundary:
   - target app scope respected;
   - no another-app internals imported;
   - shared extraction justified only when needed.
3. Architecture:
   - app/core/modules/shared boundaries;
   - module public APIs;
   - API/DTO boundaries;
   - auth/session/security behavior;
   - no speculative providers/global state;
   - no old compatibility adapters unless approved.
4. Engineering quality:
   - stage implementations reuse established owners and patterns;
   - shared/package extraction, if any, has a real second consumer and stable
     public API;
   - no duplicated DTO mapping, state orchestration or validation remains;
   - abstractions introduced by stages are justified and cohesive;
   - code remains maintainable without mandatory post-acceptance cleanup.
5. Runtime safety:
   - no half-wired routes/actions;
   - no placeholder flows;
   - baseline auth/settings/client flows preserved as applicable.
6. Tests/checks:
   - stage checks recorded;
   - final relevant checks run or omissions justified;
   - default final gate:
     - admin-only: `npm run test:admin`, `npm run lint:admin`, `npm run build:admin`;
     - client-only: `npm run test:client`, `npm run lint:client`, `npm run build:client`;
     - cross-app/root: `npm test`, `npm run lint`, `npm run build`.
7. Docs:
   - docs describe accepted behavior;
   - docs do not claim future or blocked scope;
   - pipeline state is complete.
8. Findings first:
   - severity;
   - file/section;
   - risk;
   - required fix.
9. If findings exist, return to prompt 04 fix-pass for the relevant stage, then repeat 05/06/07.
10. If no findings, update `PIPELINE_STATE_PATH` final status and set
    `allowed_next_step = none`.
11. В финале дай:
    - findings first or explicit "findings нет";
    - final checks;
    - accepted/deferred scope;
    - architecture/engineering verdict;
    - итоговый статус: `Accepted` / `Accepted with documented deferred items` / `Blocked`.

Важно:
- Do not use finalization to rewrite history.
- Do not accept blocked/deferred items unless they are explicit and safe.
- Do not edit code by default.
```
