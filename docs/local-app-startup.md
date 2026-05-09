# Local App Startup

This repository contains multiple frontend applications. Choose which one to run by the npm script you start from the repository root.

## Open Project In IDEA

Open the repository root:

```text
/Volumes/Work/PC/ai_admin_panel
```

The root folder contains npm workspaces, shared scripts, `package-lock.json`, and both frontend apps.

Open a specific app folder directly only for quick file browsing. For normal development, use the root folder.

## Applications

| App | Path | Command | Local URL |
| --- | --- | --- | --- |
| Admin panel | `apps/admin-panel` | `npm run dev:admin` | `http://127.0.0.1:5173/` |
| Client panel | `apps/client-panel` | `npm run dev:client` | `http://127.0.0.1:5174/` |

## Run One App

Admin panel:

```bash
npm run dev:admin
```

Client panel:

```bash
npm run dev:client
```

## Run Both Apps

Use two terminal tabs from the repository root.

Terminal 1:

```bash
npm run dev:admin
```

Terminal 2:

```bash
npm run dev:client
```

Then open:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5174/
```

## Backend Proxy

Both apps proxy backend requests to `http://127.0.0.1:8000` by default.

Override the target when needed:

```bash
AI_ADMIN_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:admin
CLIENT_PANEL_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:client
```

## Quality Commands

Run checks for both apps:

```bash
npm test
npm run lint
npm run build
```

Run checks for only admin-panel:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin
```

Run checks for only client-panel:

```bash
npm run test:client
npm run lint:client
npm run build:client
```
