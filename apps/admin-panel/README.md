# Admin Panel

React/Vite application for the internal AI Admin Panel.

This app was bootstrapped from the working `aml_portal` frontend and adapted as a clean starting point for the admin product. It keeps the proven auth/settings shell, routing, API client, providers, tests, and app-level documentation recipes.

## Quick Start

From the repository root:

```bash
npm install
npm run dev:admin
```

From this app folder:

```bash
npm install
npm run dev
```

By default the local Vite proxy sends `/api` requests to `http://127.0.0.1:8000`.
Override it when needed:

```bash
AI_ADMIN_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev
```

The API client uses a 5 second timeout by default. This keeps the login screen usable when the backend is not running yet. Override it with:

```bash
VITE_API_TIMEOUT_MS=10000 npm run dev
```

## Commands

```bash
npm test
npm run lint
npm run build
npm run preview
```

## App Docs

- [Overview](docs/overview.md) - current scope and what is included in the admin template.
- [Architecture](docs/architecture.md) - layers, module boundaries, backend boundary, state rules.
- [Development Guide](docs/development-guide.md) - rules for admin-panel development.
- [Recipes](docs/recipes.md) - practical steps for admin modules, routes, API calls, UI, and tests.

## Current Baseline

The first screen after login is `/settings`. New admin sections should be added only when there is a clear user scenario, route, backend contract, and test minimum.
