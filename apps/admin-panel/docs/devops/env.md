# Environment Variables

Placeholder for admin-panel environment variable documentation.

Initial known values:

| Variable | Scope | Default | Purpose |
| --- | --- | --- | --- |
| `AI_ADMIN_DEV_API_TARGET` | local dev server | `http://127.0.0.1:8000` | Vite proxy target for `/api`. |
| `VITE_API_BASE_URL` | browser runtime | empty | Optional API base URL. Empty means same-origin. |
| `VITE_API_TIMEOUT_MS` | browser runtime | `5000` | API request timeout. |
| `VITE_APP_VERSION` | browser runtime | `web-1.0.0` | Value sent in `x-app-version`. |

TODO: document production values, secrets policy, and per-environment examples.
