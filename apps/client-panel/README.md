# Client Panel

React/Vite client portal template copied from `/Volumes/Work/DV/ web_kassa/front` and reduced to reusable application infrastructure.

The app keeps the parts that define how the frontend is built:

- login and registration;
- email verification callback and account verification reminders;
- auth bootstrap, refresh, logout and session management;
- TOTP enrollment, confirmation, disable and recovery;
- API client with CSRF, locale, auth and request id interceptors;
- theme and language providers;
- authenticated app shell with empty inner workspace;
- docs that describe the architecture and recipes.

Business modules from the source portal were intentionally not copied into the client scope: cashdesks, orders, settlements, compliance, cashier workspace, users and dashboards.

## Quick Start

From the repository root:

```bash
npm install
npm run dev:client
```

The default dev URL is:

```text
http://127.0.0.1:5174/
```

The Vite proxy points `/api` and `/auth` to the backend:

```bash
CLIENT_PANEL_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:client
```

## Commands

```bash
npm run test:client
npm run lint:client
npm run build:client
```

## App Docs

- [Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development-guide.md)
- [Recipes](docs/recipes.md)
