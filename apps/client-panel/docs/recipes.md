# Client Panel Recipes

## Add A Client Route

1. Add a route-level page under `src/app/pages` or `src/modules/<ModuleName>/pages`.
2. Register the route in `src/core/router/routes.tsx`.
3. Wrap private pages in `RequireAuth`.
4. Add or update a focused route test.
5. Update `docs/overview.md` and `docs/architecture.md`.

## Add A Client Module

Recommended shape:

```text
src/modules/Profile/
  index.ts
  api/
  model/
  pages/
  ui/
```

Keep API mapping in `api`, orchestration hooks in `model`, and rendering components in `ui`.

## Add An Authenticated Page

Use the app shell through `RolePageShell` or `AppShell`:

```tsx
import { RolePageShell } from '@/core/layout'

export function ProfilePage() {
  return (
    <RolePageShell title="Profile">
      <div>Profile content</div>
    </RolePageShell>
  )
}
```

Then register it:

```tsx
{
  path: '/profile',
  element: (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
}
```

## Add A Backend Call

Use the shared API client:

```ts
import { apiClient } from '@/core/api/apiClient'

export async function getProfile() {
  const response = await apiClient.get('/api/v1/profile')
  return response.data
}
```

The client already adds cookies, CSRF, locale, request id and app version headers.

## Preserve Auth Bootstrap Behavior

When changing auth startup:

1. Keep `AuthProvider.bootstrap()` catching `/api/v1/users/me` failures.
2. Keep a finite API timeout through `VITE_API_TIMEOUT_MS`.
3. Verify browser behavior without backend on `127.0.0.1:8000`.
4. Expected result: `/login` is visible and the app is not stuck on `Loading...`.

This matters because developers often start only the frontend while shaping UI.
