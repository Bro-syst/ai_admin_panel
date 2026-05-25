# Stage 13: End-To-End Smoke, Evidence And Docs Sync

Status: `ready-for-stage-implementation`

## Goal

Close the Admin Portal frontend umbrella by verifying the full operator journey,
recording evidence and synchronizing shipped documentation.

## Dependencies

- Stages 01-12 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.
- Prompt 05 has accepted every implementation stage before final closure work.

## Exact Scope

- Verify the full flow:
  tenant -> agent -> knowledge/capability/policy -> widget -> release ->
  support/usage/billing.
- Verify auth/session/logout/security baseline still passes.
- Verify no token storage, no direct DB/vector/provider calls and no
  frontend-local readiness/billing calculations.
- Refresh app docs, functional checklist and pipeline evidence to match shipped
  behavior.
- Prepare prompt 07 umbrella finalization inputs.

## Out Of Scope

- New product functionality.
- Backend/product docs edits unless an accepted docs-sync/finalization prompt
  explicitly allows them.
- Large refactors unrelated to final evidence.

## Routes / Navigation Impact

- No new product routes.
- Verify all implemented routes are reachable, protected, localized and
  permission-aware.
- Verify no placeholder/future links remain.

## Module / File Ownership

- Existing module owners keep their domains.
- Documentation updates are limited to `apps/admin-panel/docs` and accepted
  frontend TZ package files unless finalization explicitly expands scope.
- Pipeline state records evidence and remaining risks.

## Reuse Rules And Responsibility Boundaries

- Do not move domain behavior while collecting evidence.
- Do not introduce shared package extraction.
- Do not alter API mapping except for verified bug fixes that belong to the
  affected module.

## API Contracts

- No new endpoint contracts.
- Smoke must cover representative contracts from previous stages and confirm
  portal read models remain primary.

## UI/UX States

- Verify loading, empty, error, permission-disabled and confirmation states
  across representative shipped screens.
- Verify responsive shell behavior and route context preservation.
- Verify localization coverage for visible shipped text.

## Access / Security Requirements

- Protected routes deny anonymous users.
- Mutating requests use CSRF through existing transport.
- Public widget smoke identity remains separate from admin cookies.
- No secrets/internal prompts/provider credentials are exposed unless backend
  marks fields support-safe.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Add or run end-to-end/manual smoke evidence for the full operator journey.
- Run repository searches for forbidden direct calls and placeholder routes.

## Docs Impact

- Sync `apps/admin-panel/docs` route/module/recipe docs to shipped behavior.
- Update `FUNCTIONAL_CHECKLIST.md` evidence states.
- Update `pipeline_state.md` with final stage evidence and prompt 07 readiness.

## Acceptance Criteria

- Full operator journey is verified.
- All accepted baseline flows still pass.
- Documentation describes shipped behavior only.
- Prompt 07 can finalize the umbrella without open frontend-blocking questions.

## Future-Stage Forbidden Actions

- Do not add new domain functionality during final smoke/docs sync.
- Do not skip accepted stage gates.
- Do not rewrite backend history into frontend docs.

## Expected Gate Result

- Prompt 03 verifies this final stage is evidence/docs-only.
- Prompt 04 may implement Stage 13 only after Stages 01-12 are accepted.
- Prompt 07 remains unavailable until Stage 13 passes prompt 05 and docs sync
  passes prompt 06.
