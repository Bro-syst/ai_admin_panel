# Client Panel Overview

`apps/client-panel` is the future user-facing frontend application workspace.

Current scope:

- Vite/React/TypeScript app on port `5174`;
- `/login` with login and registration tabs;
- `/auth/verify-email` email verification handoff;
- `/` authenticated empty home shell;
- `/account` email verification, email change, TOTP and active sessions;
- `/settings` language and theme settings;
- `*` not found page;
- API, auth, i18n, theme and storage infrastructure copied from the portal template.

The app is intentionally empty after authentication. Add product modules only after the client scenario, backend contract and UI states are clear.

## Backend Nuance

On startup the auth provider calls `/api/v1/users/me` through the Vite proxy. If the backend on `127.0.0.1:8000` is not running, the request must fail quickly and the app must become anonymous. The expected browser state is the login page, not an endless `Loading...`.

Keep `VITE_API_TIMEOUT_MS` finite and keep the auth bootstrap catch path. This is part of the template contract.
