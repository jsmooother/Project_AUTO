# Stack and Services

## Initial (Pick & choose)
- Vercel: Next.js web app
- Supabase:
  - Postgres (system of record)
  - Auth (users)
  - Storage (images, assets, repro bundles)
- Railway:
  - API service (Docker)
  - Worker service(s) (Docker)
- Redis:
  - Queue and short-lived cache

## Later migration targets (no rewrite)
- Queue: Redis -> Pub/Sub (GCP) or SQS (AWS)
- Workers: Railway -> Cloud Run (GCP) or ECS/Fargate (AWS)
- Storage: Supabase Storage -> GCS/S3
- DB: Supabase Postgres -> Cloud SQL/RDS (optional later)

## Required libraries (suggested)
- Node.js + TypeScript
- DB access: drizzle/prisma or sql + migrations (choose one; keep portable)
- Queue: BullMQ or custom minimal Redis queue wrapper
- Scraping: start with HTTP fetch + parsing; upgrade to Playwright/AgentQL only when needed
- Validation: zod
- Logging: pino (JSON)