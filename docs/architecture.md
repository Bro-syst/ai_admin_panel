# Frontend Architecture For `ai_admin_panel`

## Status

This document fixes the architecture baseline for the AI Admin Panel frontend. The project starts with a proven auth/settings shell and should grow through explicit domain modules.

## What This Frontend Is

`ai_admin_panel` is an internal SPA for AI administration workflows.

The baseline contains:
- login/logout, password setup/reset, and current session bootstrap;
- protected routing;
- application shell;
- API client and interceptors;
- i18n/theme/settings providers;
- `/settings` page;
- current administrator summary, active sessions, and TOTP.

## Current App Map

Active routes:
- `/login` - public login page;
- `/auth/password-setup` - public first-password setup page from backend invite links;
- `/password-setup` - compatible alias for first-password setup;
- `/password-reset/request` - public reset-link request page;
- `/password-reset/confirm` - public new-password page;
- `/` - protected redirect to `/settings`;
- `/settings` - protected settings page;
- `*` - not found page.

The start menu in `AppShell` contains only:
- `Settings`;
- `Log out`.

Current modules:
- `src/modules/Settings` - route-level settings page, current administrator, and active sessions.
- `src/modules/AmlSecurity` - inherited TOTP state/enrollment/disable module. It is the current security baseline and can be renamed later when the backend contract is finalized.

## Layers

- `src/app` - entrypoint, root composition, and app-level wiring.
- `src/core` - API, auth, router, i18n, theme, settings, and shared infrastructure.
- `src/modules` - product/domain modules for the admin panel.
- `src/shared` - UI primitives, shell, icons, storage utilities, and components without domain logic.

Composition root: `src/app/providers/AppProviders.tsx`.

Provider order:
- `ThemeProvider`;
- `I18nProvider`;
- `AppSettingsProvider`;
- `BrowserRouter`;
- `AuthProvider`.

## Growth Rules

New admin sections must be added as separate modules in `src/modules`.

Recommended module shape:

```text
src/modules/Users/
  index.ts
  api/
  model/
  ui/
  pages/
  lib/
  types/
```

Rules:
- route-level pages live in `pages`;
- backend contracts and DTO mapping live in `api`;
- scenario logic and hooks live in `model`;
- domain components live in `ui`;
- the module exports only its public API through `index.ts`;
- `core` must not import `modules`;
- `shared` must not know about product/domain modules.

Route registration for a new module happens in `src/core/router/routes.tsx` through a lazy import from the module public API. Do not deep-import another module's internals from routes.

## Backend Boundary

The frontend treats the backend as the source of truth for:
- auth lifecycle;
- current administrator state;
- permissions/auth state;
- API contracts;
- error semantics;
- security-sensitive actions.

Pages do not call `axios` directly. All requests go through `apiClient` and the API layer of the relevant module.

Shared API client: `src/core/api/apiClient.ts`.

It includes:
- `withCredentials`;
- `x-app-version`;
- request metadata interceptor;
- CSRF interceptor;
- auth interceptor;
- error interceptor.

Auth endpoints currently live in `src/core/auth/authService.ts`, because session lifecycle is platform infrastructure rather than product-domain code.

## Frontend State

Global state is allowed only for infrastructure:
- auth session;
- locale;
- theme;
- app preferences.

Domain state for future screens should stay inside `src/modules/<Domain>/model` until there is a proven reason to lift it.

## Quality Gates

Before considering an architecture change ready, run:
- `npm test`;
- `npm run lint`;
- `npm run build`.

## Baseline Scope

The baseline is complete when it contains the current auth/settings shell, the documented security module, and explicit recipes for adding future modules.
