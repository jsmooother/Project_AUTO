# Local development: Postgres + Redis (Option A)

All-local development with no cloud services. Use Homebrew for Postgres and Redis.

## 1. Install (copy/paste)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb project_auto

brew install redis
brew services start redis
```

## 2. Verify

```bash
psql postgres -c "select version();"
psql project_auto -c "\dt"
redis-cli ping
```

Expected: Postgres version output, table list (or empty), and `PONG` from Redis.

## 3. Repo steps

From the repo root:

```bash
pnpm install
pnpm db:migrate
pnpm --filter @repo/api dev
```

In a second terminal (also from repo root):

```bash
pnpm --filter @repo/worker dev
```

In a third terminal, run the smoke test:

```bash
./scripts/smoke-test.sh
```

## 4. Local .env template

Create or update `.env` in the repo root with:

```
DATABASE_URL=postgres://localhost:5432/project_auto
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

For all-local development you can omit or leave empty: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, and Meta/vendor keys.

## Optional tools for scripts

If the smoke test or batch script reports missing commands:

```bash
brew install jq
```

`psql` and `redis-cli` are installed with Postgres and Redis above.
