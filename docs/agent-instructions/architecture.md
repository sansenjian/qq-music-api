# Architecture and Layering

## Overview

Use this file when adding or changing API behavior, moving code between layers, or checking whether a change belongs in a service, controller, route, utility, or type module.

## Project Shape

| Path | Role |
| --- | --- |
| `src/app.ts` | Application startup entry |
| `src/index.ts` | Package export entry |
| `src/koaApp.ts` | Koa app composition |
| `src/services/` | QQ Music upstream request and API capability layer |
| `src/controllers/` | HTTP controller layer |
| `src/routes/` | Route registration and API metadata |
| `src/middlewares/` | Koa middleware |
| `src/util/` | Shared utility helpers |
| `src/config/` | Runtime configuration |
| `src/types/` | Shared and global TypeScript types |
| `docs/` | VitePress documentation |
| `tests/` | Unit and integration tests |
| `public/` | Static assets |
| `scripts/` | Maintenance and build scripts |

## Layer Rules

### `src/services/`

- Build upstream QQ Music request parameters.
- Call upstream APIs.
- Perform basic response conversion.
- Return the project's unified response structures.
- Do not read or mutate Koa `ctx`, set HTTP status, or own route-level validation.

### `src/controllers/`

- Read `ctx.query` or `ctx.request.body`.
- Validate request parameters for the HTTP surface.
- Call the corresponding service function.
- Set `ctx.body` and `ctx.status`.
- Do not inline upstream request details that belong in `src/services/`.

### `src/routes/router.ts`

- Register routes and connect them to controllers.
- Keep route semantics stable unless the task explicitly requires an API change.
- Keep API metadata synchronized when route capabilities change.

### `src/util/`

- Put cross-module helpers here, such as response wrappers, cookie helpers, request helpers, logging, and color output.
- Prefer existing helpers before adding a new utility.

## Adding an API

When adding an endpoint, normally update these areas together:

- `src/services/apis/...` for the upstream capability.
- `src/controllers/...` for HTTP controller logic.
- `src/controllers/index.ts` or the relevant export barrel.
- `src/routes/router.ts` for route registration.
- `src/routes/api-metadata.ts` if public API metadata changes.
- `src/types/` when shared public or cross-module types are needed.
- `docs/api/...` and tests when behavior is user-visible.
