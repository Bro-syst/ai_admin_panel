# Client Panel Architecture

## Status

This app is a lightweight starting point for user-facing flows.

## Layers

- `src/app` - app composition, routes, route-level pages.
- `src/shared` - client-panel local shared UI and utilities.
- `src/theme` - app-level tokens.

Future domain modules should be added under `src/modules/<ModuleName>` when there is a confirmed client scenario.

## Routing

Current routes:
- `/` - client panel home placeholder;
- `*` - not found page.

## Boundaries

The client app should not import internals from `apps/admin-panel`.

Shared code should move to `packages/` only when both apps need the same stable contract.
