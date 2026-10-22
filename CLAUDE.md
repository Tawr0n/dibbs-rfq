# Interview task workspace

Timed, 50-minute task. A working, tested, narrow solution beats a broad, broken one.

## Layout

- `apps/web` — Next.js (App Router, React, Tailwind). Read `apps/web/AGENTS.md` before writing Next.js code.
- `apps/api` — NestJS (Express, Vitest, oxlint).
- Delete whichever app the task does not need.

## Commands

- `pnpm check` — the gate: format check, lint, typecheck, unit tests across the workspace. Run it before every commit.
- `pnpm --filter <web|api> test` — tests for one app; `pnpm test:e2e` — API e2e tests (supertest).

## How we work

- Before coding, state the plan in 2–5 lines and update `docs/PLAN.md`.
- Build in vertical slices, test-first: one failing test → minimal code → green → commit.
- Test behaviour through public interfaces: HTTP endpoints (supertest) or services for the API, rendered output and user events (Testing Library, `getByRole`) for the web app.
- One commit per slice, Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`).
- Record every non-obvious decision or trade-off as one line in `docs/DECISIONS.md`.

## Code standards

- Strict TypeScript: model unknown input as `unknown` and narrow it; give domain concepts their own types.
- Validate input at the system boundary (Nest DTO + `ValidationPipe`, or a schema on the client) and fail with a meaningful HTTP status and message.
- NestJS: thin controllers; logic lives in injectable services; one feature = one module.
- Next.js: Server Components by default; add `"use client"` only for interactive leaves.
- Name things after the domain of the task; keep functions small and single-purpose.
- Add a dependency only when it clearly saves time, and note it in `docs/DECISIONS.md`.
