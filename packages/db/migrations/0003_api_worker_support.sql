-- Migration: 0003_api_worker_support
-- job_id (TEXT everywhere: BullMQ IDs are string/number, not UUID).
-- support_cases: subject, description, scrape_run_id for API/worker.
-- Idempotent: ADD COLUMN IF NOT EXISTS for all.

ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS job_id TEXT;

-- support_cases in 0001 had only: customer_id, data_source_id, status, severity, created_at, updated_at
ALTER TABLE support_cases ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE support_cases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE support_cases ADD COLUMN IF NOT EXISTS scrape_run_id UUID REFERENCES scrape_runs(id) ON DELETE SET NULL;
