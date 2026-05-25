# Stage 05: Dashboard And Operations

Status: `ready-for-stage-implementation`

## Goal

Provide an operator overview and operations surface, then move authenticated
root navigation to Dashboard only after the route is real and verified.

## Dependencies

- Stages 01-04 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/Operations`.
- Add `/dashboard` and `/operations`.
- Implement dashboard cards, next actions, platform settings read display and
  operations summary.
- Use backend portal read models for summary data.
- Move authenticated `/` redirect from `/settings` to `/dashboard` only in this
  stage and only after dashboard tests pass.

## Out Of Scope

- Agent creation/configuration.
- Tenant provisioning beyond links to existing Tenants routes.
- Local health/readiness synthesis not returned by backend.
- Billing, conversations and release actions.

## Routes / Navigation Impact

- Add Dashboard and Operations under Overview.
- Authenticated `/` becomes `/dashboard` after verification.
- Keep Settings, Security, Admin Users and Tenants routes working.
- Quick links may point only to implemented routes.

## Module / File Ownership

- `src/modules/Operations/api` owns dashboard/operations/platform settings
  endpoint calls and mapping.
- `src/modules/Operations/model` owns query state and refresh behavior.
- `src/modules/Operations/pages` owns `/dashboard` and `/operations`.
- `src/modules/Operations/ui` owns summary cards and tables.
- `src/core/router` owns root redirect change.
- `src/shared/ui/AppShell` owns navigation additions.

## Reuse Rules And Responsibility Boundaries

- Dashboard is a backend-owned read model display.
- No frontend-local readiness or incident calculation.
- No `apiClient` calls from pages/ui.
- No placeholder cards for unimplemented stages unless backend returns them as
  unavailable and the UI clearly marks them as unavailable.

## API Contracts

- `GET /api/admin/v1/system/platform-settings`
- `GET /api/admin/v1/system/portal/dashboard`
- `GET /api/admin/v1/system/portal/operations`

## UI/UX States

- Dashboard shows loading skeleton, empty/low-data, error and refresh states.
- Operations shows health/status, recent degradation/errors and next actions
  only as backend returns them.
- Quick links preserve context and never route to missing pages.

## Access / Security Requirements

- Protected routes.
- Read-only unless backend introduces explicit safe actions in the referenced
  contract.
- Do not expose internal secrets or provider detail.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover root redirect, route guards, summary mapping, loading/error/empty
  states and quick-link targets.

## Docs Impact

- Update app overview and route docs after acceptance.
- Record root redirect change in pipeline state.

## Acceptance Criteria

- `/dashboard` and `/operations` are real protected pages.
- Authenticated `/` redirects to `/dashboard`.
- Dashboard/operations data comes from backend read models.
- No unimplemented future actions are visible.

## Future-Stage Forbidden Actions

- Do not implement agent, release, usage, billing or support pages.
- Do not calculate operational readiness locally.
- Do not add direct provider/internal service calls.

## Expected Gate Result

- Prompt 03 verifies dashboard contracts and root redirect timing.
- Prompt 04 may implement Stage 05 only after Stages 01-04 are accepted.
