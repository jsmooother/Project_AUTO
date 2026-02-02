# Local Dev Setup

## Prerequisites

- Docker Desktop (Postgres + Redis)
- Node.js 20+ and pnpm 9+

## 1. Start services

```bash
docker compose up -d
```

Postgres: `localhost:5432` (user: postgres, password: postgres, db: project_auto)  
Redis: `localhost:6379`

## 2. Environment

```bash
cp .env.example .env
# Edit .env if needed; defaults work for local Docker
```

**Required:**
- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string
- `COOKIE_SECRET` — Session cookie signing (dev default in .env.example)
- `NEXT_PUBLIC_API_URL` — API URL for web (default `http://localhost:3001`)

**Optional (dev):**
- `ALLOW_INSECURE_ADMIN=true` — Skip x-admin-key for Admin API
- `NEXT_PUBLIC_SHOW_ADMIN_LINK=true` — Show Admin link in user dashboard

## 3. Migrations

```bash
pnpm --filter @repo/db db:migrate
```

## 4. Run dev servers

Run each in its own terminal (or use `pnpm dev` for all):

```bash
pnpm --filter @repo/api dev    # API on port 3001
pnpm --filter @repo/worker dev # Worker (consumes queue jobs)
pnpm --filter @repo/web dev    # Web on port 3000
```

## 5. Auth & tenancy

- **Web app:** Sign up or log in via `/signup` or `/login`. Session cookie is used; `x-customer-id` is sent by the shared API client from `useAuth()`.
- **API calls:** Customer-scoped endpoints need `x-customer-id`. The web app provides this from `/auth/me` via `AuthProvider` / `useAuth()`.
- **Manual/curl:** Use `x-customer-id: <uuid>` header. Create a user via signup or insert into DB to get a customer_id.

## See also

- [23_local_docker_setup.md](23_local_docker_setup.md) — Docker details
- [31_phase1_auth_test_guide.md](31_phase1_auth_test_guide.md) — Auth flow testing
- [32_phases_2_4_ui_checklist.md](32_phases_2_4_ui_checklist.md) — Manual test checklist
