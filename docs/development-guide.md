# Development Guide

## Goal

This document fixes the development rules for `ai_admin_panel`. The project is a clean start for an internal AI administration frontend, so every change should strengthen clear module boundaries instead of turning the app into one large shared surface.

## Principles

1. Scenario first, abstraction second.
2. Layer boundaries must stay visible.
3. Backend contracts do not mix with UI.
4. Reuse moves to `shared` only after real repetition.
5. New product scope is added as a separate module in `src/modules`.

## Current Baseline

The project is considered clean when it contains:
- `src/app`;
- `src/core`;
- `src/shared`;
- `src/modules/Settings`;
- `src/modules/AmlSecurity` as the inherited TOTP/security baseline;
- `docs/architecture.md`;
- `docs/development-guide.md`;
- `docs/overview.md`;
- `docs/recipes.md`.

Start routes:
- `/login`;
- `/auth/password-setup`;
- `/password-setup`;
- `/password-reset/request`;
- `/password-reset/confirm`;
- `/`;
- `/settings`;
- `*`.

Every new route must be tied to a real admin scenario and added through a lazy import from the public `index.ts` of its module.

## Dependency Rules

Allowed:
- `app` imports `core`, `modules`, `shared`;
- `modules` import `core` and `shared`;
- `core` imports `shared`;
- `shared` imports only `shared`.

Forbidden:
- `shared` imports `modules`, `core`, or `app`;
- `core` imports `modules`;
- one module deep-imports internals of another module;
- pages call the transport client directly;
- UI is added without a route, scenario, and module boundary.

## API Rules

- HTTP calls live in module `api/` folders or in `core/api` for shared infrastructure.
- UI works with typed frontend models.
- DTO adaptation happens at the API/model boundary.
- Transport/backend errors go through shared error mapping.
- Mutating endpoints must respect cookie auth, CSRF, and backend security policy.

For a new API contract:
- describe transport payload types next to the API function;
- adapt backend field naming at the boundary;
- cover unstable mapping with tests;
- do not use `axios` directly in `pages` or `ui`.
- keep requests behind the shared API client timeout, so auth bootstrap and screens can recover when the backend is unavailable.

## UI Rules

- `AppShell` owns layout and global navigation only.
- The start menu contains only `Settings` and `Log out`.
- A page component assembles the screen but should not grow into API/model logic.
- Domain components stay inside their module until reuse is proven.

To add a menu item, first add a route and a page-level module. The menu must not contain placeholder sections.

## Module Rules

A new module is created only when there is a confirmed scenario.

Minimum shape:

```text
src/modules/Users/
  index.ts
  api/
  model/
  ui/
  pages/
```

Rules:
- `index.ts` exports only route-level pages and public elements needed outside;
- `pages` assemble screens;
- `model` contains hooks/state orchestration;
- `api` contains requests and mapping;
- `ui` contains domain components without knowledge of app routes.

## Testing Rules

Minimum set for a new module:
- API mapping tests for unstable backend payloads;
- page/component tests for main user scenarios;
- guard/security behavior tests when auth or routing changes;
- regression test for every fixed bug.

Before delivery, run:

```bash
npm test
npm run lint
npm run build
```

## Naming

Use the new identity in user-facing code and docs:
- `ai_admin_panel`;
- `AI Admin Panel`;
- `Admin*` for future domain-neutral administrator entities.

Inherited `Aml*` names may remain only where they are still coupled to the copied backend contract. Rename them as a separate refactor when the replacement backend contract is known.

## Documentation Rules

When a new module is added, update:
- `docs/overview.md` - product scope and route;
- `docs/architecture.md` - module boundary if a new architectural area appears;
- `docs/recipes.md` - reusable implementation steps if the change creates a new repeatable pattern;
- `docs/development-guide.md` - only for new rules, not one-off decisions.
