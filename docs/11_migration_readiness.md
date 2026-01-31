# Migration Readiness (GCP/AWS)

## Do now
1) Storage adapter: S3-like interface
2) Queue adapter: enqueue/dequeue interface
3) Docker workers only (no platform-specific runtimes)
4) Pure Postgres schema + migrations

## Migration steps (future)
### Phase 1: Move workers + queue
- Redis queue -> Pub/Sub (GCP) or SQS (AWS)
- Workers -> Cloud Run (GCP) or ECS/Fargate (AWS)
- Keep DB on Supabase until needed

### Phase 2: Move storage
- Supabase Storage -> GCS/S3

### Phase 3: Move DB (optional)
- Supabase Postgres -> Cloud SQL/RDS

## Success criteria
- No business logic changes required; only adapter implementations + env config.