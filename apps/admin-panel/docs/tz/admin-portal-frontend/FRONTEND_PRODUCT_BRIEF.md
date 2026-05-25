# Admin Portal Frontend Product Brief

Status: `ready-for-implementation-package`

Target app:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`

## Product

Admin Portal is an internal operator console for AI Core platform operations.
It is used by platform admins and operators to provision tenants, configure
agents, connect knowledge/capabilities/policy, prepare widgets and releases,
and inspect support/usage/billing evidence.

It is not:
- a customer self-service portal;
- a generic CRUD admin over database tables;
- a direct DB/vector/provider console;
- a place to implement backend-owned readiness, policy, billing or metering
  logic.

## Main Operator Flow

```text
Login
-> Security
-> Dashboard / Operations
-> Tenant
-> Agent
-> Agent Config
-> Knowledge
-> Capabilities / Policy
-> Site / Widget
-> Release
-> Conversations / Usage / Billing
```

The UI should guide the operator through setup and operation. Each screen should
answer:
- where am I in the tenant/agent setup flow?
- what is ready?
- what is blocked?
- what can I safely do with my role/permissions?
- what backend read model or status produced this state?

## Users And Roles

Frontend role vocabulary:
- `platform_admin`;
- `platform_operator`;
- `platform_viewer`.

If backend returns permissions, action availability uses permissions first and
role inference second. Backend authorization remains the source of truth.

## Existing Frontend Baseline

Already implemented and must be reused:
- login, refresh, logout, logout all;
- current admin bootstrap through `/api/admin/v1/users/me`;
- protected routes;
- AppShell;
- theme, locale and app settings;
- `/settings`;
- current admin summary;
- active sessions list and session revoke;
- password setup/reset;
- TOTP status/enrollment/confirm/disable;
- CSRF header from `ai_core_admin_csrf`;
- backend `error_code` plus compatibility `code` fallback;
- backend mail route aliases `/admin/password-setup` and
  `/admin/password-reset`.

Current routes:
- `/login`;
- `/auth/password-setup`;
- `/admin/password-setup`;
- `/password-setup`;
- `/admin/password-reset`;
- `/password-reset/request`;
- `/password-reset/confirm`;
- `/`;
- `/settings`;
- `*`.

Important code-grounded decisions:
- keep `AuthProvider` bootstrap on `/api/admin/v1/users/me`;
- add `/security` as a real protected page, not as redirect to
  `/settings?tab=security`;
- keep authenticated `/ -> /settings` until `/dashboard` is implemented and
  tested as a real route;
- do not add navigation placeholders.

## Product Principles

- Thin client: display backend-owned state, do not calculate it locally.
- Scenario-first screens, not generic CRUD tables.
- Portal read models are primary for summary screens.
- Mutations and drill-down endpoints are used through module API layers.
- No token storage in browser storage.
- Public widget smoke uses `/api/v1/widget/*` and never admin cookies.
- All destructive or critical actions require confirmation.
- Every screen has loading, empty, ready, error, permission denied and not found
  states.

