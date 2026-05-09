# Client Panel Architecture

## Source

The template was extracted from `/Volumes/Work/DV/ web_kassa/front`.

Copied architectural pieces:

- `src/core/api` - Axios client, CSRF, auth, locale, request id and error mapping;
- `src/core/auth` - session bootstrap, login, registration, email verification state, session management and TOTP service;
- `src/core/i18n` - runtime locale, translations and locale switcher;
- `src/core/theme` and `src/theme` - theme provider and design tokens;
- `src/core/storage` - namespaced browser storage keys;
- `src/core/router` - route table and auth guard;
- `src/core/layout` - public shell, app shell, notices and page shell;
- `src/modules/Account` - account security page with TOTP and sessions;
- `src/modules/Settings` - language and theme settings.

Excluded product modules:

- cashdesks;
- cashier workspace;
- compliance;
- dashboard;
- orders;
- settlements;
- users.

## Layers

- `src/app` - root app composition, providers and route-level pages.
- `src/core` - app infrastructure and cross-module contracts.
- `src/modules` - feature modules. Current modules are `Account` and `Settings`.
- `src/shared` - local UI atoms and small utilities.
- `src/theme` - CSS variables and visual tokens.

## Routing

Current routes:

- `/login` - public login and registration;
- `/auth/verify-email` - verification handoff to backend;
- `/` - authenticated empty client workspace;
- `/account` - account, email verification, TOTP and sessions;
- `/settings` - language and theme;
- `*` - not found page.

## Boundaries

The client app must not import internals from `apps/admin-panel`.

Shared code should move to `packages/` only when both apps need the same stable contract. Until then, keep copied template code local to the app so each frontend can evolve without hidden coupling.
