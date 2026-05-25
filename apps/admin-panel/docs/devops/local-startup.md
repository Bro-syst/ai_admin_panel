# Local Startup

This document describes how to run `apps/admin-panel` locally on this machine.

## Project Location

Repository root:

```text
/Volumes/Work/PC/ai_admin_panel
```

Admin app:

```text
/Volumes/Work/PC/ai_admin_panel/apps/admin-panel
```

Open the repository root in IDEA, not only the app folder. The root contains npm workspaces, root scripts, `package-lock.json`, and sibling apps.

## Install Dependencies

Run from the repository root:

```bash
npm install
```

## Start Admin Panel

Run from the repository root:

```bash
npm run dev:admin
```

Default local URL:

```text
http://127.0.0.1:5173/
```

The root `npm run dev` command also starts `admin-panel` by default:

```bash
npm run dev
```

Prefer `npm run dev:admin` when the repository contains multiple apps and you want the command to be explicit.

## Backend Proxy

In local Vite mode, admin-panel proxies `/api` requests to:

```text
http://127.0.0.1:8008
```

Override the backend target when needed:

```bash
AI_ADMIN_DEV_API_TARGET=http://127.0.0.1:8008 npm run dev:admin
```

The frontend API client also supports:

```bash
VITE_API_BASE_URL=
VITE_API_TIMEOUT_MS=5000
VITE_APP_VERSION=admin-panel-local
```

For local proxy mode, `VITE_API_BASE_URL` is normally empty so browser calls stay same-origin and go through Vite proxy.

## Backend Expectations

The admin-panel uses cookie-based auth and expects backend endpoints under `/api`.

Important auth/security endpoints include:

```text
POST   /api/v1/aml/auth/login
POST   /api/v1/aml/auth/refresh
POST   /api/v1/aml/auth/logout
POST   /api/v1/aml/auth/logout-all
GET    /api/v1/aml/auth/sessions
DELETE /api/v1/aml/auth/sessions/{sessionId}
GET    /api/v1/aml/users/me
GET    /api/v1/aml/auth/totp
POST   /api/v1/aml/auth/totp/enrollment
POST   /api/v1/aml/auth/totp/confirm
POST   /api/v1/aml/auth/totp/disable
POST   /api/v1/aml/auth/password-setup/confirm
POST   /api/v1/aml/auth/password-reset/request
POST   /api/v1/aml/auth/password-reset/confirm
```

The browser sends credentials with API requests. Mutating requests include `X-CSRF-Token` when the backend has set the `wk_aml_csrf` cookie.

## Run Checks

Run admin-only checks from the repository root:

```bash
npm run lint:admin
npm run test:admin
npm run build:admin
```

Run all frontend app checks:

```bash
npm run lint
npm test
npm run build
```

## Production Build Locally

Build only admin-panel:

```bash
npm run build:admin
```

The Vite output is generated inside:

```text
apps/admin-panel/dist
```

Preview the built app locally:

```bash
npm run preview:admin
```

## Common Local Notes

- If backend is not running, auth bootstrap can fail and the app should return to public/auth screens rather than stay on a permanent loading state.
- If login succeeds but later requests fail with `401`, check cookies, backend session configuration, and the `/api/v1/aml/auth/refresh` endpoint.
- If mutating requests fail with CSRF errors, check that backend sets `wk_aml_csrf` and accepts `X-CSRF-Token`.
- If another app is already using port `5173`, stop that process or run Vite with a different port through additional Vite arguments.
