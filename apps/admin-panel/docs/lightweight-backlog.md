# Lightweight Backlog

## Sites And Widgets Screen

Status: in progress

Scope: UI-polish over the existing backend contract. This is not a new pipeline stage and must not change API ownership, readiness source of truth, or public widget runtime behavior.

- Show safe evidence after site creation: action, site id, hostname, allowed origins, status, correlation/request id, and copy controls for safe ids.
- Show safe evidence after widget creation: action, widget id, widget key, site id, agent id, status, correlation/request id, and copy controls for safe ids.
- Avoid alarming missing-field wording. If backend omits optional evidence, use `Not provided by backend` or hide the optional field.
- Select the newly created site in the widget form.
- Disable `Create widget` until a site is selected and widget key is valid.
- Validate allowed origins on the frontend as an early hint only: `http://` or `https://`, no path/query/hash, ports allowed, one origin per line.
- Preview allowed origins as chips before submitting.
- Add widget key format help: lowercase letters, digits, and hyphen.
- Keep next-step banners as guidance only, not frontend-owned readiness.
- Disable no-op status buttons when the site/widget already has that status.
- Keep Public widget test panel driven by a selected/created widget key; do not use dev constants.

Do not:

- Do not hardcode `127.0.0.1:8090` or any local public widget test URL in the portal.
- Do not add an `Open smoke page` action to the working portal.
- Do not make the frontend the source of truth for channel readiness.
- Do not mix backend `base_url` into widget config; local static test pages are outside the operator portal.
