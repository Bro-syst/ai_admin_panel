# Admin Portal Frontend API Reference

Status: `ready-for-implementation-package`

This is a frontend-facing reference. It intentionally omits backend stage
history and backend implementation reasoning.

OpenAPI source of truth:
- primary: `GET http://127.0.0.1:8008/openapi.json`;
- compatibility alias: `GET http://127.0.0.1:8008/api/v1/openapi.json`;
- frontend-facing paths below must be checked against OpenAPI before
  implementation, not inferred from frontend route names.

## Global Request Rules

- Base management namespace: `/api/admin/v1`.
- Public widget runtime namespace prefix: `/api/v1/widget/*`.
- Browser management requests use cookies and `withCredentials`.
- Mutating cookie-authenticated management requests include `X-CSRF-Token`
  from `ai_core_admin_csrf`.
- `X-Request-ID` is added by request metadata infrastructure; tenant
  provisioning also sends body `provisioning_correlation_id`.
- Access/refresh tokens are never read from response bodies and never stored in
  browser storage.
- API clients and DTO mapping live in module `api/` or core auth/api owners,
  not pages or presentational UI.

## Error Contract

Frontend error parser must support:
- canonical `error_code`;
- compatibility `code`;
- message/detail fields where returned;
- request/correlation id headers or body fields where returned.

Common UI mappings:
- `401`: refresh once through existing auth interceptor, then anonymous/login;
- `403`: permission denied state;
- `404`: not found state;
- `409`: conflict/idempotency/status conflict state;
- `422`: validation errors on form fields or form-level error;
- `429`: throttled/rate-limited state;
- `5xx` or network failure: backend unavailable/retry state.

## Auth And Current Admin

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/users/me` | Current implemented bootstrap through `AuthProvider`. |
| `GET` | `/api/admin/v1/auth/me` | Canonical equivalent alias; do not switch current code unless a dedicated auth polish stage requires it. |
| `POST` | `/api/admin/v1/auth/login` | Login. |
| `POST` | `/api/admin/v1/auth/refresh` | Refresh current session. |
| `POST` | `/api/admin/v1/auth/logout` | Logout current session. |
| `POST` | `/api/admin/v1/auth/logout-all` | Revoke all current admin sessions. |

Response shape:
- safe `admin` envelope;
- role/permissions/auth state;
- no token handling in frontend.

## Password, Sessions And TOTP

Backend verification:
- verified against live OpenAPI on `2026-05-12`;
- there is no dedicated backend security endpoint under `/api/admin/v1`;
- `/security` is a frontend route/screen only;
- the Security screen must call the existing auth/session/TOTP endpoints below.

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/auth/sessions` | Current admin active sessions. |
| `DELETE` | `/api/admin/v1/auth/sessions/{session_id}` | Revoke one current admin session. |
| `POST` | `/api/admin/v1/auth/password-setup/confirm` | First password setup from token. |
| `POST` | `/api/admin/v1/auth/password-reset/request` | Request reset email. |
| `POST` | `/api/admin/v1/auth/password-reset/confirm` | Confirm new password from token. |
| `GET` | `/api/admin/v1/auth/totp` | Current TOTP state. |
| `POST` | `/api/admin/v1/auth/totp/enrollment` | Start/reissue enrollment. |
| `POST` | `/api/admin/v1/auth/totp/confirm` | Confirm enrollment with `enrollment_id`. |
| `POST` | `/api/admin/v1/auth/totp/disable` | Disable TOTP with current code. |

Frontend notes:
- TOTP manual key/secret is shown only during enrollment and not persisted after
  completion;
- TOTP backend payload uses `status`, `enrollment_id`, `expires_at`, `issuer`,
  `account_label`, and during enrollment only `otpauth_uri` plus
  `manual_setup_key`;
- password setup/reset confirm requests send `new_password` to backend even if
  the UI form field is named `password`;
- password/setup/reset tokens are never displayed after submit.

## Admin Users

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/admins` | List/search/filter admins. |
| `GET` | `/api/admin/v1/admins/{admin_id}` | Safe admin detail. |
| `POST` | `/api/admin/v1/admins` | Create/invite admin. |
| `POST` | `/api/admin/v1/admins/{admin_id}/resend-invite` | Resend invite. |
| `POST` | `/api/admin/v1/admins/{admin_id}/disable` | Disable admin. |
| `POST` | `/api/admin/v1/admins/{admin_id}/enable` | Enable admin. |
| `POST` | `/api/admin/v1/admins/{admin_id}/revoke-sessions` | Revoke target admin sessions. |

Confirmations:
- disable;
- enable;
- revoke sessions.

Safe fields only:
- email;
- display name;
- role;
- status;
- setup/invite/TOTP/session summary;
- created/updated timestamps.

## Tenants

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/system/portal/tenants` | Tenant list read model. |
| `GET` | `/api/admin/v1/system/portal/tenants/{tenant_id}` | Tenant detail read model. |
| `POST` | `/api/admin/v1/system/tenants/provisioning` | Provision customer/service tenant. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/provisioning` | Provisioning status. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/provisioning/audit-summary` | Audit/correlation summary. |
| `PATCH` | `/api/admin/v1/system/tenants/{tenant_id}/provisioning/metadata` | Update allowed provisioning metadata. |
| `PATCH` | `/api/admin/v1/system/tenants/{tenant_id}/provisioning/status` | Update provisioning status where allowed. |
| `PATCH` | `/api/admin/v1/system/tenants/{tenant_id}/status` | Update tenant status where allowed. |
| `POST` | `/api/admin/v1/system/tenants/{tenant_id}/configuration/provision-default` | Provision default config. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/configuration` | Read tenant config. |
| `PUT` | `/api/admin/v1/tenants/{tenant_id}/configuration` | Update approved tenant config. |

Provisioning request v1:
- visible required: `tenant_name`, `external_customer_ref`;
- visible optional: `external_billing_ref`;
- system/default: `provisioning_source = admin_portal`;
- system/default: `requested_status = active`;
- body: `provisioning_correlation_id`;
- body/header: `idempotency_key` where backend contract expects it.

Frontend API/model layer:
- generates `provisioning_correlation_id`;
- generates/reuses `idempotency_key` for retry of same attempt;
- may set `X-Request-ID` to the same correlation id where helper controls
  headers.

## Dashboard And Operations

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/system/platform-settings` | Platform settings read model. |
| `GET` | `/api/admin/v1/system/portal/dashboard` | Dashboard cards and next actions. |
| `GET` | `/api/admin/v1/system/portal/operations` | Operations summary. |

