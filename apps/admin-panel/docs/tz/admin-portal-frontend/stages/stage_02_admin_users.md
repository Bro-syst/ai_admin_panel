# Stage 02: Admin Users

Status: `ready-for-stage-implementation`

## Goal

Deliver day-2 internal administrator management without changing customer,
tenant or agent product scope.

## Dependencies

- Stage 01 is accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/AdminUsers`.
- Add protected route `/admins`.
- Implement admin list/search/filter, safe detail, invite/create, resend invite,
  disable, enable and revoke target admin sessions.
- Make all actions permission-aware.
- Preserve login/session/security baseline from Stage 01.

## Out Of Scope

- Tenant users or customer portal users.
- Role/permission model invention beyond backend-returned roles/permissions.
- Audit log deep-dive unless returned by safe admin detail.
- Bulk destructive actions.

## Routes / Navigation Impact

- Add `/admins` under the Access navigation group.
- Show the link only when the page is implemented and the current admin can
  access it.
- Do not add future Tenant, Agent, Dashboard or Billing links in this stage.

## Module / File Ownership

- `src/modules/AdminUsers/api` owns endpoint calls and DTO mapping.
- `src/modules/AdminUsers/model` owns filters, forms, confirmations and
  mutation orchestration.
- `src/modules/AdminUsers/pages` owns route composition.
- `src/modules/AdminUsers/ui` owns table, detail and dialog components.
- `src/shared/ui/AppShell` may add the implemented navigation entry.
- `src/core/router` may add the route.

## Reuse Rules And Responsibility Boundaries

- Use existing form, button, dialog, error and empty-state conventions.
- Pages/ui do not call `apiClient`; they consume model hooks.
- Admin role labels are display-only unless backend permissions explicitly
  authorize actions.
- No local permission store beyond current auth state and module model state.

## API Contracts

- `GET /api/admin/v1/admins`
- `GET /api/admin/v1/admins/{admin_id}`
- `POST /api/admin/v1/admins`
- `POST /api/admin/v1/admins/{admin_id}/resend-invite`
- `POST /api/admin/v1/admins/{admin_id}/disable`
- `POST /api/admin/v1/admins/{admin_id}/enable`
- `POST /api/admin/v1/admins/{admin_id}/revoke-sessions`

## UI/UX States

- List supports loading, empty, filtered-empty and error states.
- Create/invite form validates required fields and backend errors.
- Disable, enable, resend invite and revoke sessions require confirmation.
- Detail view shows safe identity, role/status, last login/invite/session
  information where returned.

## Access / Security Requirements

- Internal authenticated admins only.
- Permissions first; default critical mutations to `platform_admin` when
  backend permissions are absent.
- Mutations include CSRF handling through existing API client.
- Do not allow current admin to accidentally disable their own active access
  without explicit backend-supported confirmation state.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover route guard, list states, permission-disabled actions and
  confirmation flows.

## Docs Impact

- Update app docs after stage acceptance if Admin Users route/module ownership
  is shipped.

## Acceptance Criteria

- `/admins` is visible, protected and useful.
- Admin list/detail/actions use backend contracts and localized errors.
- Existing Stage 01 security/auth flows still pass.
- No tenant/customer/agent user management is introduced.

## Future-Stage Forbidden Actions

- Do not add tenant provisioning, customer users or agent ownership flows.
- Do not add navigation placeholders for future stages.
- Do not create duplicate permission or auth state.

## Expected Gate Result

- Prompt 03 verifies API/scope consistency.
- Prompt 04 may implement Stage 02 only after Stage 01 is accepted.
