# Local Dev Setup

## Environment variables
Set these in repo root .env (or export in shell):

DATABASE_URL=...
REDIS_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

## Running migrations
pnpm db:migrate

## Running API
pnpm --filter apps/api dev

## Running Worker
pnpm --filter apps/worker dev

## Minimal tenancy (MVP)
Use header:
x-customer-id: <uuid>

Create a customer row manually in DB or provide a seed script later.