Frontend must not calculate platform health/readiness locally.

## Agents And Templates

Primary portal read models:

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/agents` | Agent list summary. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}` | Agent detail summary. |

Management/drill-down/mutation:

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agent-catalog` | Template/archetype catalog. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents` | Create agent. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents` | Drill-down list if needed. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}` | Drill-down detail if needed. |
| `PATCH` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}` | Edit allowed fields. |
| `PATCH` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/status` | Change status. |
| `PATCH` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/lifecycle` | Change lifecycle. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/setup-checklist` | Setup checklist if not already in portal read model. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/foundation-assessment` | Foundation assessment if needed. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/channel-binding` | Channel binding if needed. |

## Agent Config

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/active` | Active config. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs` | Version list. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}` | Config detail. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/config-drafts` | Create draft. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs` | Create config version. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/validate` | Validate config. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/activate` | Activate version. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/rollback` | Rollback. |

Editable payload groups:
- `identity`;
- `tone_and_language`;
- `goals`;
- `rules`;
- `restrictions`;
- `handoff_policy`;
- `integration_policy`;
- `model_preference`;
- `model_selection_hints`;
- `execution_profile_hints`;
- `compatibility_and_safety`.

## Knowledge And Binding

Primary portal read models:

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge` | Agent knowledge summary. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources` | Source catalog. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources/{source_id}` | Source detail. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/knowledge/release-readiness` | Knowledge readiness. |

Management groups:
- `/api/admin/v1/tenants/{tenant_id}/knowledge/*`;
- `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/knowledge/*`.

Frontend v1 supports:
- source registration;
- document registration;
- indexing start/retry;
- readiness inspection;
- agent binding.

## Capabilities And Policy

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/catalog` | Capability catalog. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments` | Current assignments. |
| `PUT` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments` | Update assignments. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy-profiles/catalog` | Policy profile catalog. |
| `GET` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding` | Current policy binding. |
| `PUT` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding` | Update binding. |
| `POST` | `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding/validate` | Validate binding. |

## Sites, Widgets And Releases

Primary portal read models:

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/sites-widgets` | Sites/widgets summary. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness` | Release readiness. |

Management groups:
- `/api/admin/v1/tenants/{tenant_id}/sites*`;
- `/api/admin/v1/tenants/{tenant_id}/widgets*`;
- `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases*`.

Release UI must support:
- evidence path;
- manual override with `reason_code`, `related_missing_or_failed_items`,
  optional `comment`;
- `gate_mode` and manual override display where returned.

## Public Widget Smoke

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/v1/widget/bootstrap` | Public widget bootstrap smoke. |
| `POST` | `/api/v1/widget/session` | Create public widget session. |
| `GET` | `/api/v1/widget/session` | Read public widget session. |
| `GET` | `/api/v1/widget/chats/{chat_id}/messages` | Read messages. |
| `POST` | `/api/v1/widget/chats/{chat_id}/messages` | Send test message. |
| `GET` | `/api/v1/widget/chats/{chat_id}/messages/{message_id}` | Read message detail. |

Rules:
- never use admin cookies as visitor identity;
- cover invalid widget key, invalid origin, not-ready, throttled and normal
  message-flow states.

## Conversations, Usage And Billing

Primary portal read models:

| Method | Path | Frontend Use |
| --- | --- | --- |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/conversations/runtime-summary` | Runtime support summary. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/usage-metering` | Usage/metering summary. |
| `GET` | `/api/admin/v1/portal/tenants/{tenant_id}/billing-export` | Billing export status. |

Management/drill-down groups:
- `/api/admin/v1/tenants/{tenant_id}/chats*`;
- `/api/admin/v1/tenants/{tenant_id}/usage*`;
- `/api/admin/v1/tenants/{tenant_id}/billing/*`.

Billing mutations:
- permissions first;
- default to `platform_admin` only;
- require confirmation;
- show correlation/result state.
