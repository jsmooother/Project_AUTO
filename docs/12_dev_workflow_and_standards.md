# Dev Workflow and Standards

## Naming consistency
- **Package scope:** Use `@repo/*` for all workspace packages (e.g. `@repo/db`, `@repo/shared`). Use this consistently in docs, scripts, and imports.
- Do **not** introduce `@ib/*` or another scope unless you explicitly rename the whole monorepo.

## Language
- Node.js + TypeScript

## Quality rules
- All jobs emit run_events at each stage.
- Every job must be idempotent.
- Strict input validation (zod).
- Errors must map to event_code taxonomy.

## Coding standards
- Use explicit types, no any.
- Prefer small modules:
  - queue/
  - storage/
  - scraper/
  - meta/
  - templates/
  - ops/

## CI (minimal)
- lint
- typecheck
- unit tests for parsers and diff logic

## Environments
- local: docker-compose for API/worker/redis
- staging: Railway + Supabase project
- prod: Railway + Supabase prod