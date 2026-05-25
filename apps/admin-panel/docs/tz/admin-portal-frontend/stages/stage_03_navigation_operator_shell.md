# Stage 03: Navigation And Operator Shell Expansion

Status: `ready-for-stage-implementation`

## Goal

Prepare the operator shell for the Admin Portal journey while showing only real,
implemented destinations.

## Dependencies

- Stages 01 and 02 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Refine AppShell navigation groups for implemented routes only.
- Add role/permission-aware visibility for existing implemented entries.
- Add current admin summary and responsive/collapsed behavior polish.
- Add tenant/agent context slots only if they do not display unavailable future
  actions or fake data.
- Preserve `/settings`, `/security` and `/admins`.

## Out Of Scope

- New domain routes such as Tenants, Agents, Dashboard, Billing or Releases.
- Placeholder links, disabled future menus or marketing-style shell redesign.
- Backend API changes.

## Routes / Navigation Impact

- No new product route is required by this stage.
- Visible groups may include only implemented destinations:
  Settings, Security and Admin Users.
- Future groups from the UI/UX spec stay absent until their route stage ships.

## Module / File Ownership

- `src/shared/ui/AppShell` owns navigation rendering and responsive behavior.
- `src/core/router` owns route metadata only when needed.
- Domain modules remain owners of their pages and labels.
- Shared UI primitives may be extended only for shell needs.

## Reuse Rules And Responsibility Boundaries

- Navigation state must derive from route definitions/auth permissions, not
  duplicated hard-coded permission stores.
- No `apiClient` calls from shell UI.
- Avoid moving domain behavior into AppShell.
- No direct DB/vector/provider calls.

## API Contracts

- No new API is introduced.
- Existing current admin data comes from auth bootstrap:
  `GET /api/admin/v1/users/me`.

## UI/UX States

- Expanded and collapsed sidebar/header states are stable at narrow widths.
- Active route state is clear.
- Long labels do not wrap into broken multi-line controls.
- Unauthorized or unavailable destinations are absent or permission-disabled
  only when backend supports an explicit disabled state.

## Access / Security Requirements

- Shell must not leak links or route names unavailable to the current admin.
- Protected route guard remains the authority for access.
- No token storage changes.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Visual/manual verification of collapsed and expanded shell at desktop and
  narrow widths.

## Docs Impact

- Update shell/navigation recipes after acceptance if behavior changed.

## Acceptance Criteria

- Navigation remains useful and uncluttered.
- No future-stage links appear.
- Shell compression no longer causes broken wrapping.
- Existing routes remain reachable and protected.

## Future-Stage Forbidden Actions

- Do not implement Tenants, Dashboard, Agents or other domain pages.
- Do not introduce disabled placeholders for future stages.
- Do not create duplicate navigation permission logic.

## Expected Gate Result

- Prompt 03 verifies that shell changes are stage-local and do not skip ahead.
- Prompt 04 may implement Stage 03 only after Stages 01 and 02 are accepted.
