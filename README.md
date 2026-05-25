# ai_admin_panel frontends

Frontend monorepo for AI Admin Panel products.

The repository is structured for multiple frontend applications. The first app is the admin panel in `apps/admin-panel`; future products such as a user site or customer cabinet should be added as sibling apps under `apps/`.

## Structure

```text
apps/
  admin-panel/        # Current AI Admin Panel React/Vite app
  client-panel/       # User-facing React/Vite app workspace

packages/             # Shared frontend libraries when reuse is proven
docs/                 # Repository-level architecture and recipes
tsconfig.base.json    # Shared TypeScript baseline
package.json          # Workspace scripts and package registry
```

Admin-panel-specific docs live in `apps/admin-panel/docs/`.

## Quick Start

```bash
npm install
npm run dev:admin
npm run dev:client
```

By default the admin panel local Vite proxy sends `/api` requests to `http://127.0.0.1:8000`.
Override it when needed:

```bash
AI_ADMIN_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:admin
```

The admin API client uses a 5 second timeout by default, so the login screen remains usable when the backend is not running yet:

```bash
VITE_API_TIMEOUT_MS=10000 npm run dev:admin
```

The client panel runs on port `5174` by default and keeps the auth/security template from the source portal:

```bash
CLIENT_PANEL_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:client
```

Without the backend, client-panel should render `/login` after auth bootstrap instead of staying on `Loading...`.

## Commands

```bash
npm test
npm run lint
npm run build

npm run test:admin
npm run lint:admin
npm run build:admin

npm run test:client
npm run lint:client
npm run build:client
```

## Repository Docs

- [Overview](docs/overview.md) - monorepo purpose and current app map.
- [Local App Startup](docs/local-app-startup.md) - how to choose and run admin-panel or client-panel locally.
- [Architecture](docs/architecture.md) - workspace layout, app/package boundaries, dependency rules.
- [Development Guide](docs/development-guide.md) - daily rules for adding apps and shared code.
- [Recipes](docs/recipes.md) - practical steps for new apps, shared packages, and admin modules.
- App-specific prompt/TZ pipelines live under the owning app docs.

## Admin Panel Docs

- [Admin Overview](apps/admin-panel/docs/overview.md)
- [Admin Architecture](apps/admin-panel/docs/architecture.md)
- [Admin Development Guide](apps/admin-panel/docs/development-guide.md)
- [Admin Recipes](apps/admin-panel/docs/recipes.md)
- [Admin Prompt Pipeline](apps/admin-panel/docs/prompts/README.md)
- [Admin Portal Frontend TZ](apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md)

## Client Panel Docs

- [Client Overview](apps/client-panel/docs/overview.md)
- [Client Architecture](apps/client-panel/docs/architecture.md)
- [Client Development Guide](apps/client-panel/docs/development-guide.md)
- [Client Recipes](apps/client-panel/docs/recipes.md)
