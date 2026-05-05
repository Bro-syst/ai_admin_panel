# Implementation Recipes

Use these recipes as the practical reference for building the app in the same style as the template.

## Add A New Page Module

1. Create a module in `src/modules/<ModuleName>`.
2. Add `pages/<ModuleName>Page.tsx`.
3. Export the page from `src/modules/<ModuleName>/index.ts`.
4. Register the route in `src/core/router/routes.tsx` with a lazy import from the module public API.
5. Add navigation in `AppShell` only after the page is real and usable.
6. Add a page/component test for the happy path and the main empty/error state.

Recommended shape:

```text
src/modules/Users/
  index.ts
  api/
  model/
  ui/
  pages/
```

## Add An API Call

1. Put the request in `src/modules/<ModuleName>/api`.
2. Define backend payload types next to the request.
3. Map backend payloads to frontend models before returning from the API layer.
4. Use `apiClient`; do not import `axios` in pages or UI.
5. Add a mapping test when the backend shape is nested, optional, or security-sensitive.

Pattern:

```ts
const PREFIX = '/api/v1/users'

type UserPayload = {
  id?: string
  email?: string
}

export type User = {
  id: string
  email: string
}

function mapUser(payload: UserPayload): User {
  if (!payload.id || !payload.email) throw new Error('Invalid users response')
  return {
    id: String(payload.id),
    email: String(payload.email),
  }
}
```

## Add Scenario Logic

1. Keep orchestration in `src/modules/<ModuleName>/model`.
2. Keep rendering-only components in `ui`.
3. Let `pages` compose model hooks and UI components.
4. Avoid global state unless the data is infrastructure-wide.

## Add Shared UI

Move UI to `src/shared/ui` only when at least two modules need it or the component is clearly infrastructure-level.

Good shared candidates:
- buttons and icon buttons;
- shell/layout primitives;
- dialogs;
- error support details;
- dividers and basic controls.

Poor shared candidates:
- domain cards used by one module;
- page-specific filters;
- API-aware components.

## Add Auth Or Security Behavior

1. Keep session lifecycle in `src/core/auth`.
2. Keep transport behavior in `src/core/api/interceptors`.
3. Add tests for unauthorized, locked, CSRF, and redirect behavior when touched.
4. Keep sensitive actions backend-driven. The frontend should reflect backend state, not invent security truth.

## Add Text

1. Add message keys to `src/core/i18n/messages.ts`.
2. Use `t('message.key')` in components.
3. Keep English as the complete baseline.
4. Add Russian strings for visible product text that is already stable.

## Delivery Checklist

Before a module or architecture change is considered done:

```bash
npm test
npm run lint
npm run build
```

Also update docs when the change adds a route, module, backend boundary, or repeatable pattern.
