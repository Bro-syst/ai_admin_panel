# Stage 01: Security Route And Shell Readiness

Status: `ready-for-stage-implementation`

## Goal

Make Security a real protected Admin Portal page and keep the accepted auth,
session, password and shell baseline stable before domain expansion starts.

## Dependencies

- Prompt 01 discovery is complete and unblocked.
- Prompt 03 must accept this stage TZ before prompt 04 implementation.
- Current auth bootstrap through `/api/admin/v1/users/me` remains accepted.

## Exact Scope

- Add protected frontend route `/security`.
- Reuse existing TOTP and active-session panels from current security/settings
  modules.
- Keep `/settings` for general account/app settings.
- Add a real Security navigation item only when the route is implemented.
- Verify login, refresh, logout, logout-all, password setup/reset aliases, CSRF
  headers and backend error fallback handling still work.
- Keep authenticated `/` redirected to `/settings`.

## Out Of Scope

- Admin Users.
- Dashboard route or authenticated `/ -> /dashboard`.
- Broad shell redesign beyond the minimum navigation change.
- Switching current-admin bootstrap from `/users/me` to `/auth/me`.

## Routes / Navigation Impact

- Add `/security` as a protected frontend route.
- Remove any redirect-only `/security -> /settings?tab=security` behavior.
- Show Security navigation as an implemented route.
- Do not show future Admin Users, Tenants, Dashboard or Agent links.

## Module / File Ownership

- `src/core/router` owns route registration and guards.
- `src/shared/ui/AppShell` owns the visible navigation item.
- `src/modules/AdminSecurity` owns TOTP/security UI and model/API reuse.
- `src/modules/Settings` remains owner of general settings UI.
- `src/core/auth` and `src/core/api` may be touched only for regression fixes.

## Reuse Rules And Responsibility Boundaries

- Pages and presentational UI must not call `apiClient` directly.
- Existing security panels should be moved/recomposed only as needed, not
  rewritten.
- Auth state comes from `useAuth`; no duplicate frontend auth store.
- No direct DB, vector DB, provider or internal backend calls.

## API Contracts

Backend verification:
- verified against live OpenAPI on `2026-05-12`;
- OpenAPI is available at `/openapi.json`, with `/api/v1/openapi.json` kept as
  compatibility alias;
- there is no dedicated backend security endpoint under `/api/admin/v1`;
- this stage must not add or require a backend security endpoint;
- `/security` is a frontend page that reuses the already implemented auth,
  session and TOTP endpoints.

- `GET /api/admin/v1/users/me`
- `GET /api/admin/v1/auth/me` remains canonical alias but is not required for
  this stage.
- `POST /api/admin/v1/auth/login`
- `POST /api/admin/v1/auth/refresh`
- `POST /api/admin/v1/auth/logout`
- `POST /api/admin/v1/auth/logout-all`
- `GET /api/admin/v1/auth/sessions`
- `DELETE /api/admin/v1/auth/sessions/{session_id}`
- `GET /api/admin/v1/auth/totp`
- `POST /api/admin/v1/auth/totp/enrollment`
- `POST /api/admin/v1/auth/totp/confirm`
- `POST /api/admin/v1/auth/totp/disable`
- Frontend password setup/reset route aliases stay supported for backend mail
  links.

## UI/UX States

- Security page shows TOTP status, enrollment QR/manual key, confirmation,
  disable confirmation, cooldown/error states and active sessions.
- Session revoke shows loading, success and failure states.
- Empty sessions/TOTP unavailable states are localized.
- Login/auth errors are localized and use backend `error_code` or compatibility
  `code` fallback.

## Access / Security Requirements

- Route is authenticated and internal-operator only.
- Mutating requests include CSRF header when cookie `ai_core_admin_csrf` is
  present.
- Do not store access or refresh tokens in browser storage.
- Permission gaps disable/hide critical actions with explanatory state.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Route tests prove `/security` renders real panels and is not a redirect.
- Regression tests cover auth retry on 401 and security panel actions where
  current test infrastructure supports them.

## Docs Impact

- Update app docs only if route ownership or security recipes change.
- Record accepted route behavior in pipeline state after stage acceptance.

## Acceptance Criteria

- `/security` is a protected, useful page.
- `/settings` still works.
- Existing auth/session/password/TOTP behavior is preserved.
- No future-stage navigation links appear.
- No duplicate auth state or direct `apiClient` calls from pages/ui.

## Future-Stage Forbidden Actions

- Do not implement Admin Users, Tenants, Dashboard, Agents or release flows.
- Do not add placeholders for future routes.
- Do not calculate portal readiness locally.

## Expected Gate Result

- Prompt 03 can verify this stage is implementation-ready.
- After prompt 03 accepts the full package, prompt 04 may implement Stage 01
  only.
