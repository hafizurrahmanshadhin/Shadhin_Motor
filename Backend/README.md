# Shadhin Motor Admin Static Contract

This Backend folder is a static admin dashboard prepared for future Laravel Blade, Laravel + React Inertia, or API-driven React/Vue conversion.

## Runtime Contract

- HTML owns page data. Static rows, cards, permissions, and modal examples stay in markup so Blade or React can replace them with database records later.
- JavaScript owns behavior only: sidebar, topbar dropdowns, theme, Bootstrap modals, static preview toasts, filters, tabs, searches, and modal prefill.
- Shell behavior uses `data-shell-action` and `data-shell-modal-open` to avoid conflicts with future page-level `data-action` or React component props.
- Page behavior scripts must read existing HTML through IDs, classes, and `data-*` hooks. They should not render database data.
- `assets/js/shared/theme-init.js` must stay in the `<head>` before CSS to prevent a light/dark theme flash.

## Laravel Conversion Map

- Extract the repeated shell into Blade partials: layout, sidebar, topbar, notifications, user dropdown, profile modal, footer, and scripts stack.
- Use `body[data-page]` or an equivalent Inertia page key to keep active sidebar and page-specific scripts isolated.
- Sidebar visibility should come from `*.view` permissions, for example `users.view`, `roles.view`, and `finance.view`.
- Buttons and form actions should be gated by granular keys such as `users.create`, `users.edit`, `users.delete`, and `finance.export`.
- Keep server-side Gates, policies, and middleware as the real enforcement layer. Frontend visibility is only UX.

## Suggested RBAC Tables

- `roles`: id, name, key, status.
- `permissions`: id, module, action, key, label.
- `role_permissions`: role_id, permission_id.
- `users`: role_id plus normal auth fields.
- `user_permissions`: user_id, permission_id, effect (`allow` or `deny`) for direct user exceptions.

## Module Isolation Rules

- Shared shell CSS lives in `assets/css/shared/admin-shell.css`; shared module UI lives in `assets/css/shared/module-pages.css`.
- Large standalone modules can keep their own folder: `assets/js/{module}/page.js`, `assets/js/{module}/modules/controller.js`, and matching CSS.
- New pages should avoid global IDs outside their own page wrapper and modal IDs.
- Load shared scripts first, then the page/module script last.
